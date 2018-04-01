'use strict';

const oauth2orize = require('oauth2orize');
const passport = require('passport');
const frappe = require('frappejs');
const utils = require('frappejs/utils');
const login = require('frappejs/utils/session');
// Create OAuth 2.0 server
const server = oauth2orize.createServer();

const expiry = 3600 // 1 hr in seconds

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated. To complete the transaction, the
// user must authenticate and approve the authorization request. Because this
// may involve multiple HTTP request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session. Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

server.serializeClient((client, done) => {
  done(null, client.id)
});

server.deserializeClient((id, done) => {
  frappe.db.get("OAuthClient", id)
  .then(success => success.name && done(null, mapOAuthClient(success)))
  .catch(error => done(error));
});

// Register supported grant types.
//
// OAuth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources. It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

// Grant authorization codes. The callback takes the `client` requesting
// authorization, the `redirectUri` (which is used as a verifier in the
// subsequent exchange), the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application. The application issues a code, which is bound to these
// values, and will be exchanged for an access token.

server.grant(oauth2orize.grant.code(async(client, redirectUri, user, ares, done) => {
  const code = utils.getUid(16);
  let data = {
    doctype: 'Session',
    clientId: client.id,
    redirectUri: redirectUri,
    username: user.id,
    authorizationCode: code
  }
  try {
    let session = await frappe.newDoc(data);
    await session.insert();
    await frappe.db.commit();
    return done(null, session.authorizationCode);
  } catch (error) {
    return done(error);   
  }
}));

// Grant implicit authorization. The callback takes the `client` requesting
// authorization, the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application. The application issues a token, which is bound to these
// values.

server.grant(oauth2orize.grant.token(async(client, user, ares, done) => {
  const token = utils.getUid(256);
  // set expiration time in ISO format
  let now = new Date();

  now.setHours(now.getSeconds() + expiry);
  let data = {
    doctype: 'Session',
    username: user.username,
    session: JSON.stringify(frappe.request.session),
    headers: JSON.stringify(frappe.request.headers),
    clientId: client.clientId,
    accessToken: token,
    expirationTime:now.toISOString(),
    expiry: expiry,
    redirectUri: client.redirectUri
  }
  try {
    let session = await frappe.newDoc(data);
    await session.insert();
    await frappe.db.commit();
    return done(null, session.accessToken);
  } catch (error) {
    return done(error);   
  }
}));

// Exchange authorization codes for access tokens. The callback accepts the
// `client`, which is exchanging `code` and any `redirectUri` from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the user who authorized the
// code.

server.exchange(oauth2orize.exchange.code(async(client, code, redirectUri, done) => {
  frappe.db.getAll({
    doctype: 'Session',
    fields: ["*"],
    filters: { authorizationCode:code, clientId:client.clientId },
    limit: 1
  }).then(async(success) =>{
    if(success.length) {
      success = success[0];
    } else {
      done(new Error("Invalid Authorization Code"));
    }
    if (client.id !== success.clientId) return done(null, false);
    if (redirectUri !== success.redirectUri) return done(null, false);

    let currentSession = success;
    currentSession.accessToken = utils.getUid(256);
    currentSession.refreshToken = utils.getUid(256);;
    currentSession.expiry = expiry;
    currentSession.session = JSON.stringify(frappe.request.session);
    currentSession.headers = JSON.stringify(frappe.request.headers);
    currentSession.redirectUri = redirectUri;
    currentSession.doctype = 'Session';
    // set expiration time in ISO format
    let now = new Date();
    now.setHours(now.getSeconds() + currentSession.expiry);
    currentSession.expirationTime = now.toISOString();

    // clear code for invalidating
    currentSession.authorizationCode = "";

    try {
      let session = await frappe.getDoc('Session', currentSession.name);
      session = Object.assign(session, currentSession);
      await session.update();
      await frappe.db.commit();
        
      let params = {
        "refresh_token":session.refreshToken, "expires_in": session.expiry
      };
      return done(null, session.accessToken, params);

    } catch (error) {
      return done(error);   
    }
  }).catch(error => done(error));
}));

// Exchange user id and password for access tokens. The callback accepts the
// `client`, which is exchanging the user's name and password from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the user who authorized the code.

