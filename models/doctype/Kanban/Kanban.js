let options = [];
let referencedoctype = '';

async function populateFieldsAndOptions(doctype){
  const meta = await frappe.getMeta(doctype);
  referencedoctype = doctype;
  console.log(referencedoctype);
  meta.fields.forEach(field => {
    if(field.fieldtype==='Select')
    options.push(field.fieldname)
  });
  return meta.fields;
};

module.exports = {
    name: 'Kanban',
    doctype: 'DocType',
    naming: 'autoincrement',
    isSingle: 0,
    isChild: 0,
    "keywordFields": [],
    "fields": [
      {
        "fieldname": "kanbanname",
        "label": "Kanban Name",
        "fieldtype": "Data",
        "required": 1
      },
      {
        "fieldname": "referencedoctype",
        "label": "Reference Doctype",
        "fieldtype": "Data",
        "value": 'something',
        "required": 1
      },
      {
        "fieldname": "sortby",
        "label": "Sort By",
        "fieldtype": "Select",
        "options": options,
        "required": 1,
      }
    ],
    populateFieldsAndOptions
};
  