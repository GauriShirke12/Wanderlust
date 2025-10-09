function wrapAsync(fn) {
  return function(req, res, next) {
    // Ensure both sync and async handlers are supported
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = wrapAsync;