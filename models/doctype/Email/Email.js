module.exports = {
    "name": "Email",
    "doctype": "DocType",
    "isSingle": 0,
    "isChild": 0,
    "keywordFields": [
        "name",
        "emailAddress"
    ],
    "fields": [
        {
            "fieldname": "name",
            "label": "Name",
            "fieldtype": "Data",
            "required": 1
        },
        {
            "fieldname": "emailAddress",
            "label": "Email Address",
            "fieldtype": "Data",
            "required": 1
        },
        {
            "fieldname": "password",
            "label": "Password",
            "fieldtype": "Password",
            "required": 1,
            "hidden": 1,
        },
        {
            "fieldname": "host",
            "label": "Host",
            "fieldtype": "Link",
            "required": 1
        },
        {
            "fieldname": "port",
            "label": "Port",
            "fieldtype": "Int",
            "required": 1
        }
    ]
}