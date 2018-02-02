require('./jquery');

require('trumbowyg');
require('trumbowyg/dist/ui/icons.svg')

const BaseControl = require('./base');

const frappe = require('frappejs')

class TextEditorControl extends BaseControl {
    make() {
        super.make();
        this.body = frappe.ui.add('div', 'frappe-text-editor', this.parent);
        $(this.body).trumbowyg();
    }
};

module.exports = TextEditorControl;