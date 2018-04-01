const Strategy = require('passport').Strategy;

class AuthorizationCodeStrategy extends Strategy {
    constructor(options, verify) {
        super(options, verify);
        if (typeof options == 'function') {
            verify = options;
            options = {};
        }
        if (!verify) throw new Error('OAuth 2.0 authorization code strategy requires a verify function');
        
        this.name = 'oauth2-code';
        this._verify = verify;
        this._passReqToCallback = options.passReqToCallback;
    }

    authenticate(req) {
        if (!req.body || (!req.body['client_id'])) {
            return this.fail();
        }
        var clientCode = req.body['code'];
        var clientId = req.body['client_id'];
        var clientSecret = req.body['client_secret'];
        var redirectURI = req.body['redirect_uri'];
        
        var self = this;
        
        function verified(err, client, info) {
            if (err) { return self.error(err); }
            if (!client) { return self.fail(); }
            self.success(client, info);
        }
        
        if (self._passReqToCallback) {
            this._verify(req, clientCode, clientId, clientSecret, redirectURI, verified);
        } else {
            this._verify(clientCode, clientId, clientSecret, redirectURI, verified);
        }
    }  
}

module.exports = AuthorizationCodeStrategy;
