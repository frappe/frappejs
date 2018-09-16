<template>
  <div>
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <h3 class="modal-header">
            Create Kanban for {{refdoctype}}
          </h3>
          <div class="modal-body">
            <form>
              <div :key="key" v-for="(field,key) in fields">
                <label>
                  {{field.label}}
                  <input class="form-control" :disabled="disabled(field)" v-if="fieldtypes[field.fieldtype] === 'text'" type="text" v-model="configdata[field.fieldname]" />
                  <select class="form-control" v-if="fieldtypes[field.fieldtype] === 'select'" v-model="configdata.sortby" @change="updateLists">
                    <option v-for="(option) in options" :key="option" :value="option">
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
          </div>
          <div class="modal-footer">
            <button class="btn btn-danger btn-lg" @click="$emit('closeKanbanModal')">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import frappe from 'frappejs';
import FormLayout from './Form/FormLayout';
import Observable from '../../utils/observable';
export default {
  name: 'KanbanModal',
  props: ['refdoctype', 'closeKanbanModal'],
  created() {
    this.doc = new Observable();
  },
  data() {
    return {
      configdata: {
        kanbanname: '',
        referencedoctype: this.refdoctype,
        sortby: '',
        lists: []
      }
    };
  },
  methods: {
    async submit(e) {
      e.preventDefault();
      const { kanbanname, referencedoctype, sortby } = this.configdata;
      const newDoc = await frappe.getNewDoc('Kanban');
      console.log('here', newDoc);
      Object.keys(this.configdata).forEach(field => {
        newDoc[field] = this.configdata[field];
      });
      newDoc._meta.fields.forEach(field => {
        if (fieldtype === 'Select') field.options = this.options;
      });
      console.log('newdoc', newDoc);
      newDoc.insert();
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
          return doc;
        });
      });
      Promise.all(columns).then(kanbanColumns => {
        this.configdata.lists = kanbanColumns;
      });
    }
  },
  computed: {
    meta() {
      return frappe.getMeta('Kanban');
    },
    fields() {
      return this.meta.fields;
    },
    fieldtypes() {
      return {
        Select: 'select',
        Data: 'text'
      };
    },
    options() {
      const refdoctypemeta = frappe.getMeta(this.refdoctype);
      const options = [];
      refdoctypemeta.fields.forEach(field => {
        if (field.fieldtype === 'Select') options.push(field.fieldname);
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

.modal-header {
}

.modal-body {
  display: block;
}

.modal-footer {
}
</style>
