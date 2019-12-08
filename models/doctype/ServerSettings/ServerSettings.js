module.exports = {
    name: "ServerSettings",
    label: "Server Settings",
    doctype: "DocType",
    isSingle: 1,
    isChild: 0,
    keywordFields: ["serverName"],
    fields: [
        {
            fieldname: "serverName",
            label: "Server Name",
            fieldtype: "Data"
        },
        {
            fieldname: "serverKey",
            label: "Server Key",
            fieldtype: "Data"
        }
    ]
}