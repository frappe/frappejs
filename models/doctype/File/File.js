module.exports = {
    name: "File",
    doctype: "DocType",
    isSingle: 0,
    istable: 0,
    keywordFields: [
        "name",
        "path"
    ],
    fields: [
        {
            fieldname: "name",
            label: "Name",
            fieldtype: "Data",
            required: 1,
        },
        {
            fieldname: "hash",
            label: "Hash",
            fieldtype: "Text",
        },
        {
            fieldname: "path",
            label: "Path",
            fieldtype: "Data",
            required: 1
        }
    ]
}