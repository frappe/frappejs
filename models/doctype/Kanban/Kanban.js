module.exports = {
  name: 'Kanban',
  doctype: 'DocType',
  naming: 'autoincrement',
  keywordFields: ['kanbanname', 'referencedoctype', 'sortby'],
  fields: [
    {
      fieldname: 'kanbanname',
      label: 'Kanban Name',
      fieldtype: 'Data',
      required: 1
    },
    {
      fieldname: 'referencedoctype',
      label: 'Reference Doctype',
      fieldtype: 'Data',
      required: 1
    },
    {
      fieldname: 'sortby',
      label: 'Sort By',
      fieldtype: 'Select',
      options: [],
      required: 1
    },
    {
      fieldname: 'lists',
      label: 'Lists',
      fieldType: 'Table',
      childType: 'KanbanList'
    }
  ]
};
