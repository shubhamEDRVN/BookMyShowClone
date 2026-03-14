/**
 * Wraps an async route handler to catch errors and pass them to next()
 * @param {Function} fn - async route handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
