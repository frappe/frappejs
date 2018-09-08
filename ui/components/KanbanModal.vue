<template>
    <div>
      <div class="modal-mask">
        <div class="modal-wrapper">
          <div class="modal-container">
            <div class="modal-header">
              Create Kanban for {{refdoctype}}
            </div>
            <div class="modal-body">
              <form>
                <div :key="key" v-for="(field,key) in fields">
                <label>
                  {{field.label}}
                  <input v-if="fieldtypes[field.fieldtype] === 'text'" type="text" v-model="configdata[field.fieldname]"/>
                  <select v-if="fieldtypes[field.fieldtype] === 'select'" v-model="configdata.sortby">
                    <option v-for="(option) in options" :key="option" :value="option">
                      {{option}}
                    </option>
                  </select>  
                </label>
                </div>
                <div>
                  <button @click="submit" type="submit" value="submit">
                    submit
                  </button>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button @click="$emit('closeKanbanModal')">Close</button>
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
        sortby: ''
      }
    };
  },
  methods: {
    async submit(e) {
      e.preventDefault();
      console.log('submit');
      const { kanbanname, referencedoctype, sortby } = this.configdata;
      console.log(kanbanname, referencedoctype, sortby);
      const newDoc = await frappe.getNewDoc('Kanban');
      Object.keys(this.configdata).forEach(
        field => (newDoc[field] = this.configdata[field])
      );
      console.log('newdoc', newDoc);
      newDoc.insert();
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
    }
  },
  created() {
    console.log(this.meta.fields);
    console.log(this.options);
    console.log('data', this.data);
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
