const frappe = require('frappejs');
module.exports = async function getData() {
    account = await frappe.db.getAll({
        doctype: 'EmailAccount',
        fields: ['*']
    })
    return account;
}