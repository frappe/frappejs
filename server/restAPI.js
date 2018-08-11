const frappe = require('frappejs');
const path = require('path');
const multer = require('multer');

module.exports = {
    setup(app) {
        // get list
        app.get('/api/resource/:doctype', frappe.asyncHandler(async function(request, response) {
            for (let key of ['fields', 'filters']) {
                if (request.query[key]) {
                    request.query[key] = JSON.parse(request.query[key]);
                }
            }

            let data = await frappe.db.getAll({
                doctype: request.params.doctype,
                fields: request.query.fields,
                filters: request.query.filters,
                start: request.query.start || 0,
                limit: request.query.limit || 20,
                order_by: request.query.order_by,
                order: request.query.order
            });

            return response.json(data);
        }));

        // create
        app.post('/api/resource/:doctype', frappe.asyncHandler(async function(request, response) {
            let data = request.body;
            data.doctype = request.params.doctype;
            let doc = frappe.newDoc(data);
            await doc.insert();
            await frappe.db.commit();
            return response.json(doc.getValidDict());
        }));

        // update
        app.put('/api/resource/:doctype/:name', frappe.asyncHandler(async function(request, response) {
            let data = request.body;
            let doc = await frappe.getDoc(request.params.doctype, request.params.name);
            Object.assign(doc, data);
            await doc.update();
            await frappe.db.commit();
            return response.json(doc.getValidDict());
        }));


        // get document
        app.get('/api/resource/:doctype/:name', frappe.asyncHandler(async function(request, response) {
            let doc = await frappe.getDoc(request.params.doctype, request.params.name);
            return response.json(doc.getValidDict());
        }));

        // get value
        app.get('/api/resource/:doctype/:name/:fieldname', frappe.asyncHandler(async function(request, response) {
            let value = await frappe.db.getValue(request.params.doctype, request.params.name, request.params.fieldname);
            return response.json({value: value});
        }));

        // delete
        app.delete('/api/resource/:doctype/:name', frappe.asyncHandler(async function(request, response) {
            let doc = await frappe.getDoc(request.params.doctype, request.params.name)
            await doc.delete();
            return response.json({});
        }));

        // delete many
        app.delete('/api/resource/:doctype', frappe.asyncHandler(async function(request, response) {
            let names = request.body;
            for (let name of names) {
                let doc = await frappe.getDoc(request.params.doctype, name);
                await doc.delete();
            }
            return response.json({});
        }));

        const storage = multer.diskStorage({
            destination: 'dist/static/attachments/',
            filename: function (req, file, callback) {
              callback(null, Date.now() + path.extname(file.originalname));
            }
        });
        const upload = multer({ storage: storage });

        app.post('/api/upload', upload.array('attachments') ,frappe.asyncHandler(async function(request, response) {
            let attachments = request.files;
            let attachmentsPath = [];
            if(attachments){
                for(let attachment of attachments){
                    attachmentsPath.push(attachment.path);
                }
                response.json(attachmentsPath);
            }else {
                response.json('failed');
            }
        }));

        app.delete('/api/upload/:path', frappe.asyncHandler(async function(request, response){
            //delete local saved file
        }));

    }
};
