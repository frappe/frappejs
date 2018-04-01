const Strategy = require('passport').Strategy;

class RefreshTokenStrategy extends Strategy {
    constructor(options, verify) {
        super(options, verify);
        if (typeof options == 'function') {
            verify = options;
            options = {};
        }

        if (!verify) throw new Error('OAuth 2.0 refresh token strategy requires a verify function');

        this.name = 'oauth2-refresh-token';
        this._verify = verify;
        this._passReqToCallback = options.passReqToCallback;    
    }

    authenticate(req) {
        if (!req.body || (!req.body['client_id'])) {
        return this.fail();
        }
        var refreshToken = req.body['refresh_token'];
        var clientId = req.body['client_id'];
        var redirectURI = req.body['redirect_uri'];

        var self = this;

        function verified(err, client, info) {
            if (err) { return self.error(err); }
            if (!client) { return self.fail(); }
            self.success(client, info);
        }

        if (self._passReqToCallback) {
            this._verify(req, refreshToken, clientId, redirectURI, verified);
        } else {
            this._verify(refreshToken, clientId, redirectURI, verified);
        }
    }
}

module.exports = RefreshTokenStrategy;
