exports.ensureAuthenticated =
exports.ensureLoggedIn = function(options) {
    if (typeof options == 'string') {
      options = { redirectTo: options }
    }
    options = options || {};
    
    var url = options.redirectTo || '/login';
    var setReturnTo = (options.setReturnTo === undefined) ? true : options.setReturnTo;
    
    return function(req, res, next) {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        if (setReturnTo && req.session) {
          req.session.returnTo = req.originalUrl || req.url;
        }
        return res.redirect(url);
      }
      next();
    }
};

exports.ensureUnauthenticated =
exports.ensureNotAuthenticated =
exports.ensureLoggedOut =
exports.ensureNotLoggedIn = function(options) {
    if (typeof options == 'string') {
      options = { redirectTo: options }
    }
    options = options || {};
    
    var url = options.redirectTo || '/';
    
    return function(req, res, next) {
      if (req.isAuthenticated && req.isAuthenticated()) {
        return res.redirect(url);
      }
      next();
    }
};
