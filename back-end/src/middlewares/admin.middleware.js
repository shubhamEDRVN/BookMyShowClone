const ApiError = require('../utils/ApiError');

/**
 * Admin-only middleware - must be used after authenticate middleware
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }
  next();
};

/**
 * Theatre owner or admin middleware
 */
const theatreOwnerOrAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'theatre_owner'].includes(req.user.role)) {
    throw new ApiError(403, 'Theatre owner or admin access required');
  }
  next();
};

module.exports = { adminOnly, theatreOwnerOrAdmin };
