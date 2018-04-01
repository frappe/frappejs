const frappe = require('frappejs');
const Store = require('express-session/session/store');

/**
* FrappeSessionStore Express's session Store.
*/
module.exports = class FrappeSessionStore extends Store {
    /**
    * Initialize SessionStore with the given `options`.
    *
    * @api public
    */
    constructor(options){
        // call express's session store's constructor
        super(options);
        options = options || {};
        options.expires = options.expires || 1 * 24 * 60 * 60 * 1000; // in ms
        this.expires = options.expires;
    }

    async get(sid, callback){
        let session = await frappe.db.get("Session", sid);
        if(typeof session.session === "string"){
            callback(null, JSON.parse(session.session));
        } else if(typeof session.session === "object"){
            callback(null, session.session);
        } else {
            callback(null, null);
        }
    }

    async set(sid, session, callback){
        var data = {
            doctype: 'Session',
            name: sid,
            headers: JSON.stringify(frappe.request.headers),
            expirationTime: session.cookie.expires,
            username: session.passport && session.passport.user || "",
            expires:  this._calculateExpiration(session.cookie),
            session: JSON.stringify(session),
        };
        try {
            let storedSession = await frappe.getDoc('Session', sid);
            storedSession.headers = data.headers;
            storedSession.expirationTime = data.expirationTime;
            storedSession.username = data.username;
            storedSession.expires = data.expires;
            storedSession.session = data.session;
            await storedSession.update();
            await frappe.db.commit();
            callback(null, storedSession.session);
        } catch (error) {
            let newSession = await frappe.newDoc(data);
            await newSession.insert();
            await frappe.db.commit();
            callback(null, newSession.session);
        }
        let sessions = await frappe.db.getAll({doctype:'Session', filters: {name:sid}});
        if(!sessions.length) callback(new Error("Session not found"));
    }

    _calculateExpiration(cookie) {
        var expires;
        if(cookie && cookie.expires) {
            expires = cookie.expires;
        }
        else {
            expires = new Date(Date.now() + this.expires);
        }
        expires = Math.round(expires.getTime() / 1000);
        return expires;
    }

    destroy (sid, callback) {
        callback = callback || function(){};
        frappe.db.delete('Session', sid).then((success) => {
            callback(null, success);
        }).catch(error => callback(error, null));
    }

    async clearExpiredSession(callback) {
        let sessions = await frappe.db.getAll({
            doctype: 'Session',
            filters: { expirationTime: ["<", Math.round(Date.now() / 1000)] }
        }).catch( e => callback(e, null))

        for (const session of sessions) {
            frappe.db.delete('Session', session.name);
            callback(null, session.session);
        }
    };
}
