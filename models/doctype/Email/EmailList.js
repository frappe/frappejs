module.exports = {
    "name": "EmailItem",
    "doctype": "DocType",
    "isSingle": 0,
    "isChild": 0,   // isChild of Email ? 
    "keywordFields": [
        "emailAddress"
    ],
    "fields": [
        {
            "fieldname": "from_emailAddress",
            "label": "from",
            "fieldtype": "Data",
            "required": 1
        },
        {
            "fieldname": "to_emailAddress",
            "label": "to",
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
          "fieldname": "Body",
          "label": "",
          "fieldtype" : "Text",
          "required": 0
        }         
        // haven't captured attachments ?
    ]
}
