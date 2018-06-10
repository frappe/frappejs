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
            "label": "from",
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
        },
        {
            "fieldname": "emailAddress",
            "label": "to",
            "fieldtype": "Data",
            "required": 1
        },
        {
            "fieldname": "emailAddress",
            "label": "cc",
            "fieldtype": "Data",
            "required": 1
        },
        {
            "fieldname": "emailAddress",
            "label": "bcc",
            "fieldtype": "Data",
            "required": 1
        },
        {
          "fieldname": "Subject",
          "label": "Subject",
          "fieldtype" : "Text",
          "required": 0
        },
        { 
          "fieldname": "Content",
          "label": "",
          "fieldtype" : "Text",
          "required": 0
        }         
        
     
    ]
}