server.exchange(oauth2orize.exchange.password((client, username, password, scope, done) => {
  // Validate the client
  frappe.db.get('OAuthClient', client.clientId).then(async(success)=>{
    // Validate the user
    try {
      let user = await frappe.db.get('User', username);
      if(!user) return(null, false);
      if(password != user.password) return done(null, false);
      const token = utils.getUid(256);

      let now = new Date();
      now.setHours(now.getSeconds() + expiry);
      let data = {
        doctype: 'Session',
        username: user.name,
        session: JSON.stringify(frappe.request.session),
        headers: JSON.stringify(frappe.request.headers),
        clientId: client.clientId,
        accessToken: token,
        refreshToken: utils.getUid(256),
        expirationTime: now.toISOString(),
        expiry: expiry,
        redirectUri: client.redirectUri
      }
      let accessToken = await frappe.newDoc(data);
      await accessToken.insert();
      await frappe.db.commit();
      let params = {
        "refresh_token":accessToken.refreshToken, "expires_in": accessToken.expiry
      };
      done(null, accessToken.accessToken, null, params);
    } catch (error) {
      done(error)
    }
  }).catch(error => done(error));
}));

// Refresh Token exchange, exchanges a fresh new bearer token for valid refresh token supplied

server.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done) {
  frappe.db.getAll({
    doctype: 'Session',
    filters: { refreshToken:refreshToken },
    limit: 1,
    fields: ["*"]
  }).then((success) => {
    if (success.length) {
      success = success[0];
      let now = new Date();
      now.setHours(now.getSeconds() + expiry);
      let currentSession = success;
      delete currentSession.name;
      currentSession.accessToken = utils.getUid(256);
      currentSession.refreshToken = utils.getUid(256);
      currentSession.expiry = expiry;
      currentSession.expirationTime = now.toISOString();
      currentSession.session = JSON.stringify(frappe.request.session);
      currentSession.headers = JSON.stringify(frappe.request.headers);
      frappe.db.insert('Session', currentSession).then((success) => {
        let params = {
          "refresh_token":currentSession.refreshToken, "expires_in": currentSession.expiry
        };
        done(null, currentSession.accessToken, null, params);
      });
    } else done(new Error("Invalid Refresh Token"));
  }).catch(error => done(error));
}));

// User authorization endpoint.
//
// `authorization` middleware accepts a `validate` callback which is
// responsible for validating the client making the authorization request. In
// doing so, is recommended that the `redirectUri` be checked against a
// registered value, although security requirements may vary accross
// implementations. Once validated, the `done` callback must be invoked with
// a `client` instance, as well as the `redirectUri` to which the user will be
// redirected after an authorization decision is obtained.
//
// This middleware simply initializes a new authorization transaction. It is
// the application's responsibility to authenticate the user and render a dialog
// to obtain their approval (displaying details about the client requesting
// authorization). We accomplish that here by routing through `ensureLoggedIn()`
// first, and rendering the `dialog` view.

module.exports.authorization = [
  login.ensureLoggedIn(),
  server.authorize(async(clientId, redirectUri, done) => {
    frappe.db.get("OAuthClient", clientId).then((client) => {
      if(!client.name) done(new Error("Client not registered"));
      if(client.redirectUri != redirectUri) done(new Error("Redirect URI Mismatch"));
      let oauthClient = mapOAuthClient(client)
      done(null, oauthClient, oauthClient.redirectUri);
    }).catch(e => done(e));
  }, (client, user, done) => {
    // Check if grant request qualifies for immediate approval

    // Auto-approve
    if (client.isTrusted) return done(null, true);

    return done(null, false);
    frappe.db.getAll({
      doctype: 'Session',
      filters: { username:user.id, clientId:client.clientId }
    })
    .then((success) => success.length && done(null, true))
    .catch(error => done(null, false));
  }),
  (request, response) => {
    response.render('www/dialog', { transactionId: request.oauth2.transactionID, user: request.user, client: request.oauth2.client });
  },
];

// User decision endpoint.
//
// `decision` middleware processes a user's decision to allow or deny access
// requested by a client application. Based on the grant type requested by the
// client, the above grant middleware configured above will be invoked to send
// a response.

exports.decision = [
  login.ensureLoggedIn(),
  server.decision(),
];

// Token endpoint.
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens. Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request. Clients must
// authenticate when making requests to this endpoint.

exports.token = [
  passport.authenticate(
    [
      'oauth2-client-password',
      'oauth2-code',
      'oauth2-refresh-token',
      'basic'
    ],
    { session: false }),
  server.token(),
  server.errorHandler(),
];

function mapOAuthClient(client){
  return {
    id: client.name,
    name: client.appName,
    clientId: client.name,
    clientSecret: client.clientSecret,
    isTrusted: client.isTrusted,
    redirectUri: client.redirectUri
  }
}