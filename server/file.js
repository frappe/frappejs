const frappe = require("frappejs")
const formidable = require("formidable")
const fs = require('fs');

function setupFileMethods(){
    frappe.registerFileMethod({
        method:'file_transfer',
        handler: args => fileSaver(args)
    });
}

function fileSaver(req){
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldpath = files.filetoupload.path;
        var newpath = "../accounting/static/"+files.filetoupload.name;
        frappe.insert({
            doctype:'FileContent',
            name:fields.image_title,
            path:"accounting/static/"+files.filetoupload.name
            })
        fs.rename(oldpath, newpath, function(err){
            if (err) throw err;
        });
    });
    return "File Upload Successfulls";
}

module.exports = setupFileMethods