module.exports = {
  name: 'KanbanCard',
  doctype: 'DocType',
  naming: 'random',
  keywordFields: ['cardtitle', 'carddescription', 'assignee'],
  titleField: 'cardtitle',
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
      fieldtype: 'Data',
      required: 1
    },
    {
      fieldname: 'boardname',
      label: 'Kanban board',
      fieldtype: 'Data',
      required: 1
    },
    {
      fieldname: 'referencedoctype',
      label: 'Reference Doctype Name',
      fieldtype: 'Data',
      required: 1
    },
    {
      fieldname: 'carddescription',
      label: 'Card Description',
      fieldtype: 'Text'
    },
    {
      fieldname: 'assignee',
      label: 'Assignee',
      fieldtype: 'Link',
      target: 'User'
    }
  ]
};
