const frappe = require("frappejs")
const formidable = require("formidable")
const fs = require('fs');

function setupFileMethods(){
    frappe.registerFileMethod({
        method:'file_transfer',
        handler: args => fileSaver(args)
    });
    frappe.registerMethod({
            method:'file_delete',
            handler: args=> fileDelete(args)
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
}

async function fileDelete(fileList){
    for(var i = 0; i < fileList.length ; i++ )
    {
        let file = await frappe.getDoc('FileContent', fileList[i]);
        let filePath = "../"+file.path;
        fs.unlink(filePath,(err)=>{
            if (err) throw err;
            console.log('successfully deleted /tmp/hello');
        });
    }
}

module.exports = setupFileMethods