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
                  <input v-if="fieldtypes[field.fieldtype] === 'text'" type="text" />
                  <select v-if="fieldtypes[field.fieldtype] === 'select'">
                    <option v-for="(option) in options" :key="option" :value="option">
                      {{option}}
                    </option>
                  </select>  
                </label>
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
  methods: {
    submit() {
      const { kanbanname, sortby, referencedoctype } = this.doc;
      console.log(kanbanname, sortby, referencedoctype);
      console.log(this.doc);
    }
  },
  created() {
    console.log(this.meta.fields);
    console.log(this.options);
  }
};
</script>
  },
  methods: {
    submit() {
      const { kanbanname, sortby, referencedoctype } = this.doc;
      console.log(kanbanname, sortby, referencedoctype);
      console.log(this.doc);
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
