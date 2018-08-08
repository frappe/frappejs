const frappe = require('frappejs');
const Observable = require('frappejs/utils/observable');

module.exports = class HTTPClient extends Observable {
    constructor({ server, protocol = 'http' }) {
        super();

        this.server = server;
        this.protocol = protocol;
        frappe.config.serverURL = this.getURL(this.server);

        // if the backend is http, then always client!
        frappe.isServer = false;

        this.initTypeMap();
    }

    connect() {

    }

    async insert(doctype, doc) {
        doc.doctype = doctype;
        let parts = ['/api/resource', doctype],
            fetchParams = {
                method: 'POST',
                body: JSON.stringify(doc)
            };

        await this.sync(fetchParams, parts);
        return await this.fetch(this.getURL(this.server, ...parts), fetchParams);
    }

    async get(doctype, name) {
        let url = this.getURL(this.server, '/api/resource', doctype, name);
        return await this.fetch(url, {
            method: 'GET',
            headers: this.getHeaders()
        })
    }

    async getAll({ doctype, fields, filters, start, limit, sort_by, order }) {
        let url = this.getURL(this.server, '/api/resource', doctype);

        url = url + "?" + frappe.getQueryString({
            fields: JSON.stringify(fields),
            filters: JSON.stringify(filters),
            start: start,
            limit: limit,
            sort_by: sort_by,
            order: order
        });

        return await this.fetch(url, {
            method: 'GET',
        });
    }

    async sync(fetchParams, parts) {
        return await Promise.all(
            frappe.config.siblings.map(url => {
                this.fetch(this.getURL(url, ...parts), fetchParams);
            })
        );
    }

    async update(doctype, doc) {
        doc.doctype = doctype;
        let parts = ['/api/resource', doctype, doc.name],
            fetchParams = {
                method: 'PUT',
                body: JSON.stringify(doc)
            };

        await this.sync(fetchParams, parts);
        return await this.fetch(this.getURL(this.server, ...parts), fetchParams);
    }

    async delete(doctype, name) {
        let parts = ['/api/resource', doctype, name],
            fetchParams = {
                method: 'DELETE',
            };

        await this.sync(fetchParams, parts);
        return await this.fetch(this.getURL(this.server, ...parts), fetchParams);
    }

    async deleteMany(doctype, names) {
        let parts = ['/api/resource', doctype],
            fetchParams = {
                method: 'DELETE',
                body: JSON.stringify(names)
            };

        await this.sync(fetchParams, parts);
        return await this.fetch(this.getURL(this.server, ...parts), fetchParams);
    }

    async exists(doctype, name) {
        return (await this.getValue(doctype, name, 'name')) ? true : false;
    }

    async getValue(doctype, name, fieldname) {
        let url = this.getURL(this.server, '/api/resource', doctype, name, fieldname);

        return (await this.fetch(url, {
            method: 'GET',
        })).value;
    }

    async fetch(url, args) {
        args.headers = this.getHeaders();
        let response = await frappe.fetch(url, args);
        let data = await response.json();

        if (response.status !== 200) {
            throw Error(data.error);
        }

        return data;
    }

    getURL(server, ...parts) {
        return this.protocol + '://' + server + (parts || []).join('/');
    }

    getHeaders() {
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        if (frappe.session && frappe.session.token) {
            headers.token = frappe.session.token;
        };
        return headers;
    }

    initTypeMap() {
        this.typeMap = {
            'Autocomplete': true
            , 'Currency': true
            , 'Int': true
            , 'Float': true
            , 'Percent': true
            , 'Check': true
            , 'Small Text': true
            , 'Long Text': true
            , 'Code': true
            , 'Text Editor': true
            , 'Date': true
            , 'Datetime': true
            , 'Time': true
            , 'Text': true
            , 'Data': true
            , 'Link': true
            , 'DynamicLink': true
            , 'Password': true
            , 'Select': true
            , 'Read Only': true
            , 'File': true
            , 'Attach': true
            , 'Attach Image': true
            , 'Signature': true
            , 'Color': true
            , 'Barcode': true
            , 'Geolocation': true
        }
    }

    close() {

    }

}