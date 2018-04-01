'use strict';

const passport = require('passport');
const LocalStrategy = require('frappejs/server/middleware/LocalStrategy');
const ClientPasswordStrategy = require('frappejs/server/middleware/ClientPasswordStrategy');
const BearerStrategy = require('frappejs/server/middleware/BearerStrategy');
const AuthorizationCodeStrategy = require('frappejs/server/middleware/AuthorizationCodeStrategy');
const RefreshTokenStrategy = require('frappejs/server/middleware/RefreshTokenStrategy');
const FrappeAuthentication = require('frappejs/server/middleware/FrappeAuthentication');

const frappe = require('frappejs');

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
passport.use(new LocalStrategy({ passReqToCallback:true }, function(req, username, password, done){
  frappe.db.get("User", username).then((success) => {
    if (!success.name) return done(null, false);
    if (success.password !== password) return done(null, false);
    let user = createUserFromDocType(success);
    return done(null, user);
  }).catch((error) => {
    done(error);
  });
}));

passport.serializeUser((user, done) => done(null, user.username));

passport.deserializeUser((username, done) => {
  frappe.db.get("User", username).then((success) => {
    const user = createUserFromDocType(success);
    done(null, user);
  }).catch(error => done(error, null));
});

/**
 * ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered OAuth clients. They are
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens. The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate. Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the `Authorization` header). While this approach is not recommended by
 * the specification, in practice it is quite common.
 */
passport.use(new ClientPasswordStrategy({ passReqToCallback:true },
  function(req, clientId, username, password, verified) {
  frappe.db.get("OAuthClient", clientId).then((success) => {
    if (success.name) {
      let client = createClientFromDocType(success);
      return verified(null, client);
    } else {
      return verified(null, false);
    }
  }).catch((error) => {
    verified(error);
  });
}));

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate either users or clients based on an access token
 * (aka a bearer token). If a user, they must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
passport.use(new BearerStrategy( { passReqToCallback:true },
  async(req, accessToken, done) => {
    // if (req.headers['Authorization'] == "Bearer"){}
    let filters = {accessToken:accessToken}
    var bearerToken = null;
    try {
      bearerToken = await frappe.db.getValue('Session', JSON.stringify(filters));
      if (!bearerToken) return done(null, false);
      if (bearerToken.username) {
        frappe.db.get("User", username).then((success) => {
          if (!success.username) return done(null, false);
          const user = createUserFromDocType(success);
          // To keep this example simple, restricted scopes are not implemented,
          // and this is just for illustrative purposes.
          done(null, user, { scope: '*' });
        }).catch(error => done(error));
      } else {
        let session = await frappe.db.get('Session', bearerToken);
        frappe.db.get("OAuthClient", session.clientId).then((success) => {
          if (!success.name) return done(null, false);
          let client = createClientFromDocType(success);
          // To keep this example simple, restricted scopes are not implemented,
          // and this is just for illustrative purposes.
          done(null, client, { scope: '*' });
        }).catch(error => done(error));
      }
    } catch (error) {
      if (error) return done(error);
    }
  }
));

/**
 * The OAuth 2.0 authorization code authentication strategy authenticates
 * clients using a client ID and client secret. The strategy requires a verify callback,
 * which accepts those credentials and calls done providing a client.
 */
passport.use(new AuthorizationCodeStrategy( {passReqToCallback:true},
  async function(req, clientCode, clientId, clientSecret, redirectURI, verified) {
    // verified(err, client, info);
    if (req.body.grant_type == 'authorization_code'){
      frappe.db.getAll({
        doctype: 'Session',
        filters: { authorizationCode:clientCode },
        limit: 1,
        fields: ["*"]
      }).then(async(success)=>{
        let client = await frappe.db.get('OAuthClient', clientId);
        let oauthClient = createClientFromDocType(client);
        if(success.length){
          verified(null, oauthClient, null);
        } else {
          verified(new Error("Invalid Authorization Code"), null, null);
        }
      }).catch(error => verified(error, null, null));
    } else verified(null, null, null);
  }
));

/**
 * The OAuth 2.0 authorization refresh token strategy authenticates
 * clients using a client ID and refresh token. The strategy requires a verify callback,
 * which accepts those credentials and calls done providing a client.
 */
passport.use(new RefreshTokenStrategy( {passReqToCallback:true},
  async function(req, refreshToken, clientId, redirectURI, verified) {
    // verified(err, client, info);
    if (req.body.grant_type == 'refresh_token') {
      frappe.db.getAll({
        doctype: 'Session',
        filters: { refreshToken:refreshToken },
        limit: 1,
        fields: ["*"]
      }).then(async(success)=>{
        let client = await frappe.db.get('OAuthClient', clientId);
        let oauthClient = createClientFromDocType(client);
        if(success.length){
          let user = await frappe.db.get('User', success[0].username);
          verified(null, createUserFromDocType(user), null);
        } else {
          verified(new Error("Invalid Refresh Code"), null, null);
        }
      }).catch(error => verified(error, null, null));
    } else verified(null, null, null);
  }
));

passport.use(new FrappeAuthentication({passReqToCallback:true},
  async function(req, username, password, verified) {
    // verified(err, client, info);
    if(req.session.passport && req.session.passport.user){
      let user = createUserFromDocType(await frappe.db.get('User', req.session.passport.user));
      frappe.session.user = user.username;
      verified(null, user);
    } else if (req.headers.authorization && req.headers.authorization.split(" ")[0].toLowerCase() == "bearer"){
      // Bearer Token
      let accessToken = req.headers.authorization.split(" ")[1];
      let session = await frappe.db.getAll({
        doctype:'Session',
        filters: {accessToken:accessToken},
        limit: 1,
        fields: ["name", "username"]
      });
      if (session.length == 1) {
        session = session[0];
        let user = createUserFromDocType(await frappe.db.get('User', session.username));
        frappe.session.user = user.username;
        verified(null, user);
      } else {
        verified(new Error("Invalid Access Token"));
      }
    } else {
      // delete guest session
      verified(new Error("Error Frappe Authentication"));
    }
  }
));

function createUserFromDocType(userDoc) {
  return {
    id: userDoc.name,
    username: userDoc.name,
    // password: userDoc.password,
    name: userDoc.fullName
  };
}

function createClientFromDocType(doc) {
  return {
    id: doc.name,
    name: doc.name,
    clientId: doc.name,
    clientSecret: doc.clientSecret,
    isTrusted: doc.isTrusted
  };
}
