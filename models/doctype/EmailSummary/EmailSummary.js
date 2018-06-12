module.exports = {
    "name": "EmailSummary",
    "doctype": "DocType",
    "isSingle": 0,
    "isChild": 0,   // isChild of Email ? 
    "keywordFields": [
        "from_emailAddress"
    ],
    "fields": [
        {
        	// here comes question of default values
            "fieldname": "from_emailAddress",
            "label": "From",
            "fieldtype": "Data",
            "required": 1
        },
        {
            "fieldname": "to_emailAddress",
            "label": "To",
            "fieldtype": "Data",
            "required": 1
        },
        {
          "fieldname": "subject",
          "label": "Subject",
          "fieldtype" : "Text",
          "required": 0
        },
        { 
          "fieldname": "body",
          "label": "Body",
          "fieldtype" : "Text",
          "required": 0
        }         
        // haven't captured attachments ?
    ]
}

