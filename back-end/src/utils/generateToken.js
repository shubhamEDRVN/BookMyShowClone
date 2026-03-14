const jwt = require('jsonwebtoken');

/**
 * Generate JWT access token (short-lived)
 * @param {Object} payload - Token payload { userId, role }
 * @returns {string} JWT token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
  });
};

/**
 * Generate JWT refresh token (long-lived)
 * @param {Object} payload - Token payload { userId }
 * @returns {string} JWT token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
