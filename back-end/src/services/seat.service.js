const { getRedisClient } = require('../config/redis');
const Show = require('../models/Show');
const ApiError = require('../utils/ApiError');

const LOCK_TTL_SECONDS = 600; // 10 minutes

/**
 * Lock seats atomically using Redis MULTI/EXEC
 * Prevents race conditions by checking and setting locks in a transaction
 * @param {string} showId - Show ID
 * @param {string[]} seatIds - Array of seat IDs to lock
 * @param {string} userId - User ID requesting the lock
 * @returns {boolean} Whether all seats were locked
 */
const lockSeats = async (showId, seatIds, userId) => {
  const redis = getRedisClient();

  // Check if seats are already booked in MongoDB
  const show = await Show.findById(showId);
  if (!show) throw new ApiError(404, 'Show not found');

  for (const seatId of seatIds) {
    if (show.bookedSeats.includes(seatId)) {
      throw new ApiError(409, `Seat ${seatId} is already booked`);
    }
  }

  if (!redis || !redis.isReady) {
    // Fallback: use MongoDB locked seats
    return lockSeatsInMongo(showId, seatIds, userId);
  }

  // Use Lua script for atomic check-and-set to prevent race conditions
  const luaScript = `
    for i, key in ipairs(KEYS) do
      local existing = redis.call('GET', key)
      if existing and existing ~= ARGV[1] then
        return key
      end
    end
    for i, key in ipairs(KEYS) do
      redis.call('SET', key, ARGV[1], 'EX', ARGV[2])
    end
    return nil
  `;

  const keys = seatIds.map((seatId) => `lock:${showId}:${seatId}`);
  const conflictKey = await redis.eval(luaScript, {
    keys,
    arguments: [userId, String(LOCK_TTL_SECONDS)],
  });

  if (conflictKey) {
    const conflictSeat = conflictKey.split(':').pop();
    throw new ApiError(409, `Seat ${conflictSeat} is temporarily held by another user`);
  }

  return true;
};

/**
 * Fallback: lock seats in MongoDB when Redis is unavailable
 */
const lockSeatsInMongo = async (showId, seatIds, userId) => {
  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - LOCK_TTL_SECONDS * 1000);

  const show = await Show.findById(showId);

  for (const seatId of seatIds) {
    const existingLock = show.lockedSeats.find(
      (lock) => lock.seatId === seatId && lock.lockedAt > tenMinutesAgo
    );
    if (existingLock && existingLock.userId.toString() !== userId) {
      throw new ApiError(409, `Seat ${seatId} is temporarily held by another user`);
    }
  }

  // Remove expired locks and add new ones
  show.lockedSeats = show.lockedSeats.filter(
    (lock) => lock.lockedAt > tenMinutesAgo && !seatIds.includes(lock.seatId)
  );

  for (const seatId of seatIds) {
    show.lockedSeats.push({ seatId, userId, lockedAt: now });
  }

  await show.save();
  return true;
};

/**
 * Release locked seats
 * @param {string} showId - Show ID
 * @param {string[]} seatIds - Array of seat IDs to unlock
 * @param {string} userId - User ID requesting the unlock
 */
const unlockSeats = async (showId, seatIds, userId) => {
  const redis = getRedisClient();

  if (redis && redis.isReady) {
    const multi = redis.multi();
    for (const seatId of seatIds) {
      const lockKey = `lock:${showId}:${seatId}`;
      multi.del(lockKey);
    }
    await multi.exec();
  }

  // Also clean from MongoDB
  await Show.findByIdAndUpdate(showId, {
    $pull: {
      lockedSeats: {
        seatId: { $in: seatIds },
        userId,
      },
    },
  });
};

/**
 * Get seat status combining booked seats (MongoDB) and locked seats (Redis)
 * @param {string} showId - Show ID
 * @returns {Object} { bookedSeats, lockedSeats, availableCount }
 */
const getSeatStatus = async (showId) => {
  const show = await Show.findById(showId).populate('screen');
  if (!show) throw new ApiError(404, 'Show not found');

  const bookedSeats = show.bookedSeats || [];
  let lockedSeatIds = [];

  const redis = getRedisClient();
  if (redis && redis.isReady) {
    // Scan for lock keys for this show
    const keys = [];
    for await (const key of redis.scanIterator({ MATCH: `lock:${showId}:*`, COUNT: 100 })) {
      keys.push(key);
    }
    lockedSeatIds = keys.map((key) => key.split(':').pop());
  } else {
    // Fallback to MongoDB locks
    const tenMinutesAgo = new Date(Date.now() - LOCK_TTL_SECONDS * 1000);
    lockedSeatIds = show.lockedSeats
      .filter((lock) => lock.lockedAt > tenMinutesAgo)
      .map((lock) => lock.seatId);
  }

  const totalSeats = show.totalSeats || (show.screen ? show.screen.totalSeats : 0);
  const unavailable = new Set([...bookedSeats, ...lockedSeatIds]);

  return {
    bookedSeats,
    lockedSeats: lockedSeatIds,
    totalSeats,
    availableCount: totalSeats - unavailable.size,
  };
};

module.exports = { lockSeats, unlockSeats, getSeatStatus };
