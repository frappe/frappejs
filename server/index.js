const backends = {};
backends.sqlite = require('frappejs/backends/sqlite');
//backends.mysql = require('frappejs/backends/mysql');

const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const chokidar = require('chokidar');
const frappe = require('frappejs');
const common = require('frappejs/common');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const frappeModels = require('frappejs/models');
const auth = require('./../auth/auth')();
const { addWebpackMiddleware } = require('../webpack/serve');
const { getAppConfig } = require('../webpack/utils');

frappe.conf = getAppConfig();

require.extensions['.html'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

let serverInitialised = false;

module.exports = {
    async start({backend, connectionParams, models, authConfig=null}) {
      if (serverInitialised) {
        console.log('Refreshing frappe..');
        await this.initFrappe(models, backend, connectionParams);
        console.log(await frappe.getDoc('SystemSettings', 'SystemSettings'));
        return;
      }

      serverInitialised = true;

      console.log('Server starting..');

        await this.initFrappe(models, backend, connectionParams);

        // app
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        app.use(express.static(frappe.conf.distPath));
        app.use('/static', express.static(frappe.conf.staticPath))

        app.use(morgan('tiny'));

        if (connectionParams.enableCORS) {
            app.use(cors());
        }

        if(authConfig) {
            this.setupAuthentication(app, authConfig);
        }

        // socketio
        io.on('connection', function (socket) {
            frappe.db.bindSocketServer(socket);
        });

        // rest routes
        app.use(function(req, res, next) {
          require('./restAPI')(req, res, next);
        });

        if (process.env.NODE_ENV === 'development') {
            // webpack dev server
            addWebpackMiddleware(app);

            console.log(path.resolve(__dirname, '..'), frappe.conf.appDir);
            // watch server routes
            const watcher = chokidar.watch([path.resolve(__dirname, '..'), frappe.conf.appDir], {
              ignored: '*.vue, *.html, *.css, *.scss'
            });

            watcher.on('ready', () => {
              watcher.on('all', () => {
                console.log('Clearing server cache');
                Object.keys(require.cache).forEach((id) => {
                  if (!id.match(/node_modules/) && !id.endsWith('frappejs/server/index.js') && !id.endsWith('frappejs/index.js')) {
                    delete require.cache[id]
                  }
                })
                // require the startup file
                require(path.resolve(frappe.conf.appDir, frappe.conf.node.paths.main));
              })
            })
        }

        frappe.conf.port = frappe.conf.dev.devServerPort;

        // listen
        server.listen(frappe.conf.port, () => {
            console.log(`FrappeJS server running on http://localhost:${frappe.conf.port}`)
        });

        frappe.app = app;
        frappe.server = server;
    },

    async initFrappe(models, backend, connectionParams) {
        frappe.isServer = true;
        await frappe.init();
        frappe.registerModels(frappeModels, 'server');
        if (models) {
            frappe.registerModels(models, 'server');
        }
        frappe.registerLibs(common);

        await frappe.login('Administrator');

        // database
        await this.initDb(backend, connectionParams);
    },

    async initDb(backend, connectionParams) {
        frappe.db = await new backends[backend](connectionParams);
        await frappe.db.connect();
        await frappe.db.migrate();
    },

    setupAuthentication(app, authConfig) {
        app.post("/api/signup", auth.signup);
        app.post("/api/login", auth.login);
        app.use(auth.initialize(authConfig));
        app.all("/api/resource/*", auth.authenticate());
    }
}
