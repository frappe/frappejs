const Strategy = require('passport').Strategy;
const lookup = require('frappejs/utils').lookup;

class LocalStrategy extends Strategy {
    constructor(options, verify) {
        super(options, verify);
        if (typeof options == 'function') {
            verify = options;
            options = {};
        }
        if (!verify) { throw new TypeError('LocalStrategy requires a verify callback'); }
    
        this._usernameField = options.usernameField || 'username';
        this._passwordField = options.passwordField || 'password';
        
        this.name = 'local';
        this._verify = verify;
        this._passReqToCallback = options.passReqToCallback;  
    }

    authenticate(req, options) {
        options = options || {};
        var username = lookup(req.body, this._usernameField) || lookup(req.query, this._usernameField);
        var password = lookup(req.body, this._passwordField) || lookup(req.query, this._passwordField);
        
        if (!username || !password) {
            return this.fail({ message: options.badRequestMessage || 'Missing credentials' }, 400);
        }
        
        var self = this;
        
        function verified(err, user, info) {
            if (err) { return self.error(err); }
            if (!user) { return self.fail(info); }
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

module.exports = LocalStrategy;
