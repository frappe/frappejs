module.exports = {
  name: 'KanbanList',
  doctype: 'DocType',
  isChild: 1,
  naming: 'random',
  fields: [
    {
      label: 'List Name',
      fieldname: 'listname',
      fieldtype: 'Data'
    },
    {
      label: 'Archived',
      fieldname: 'archived',
      fieldtype: 'Int',
      default: 0
    }
  ]
};
