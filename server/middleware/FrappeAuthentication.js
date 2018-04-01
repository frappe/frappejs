const Strategy = require('passport').Strategy;

class FrappeAuthentication extends Strategy {
  constructor(options, verify) {
    super(options, verify);
    if (typeof options == 'function') {
      verify = options;
      options = {};
    }
    if (!verify) { throw new TypeError('FrappeAuthentication requires a verify callback'); }
  
    this.name = 'frappe-authentication';
    this._verify = verify;
    this._passReqToCallback = options.passReqToCallback;  
  }

  authenticate(req, options) {
    options = options || {};
    let authorized = 1;
    if (!authorized) {
      return this.fail({ message: options.badRequestMessage || 'Missing credentials' }, 400);
    }
    let username = req.body.username, 
        password = req.body.password
    var self = this;
    
    function verified(err, user, info) {
      if (err) { return self.redirect(options.failureRedirect || '/login'); }
      if (!user) { return self.redirect(options.failureRedirect || '/login'); }
      self.success(user, info);
    }
    
    try {
      if (self._passReqToCallback) {
        this._verify(req, username, password, verified);
      } else {
        this._verify(username, password, verified);
      }
    } catch (ex) {
      return self.error(ex);
    }
  }
  
}

module.exports = FrappeAuthentication;
