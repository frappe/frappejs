const Strategy = require('passport').Strategy;

class ClientPasswordStrategy extends Strategy {
    constructor(options, verify) {
        super(options, verify);
        if (typeof options == 'function') {
            verify = options;
            options = {};
        }
        if (!verify) throw new Error('OAuth 2.0 client password strategy requires a verify function');

        this.name = 'oauth2-client-password';
        this._verify = verify;
        this._passReqToCallback = options.passReqToCallback;
    }

    authenticate(req, options) {
        if (!req.body || (!req.body['client_id'])) {
            return this.fail();
        }
        
        var clientId = req.body['client_id'];
        var username = req.body['username'];
        var password = req.body['password'];
        
        var self = this;

        function verified(err, client, info) {
            if (err) { return self.error(err); }
            if (!client) { return self.fail(); }
            self.success(client, info);
        }

        if (self._passReqToCallback) {
            this._verify(req, clientId, username, password, verified);
        } else {
            this._verify(clientId, username, password, verified);
        }
    }  
}

module.exports = ClientPasswordStrategy;
