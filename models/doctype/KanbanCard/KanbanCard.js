module.exports = {
  name: 'KanbanCard',
  doctype: 'DocType',
  naming: 'random',
  fields: [
    {
      fieldname: 'cardtitle',
      label: 'Card Title',
      fieldtype: 'Data',
      required: 1
    },
    {
      fieldname: 'listname',
      label: 'Add To List',
      fieldtype: 'Select',
      options: [],
      required: 1
    },
    {
      fieldname: 'boardname',
      label: 'Kanban board',
      fieldtype: 'Data',
      required: 1
    },
    {
      fieldname: 'refdoctypename',
      label: 'Reference Doctype Name',
      fieldtype: 'Data',
      required: 1
    }
  ]
};
