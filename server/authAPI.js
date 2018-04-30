const frappe = require('frappejs');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const session = require('express-session');
const passport = require('passport');
const nunjucks = require('nunjucks');
const path = require('path');
const routes = require('./routes');
const FrappeSessionStore = require('frappejs/server/middleware/FrappeSessionStore');
const login = require('frappejs/utils/session');

module.exports = {
    async setup(app, config=null) {
        this.setupFrappeApp(app, config);
        this.setupTemplating(app, config);
        app.use(cookieParser(config.session.cookieSecret));
        app.use(bodyParser.json({ extended: false }));
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(errorHandler());
        this.setupSession(app, config);
        app.use(passport.initialize());
        app.use(passport.session());

        // Passport configuration
        require('./auth');

        app.get('/', (request, response) => response.redirect('/app'));
        app.get('/app', login.ensureLoggedIn(), (req, res)=> res.render('./www/app'));
        app.get('/login', routes.site.loginForm);
        app.post('/login', routes.site.login);
        app.get('/logout', routes.site.logout);
        app.get('/account', routes.site.account);

        app.get('/dialog/authorize', routes.oauth2.authorization);
        app.post('/dialog/authorize/decision', routes.oauth2.decision);
        app.post('/oauth/token', routes.oauth2.token);
        app.post('/oauth/revoke', routes.oauth2.revoke);

        app.get('/api/userinfo', routes.user.info);
        app.get('/api/clientinfo', routes.client.info);
        app.all("/api/resource/*", routes.site.generalRoute);
    },

    setupTemplating(app, config){
        const nunjucksEnv = nunjucks.configure([path.resolve(__dirname, '../'), config.templateDir], {
            express: app
        });

        nunjucksEnv.addFilter('log', console.log);

        // setup engine
        app.engine('html', nunjucks.render);
        app.set('view engine', 'html');
        app.set('view options', { layout: true });
    },

    setupSession(app, config=null){
        let sess = {
            saveUninitialized: true,
            resave: false,
            store: new FrappeSessionStore({expires:config.session.expires}),
            secret: config.session.secret,
            cookie : { maxAge: config.session.cookieMaxAge, httpOnly: false }
        };

        if (app.get('env') === 'production') {
            app.set('trust proxy', 1) // trust first proxy
            sess.cookie.secure = true // serve secure cookies
        }
        app.use(session(sess));
    },

    setupFrappeApp(app, config){
        app.use((req, res, next) => {
            if (config.requestLogging) console.log(`[${req.method}] ${req.url}`);
            frappe.request = req;
            frappe.response = res;
            next();
        });
    }
};
