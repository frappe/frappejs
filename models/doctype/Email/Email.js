module.exports = {
    "name": "Email",
    "doctype": "DocType",
    "isSingle": 0,
    "isChild": 0,
    "keywordFields": [
        "name",
        "from_emailAddress"
    ],
    "fields": [
        {
            "fieldname": "name",
            "label": "Name",
            "fieldtype": "Data",
            "required": 1
        },
        {
            "fieldname": "from_emailAddress",
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
            "fieldname": "to_emailAddress",
            "label": "to",
            "fieldtype": "Data",
            "required": 1
        },
        {
            "fieldname": "cc_emailAddress",
            "label": "cc",
            "fieldtype": "Data",
            "required": 0
        },
        {
            "fieldname": "bcc_emailAddress",
            "label": "bcc",
            "fieldtype": "Data",
            "required": 0
        },
        {
          "fieldname": "Subject",
          "label": "Subject",
          "fieldtype" : "Text",
          "required": 0
        },
        { 
          "fieldname": "Body",
          "label": "",
          "fieldtype" : "Text",
          "required": 0
        }         
        
     
    ]
}
