'use strict';

const passport = require('passport');
const login = require('frappejs/utils/session');

module.exports.loginForm = (request, response) => response.render('www/login');

module.exports.login = passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/login' });

module.exports.logout = (request, response) => {
  request.session.destroy();
  request.logout();
  response.redirect('/');
};

module.exports.account = [
  login.ensureLoggedIn(),
  (request, response) => response.render('www/account', { user: request.user }),
];

module.exports.generalRoute = passport.authenticate('frappe-authentication', {failureRedirect: '/login' });