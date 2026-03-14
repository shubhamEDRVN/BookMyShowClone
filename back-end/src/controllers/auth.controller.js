const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');
const { sendOTP, generateOTP } = require('../services/sms.service');
const { getRedisClient } = require('../config/redis');

const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const OTP_TTL_SECONDS = 300; // 5 minutes

/**
 * POST /api/v1/auth/register
 * Register a new user and send verification email
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, city } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  const emailVerifyToken = crypto.randomBytes(32).toString('hex');

  const user = await User.create({
    name,
    email,
    passwordHash: password,
    phone,
    city,
    emailVerifyToken,
  });

  // Send verification email (non-blocking)
  sendVerificationEmail(email, name, emailVerifyToken).catch((err) =>
    console.error('Email send failed:', err.message)
  );

  const accessToken = generateAccessToken({ userId: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user._id });

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res
    .status(201)
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(new ApiResponse(201, { user, accessToken }, 'Registration successful'));
});

/**
 * POST /api/v1/auth/login
 * Login user and return tokens
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const accessToken = generateAccessToken({ userId: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user._id });

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(new ApiResponse(200, { user, accessToken }, 'Login successful'));
});

/**
 * POST /api/v1/auth/logout
 * Clear refresh token
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
  }

  res
    .clearCookie('refreshToken')
    .json(new ApiResponse(200, null, 'Logged out successfully'));
});

/**
 * POST /api/v1/auth/refresh-token
 * Issue new access token using refresh token
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) {
    throw new ApiError(401, 'Refresh token is required');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.userId);
  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const accessToken = generateAccessToken({ userId: user._id, role: user.role });
  const newRefreshToken = generateRefreshToken({ userId: user._id });

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  res
    .cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(new ApiResponse(200, { accessToken }, 'Token refreshed'));
});

/**
 * POST /api/v1/auth/verify-email
 * Verify email using token from link
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    throw new ApiError(400, 'Verification token is required');
  }

  const user = await User.findOne({ emailVerifyToken: token });
  if (!user) {
    throw new ApiError(400, 'Invalid or expired verification token');
  }

  user.isEmailVerified = true;
  user.emailVerifyToken = undefined;
  await user.save({ validateBeforeSave: false });

  res.json(new ApiResponse(200, null, 'Email verified successfully'));
});

/**
 * POST /api/v1/auth/forgot-password
 * Send password reset email
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal whether user exists
    return res.json(new ApiResponse(200, null, 'If the email exists, a reset link has been sent'));
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);
  await user.save({ validateBeforeSave: false });

  sendPasswordResetEmail(email, user.name, resetToken).catch((err) =>
    console.error('Password reset email failed:', err.message)
  );

  res.json(new ApiResponse(200, null, 'If the email exists, a reset link has been sent'));
});

/**
 * POST /api/v1/auth/reset-password/:token
 * Reset password with token
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  user.passwordHash = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined;
  await user.save();

  res.json(new ApiResponse(200, null, 'Password reset successful'));
});

/**
 * POST /api/v1/auth/send-otp
 * Send OTP to phone number
 */
const sendOTPHandler = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    throw new ApiError(400, 'Phone number is required');
  }

  const otp = generateOTP();

  // Store OTP in Redis with 5-minute TTL
  const redis = getRedisClient();
  if (redis && redis.isReady) {
    await redis.setEx(`otp:${phone}`, OTP_TTL_SECONDS, otp);
  }

  await sendOTP(phone, otp);

  res.json(new ApiResponse(200, null, 'OTP sent successfully'));
});

/**
 * POST /api/v1/auth/verify-otp
 * Verify OTP for phone
 */
const verifyOTPHandler = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    throw new ApiError(400, 'Phone and OTP are required');
  }

  const redis = getRedisClient();
  if (!redis || !redis.isReady) {
    throw new ApiError(503, 'OTP verification unavailable');
  }

  const storedOTP = await redis.get(`otp:${phone}`);
  if (!storedOTP || storedOTP !== otp) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  await redis.del(`otp:${phone}`);

  // Mark phone as verified
  await User.findOneAndUpdate({ phone }, { isPhoneVerified: true });

  res.json(new ApiResponse(200, null, 'Phone verified successfully'));
});

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  sendOTPHandler,
  verifyOTPHandler,
};
