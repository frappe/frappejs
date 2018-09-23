const express = require('express');
const router = express.Router();
const frappe = require('frappejs');
const path = require('path');
const multer = require('multer');
const { asyncHandler } = require('frappejs/utils');
const { handlePDFRequest } = require('frappejs/server/pdf');

router.get('/api/resource/:doctype', asyncHandler(async function (request, response) {
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
router.post('/api/resource/:doctype', asyncHandler(async function (request, response) {
  let data = request.body;
  data.doctype = request.params.doctype;
  let doc = frappe.newDoc(data);
  await doc.insert();
  await frappe.db.commit();
  return response.json(doc.getValidDict());
}));

// update
router.put('/api/resource/:doctype/:name', asyncHandler(async function (request, response) {
  let data = request.body;
  let doc = await frappe.getDoc(request.params.doctype, request.params.name);
  Object.assign(doc, data);
  await doc.update();
  await frappe.db.commit();
  return response.json(doc.getValidDict());
}));

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, frappe.conf.staticPath)
    },
    filename: (req, file, cb) => {
      const filename = file.originalname.split('.')[0];
      const extension = path.extname(file.originalname);
      const now = Date.now();
      cb(null, filename + '-' + now + extension);
    }
  })
});

router.post('/api/upload/:doctype/:name/:fieldname', upload.array('files', 10), asyncHandler(async function (request, response) {
  const files = request.files;
  const { doctype, name, fieldname } = request.params;

  let fileDocs = [];
  for (let file of files) {
    const doc = frappe.newDoc({
      doctype: 'File',
      name: path.join('/', file.path),
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      referenceDoctype: doctype,
      referenceName: name,
      referenceFieldname: fieldname
    });
    await doc.insert();

    await frappe.db.setValue(doctype, name, fieldname, doc.name);

    fileDocs.push(doc.getValidDict());
  }

  return response.json(fileDocs);
}));

// get document
router.get('/api/resource/:doctype/:name', asyncHandler(async function (request, response) {
  let doc = await frappe.getDoc(request.params.doctype, request.params.name);
  return response.json(doc.getValidDict());
}));

// get value
router.get('/api/resource/:doctype/:name/:fieldname', asyncHandler(async function (request, response) {
  let value = await frappe.db.getValue(request.params.doctype, request.params.name, request.params.fieldname);
  return response.json({ value: value });
}));

// delete
router.delete('/api/resource/:doctype/:name', asyncHandler(async function (request, response) {
  let doc = await frappe.getDoc(request.params.doctype, request.params.name)
  await doc.delete();
  return response.json({});
}));

// delete many
router.delete('/api/resource/:doctype', asyncHandler(async function (request, response) {
  let names = request.body;
  for (let name of names) {
    let doc = await frappe.getDoc(request.params.doctype, name);
    await doc.delete();
  }
  return response.json({});
}));

// pdf
router.post('/api/method/pdf', asyncHandler(handlePDFRequest));

router.get('/ping', (req, res) => {
  return res.json({
    message: 'pong'
  })
});

module.exports = router;
