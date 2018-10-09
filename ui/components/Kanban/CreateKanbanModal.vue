<template>
  <custom-modal v-if="showCreateKanbanModal" :header="'Create Kanban for' + refdoctype" @closeModal="closeCreateKanbanModal">
    <form>
      <div :key="key" v-for="(field,key) in fields">
        <label>
          {{field.label}}
          <input class="form-control" :disabled="disabled(field)" v-if="fieldtypes[field.fieldtype] === 'text'" type="text" v-model="configdata[field.fieldname]" />
          <select class="form-control" v-if="fieldtypes[field.fieldtype] === 'select'" v-model="configdata[field.fieldname]" @change="updateLists">
            <option v-for="(option) in options[field.fieldname]" :key="option" :value="option">
              {{option}}
            </option>
          </select>
        </label>
      </div>
      <div>
        <button class="btn btn-primary btn-lg" @click="submit" type="submit" value="submit" :disabled="submitdisabled">
          submit
        </button>
      </div>
    </form>
  </custom-modal>
</template>

<script>
import frappe from 'frappejs';
import FormLayout from '../Form/FormLayout';
import Observable from '../../../utils/observable';
import CustomModal from './CustomModal';

export default {
  name: 'CreateKanbanModal',
  props: ['refdoctype', 'showCreateKanbanModal'],
  components: {
    CustomModal
  },
  data() {
    return {
      configdata: {
        kanbanname: '',
        referencedoctype: this.refdoctype,
        sortby: '',
        lists: [],
        titlefield: ''
      }
    };
  },
  created() {
    this.doc = new Observable();
  },
  computed: {
    meta() {
      return frappe.getMeta('Kanban');
    },
    fields() {
      console.log(this.meta.fields);
      return this.meta.fields;
    },
    fieldtypes() {
      return {
        Select: 'select',
        Data: 'text',
        Table: 'table'
      };
    },
    options() {
      const refdoctypemeta = frappe.getMeta(this.refdoctype);
      const options = {
        sortby: [],
        titlefield: []
      };
      refdoctypemeta.fields.forEach(field => {
        if (field.fieldtype === 'Select') options.sortby.push(field.fieldname);
        else if (field.fieldtype === 'Data')
          options.titlefield.push(field.fieldname);
      });
      return options;
    },
    disabled() {
      return field => {
        return field.fieldname === 'referencedoctype' ? true : false;
      };
    },
    submitdisabled() {
      let isInvalid = false;
      const configFields = Object.keys(this.configdata);
      configFields.forEach(field => {
        if (this.configdata[field] === '') isInvalid = true;
      });
      return isInvalid;
    }
  },
  methods: {
    async submit(e) {
      e.preventDefault();
      const newDoc = await frappe.getNewDoc('Kanban');
      console.log('here', newDoc);
      Object.keys(this.configdata).forEach(field => {
        newDoc[field] = this.configdata[field];
      });
      newDoc._meta.fields.forEach(field => {
        if (field.fieldtype === 'Select') field.options = this.options;
      });
      console.log('newdoc', newDoc);
      newDoc.insert();
      this.initCards();
      this.$emit('closeKanbanModal');
    },
    async updateLists() {
      const refdoctypemeta = await frappe.getMeta(this.refdoctype);
      const sortField = refdoctypemeta.fields.find(
        field =>
          field.fieldtype === 'Select' &&
          field.fieldname === this.configdata.sortby
      );
      const columns = sortField.options.map(column => {
        const newColumn = frappe.getNewDoc('KanbanList');
        return newColumn.then(doc => {
          doc.listname = column;
          doc.archived = false;
          return doc;
        });
      });
      console.log(columns);
      Promise.all(columns).then(kanbanColumns => {
        console.log(kanbanColumns);
        this.configdata.lists = kanbanColumns;
        console.log(this.configdata.lists);
      });
    },
    async initCards() {
      const refdoctypemeta = await frappe.getMeta(this.refdoctype);
      const refdoctypefields = refdoctypemeta.fields.map(
        field => field.fieldname
      );
      console.log('refdoctypefields', refdoctypefields);
      const allItems = await frappe.db.getAll({
        doctype: this.refdoctype,
        fields: ['name', ...refdoctypefields]
      });
      console.log('allitems', allItems);
      console.log(this.configdata.kanbanname);
      const board = await frappe.db.getAll({
        doctype: 'Kanban',
        fields: ['name'],
        filters: { kanbanname: this.configdata.kanbanname }
      });
      console.log(board);
      allItems.forEach(item => {
        const newCard = frappe.getNewDoc('KanbanCard');
        newCard.then(doc => {
          doc.boardname = board[0].name;
          doc.referencedoctype = this.configdata.referencedoctype;
          doc.listname = item[this.configdata.sortby];
          doc.cardtitle = item[this.configdata.titlefield];
          doc.insert();
        });
      });
    },
    closeCreateKanbanModal() {
      this.showCreateKanbanModal = false;
    }
  }
};
</script>

<style>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  max-width: 80%;
  min-height: 30%;
  background-color: white;
  margin: 0 auto;
  border-radius: 5px;
}

.modal-body {
  display: block;
}
</style>
