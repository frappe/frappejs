<template>
    <div>
        <form-layout 
        :doc="doc"
        :fields="fields"
        />
        <button class="btn btn-primary btn-sm" @click="submit">Submit</button>
        <button class="btn btn-danger btn-sm" @click="closeModal">Cancel</button>
    </div>
</template>

<script>
import frappe from 'frappejs';
import FormLayout from './Form/FormLayout';
import Observable from '../../utils/observable';
export default {
  name: 'KanbanModal',
  props: ['refdoctype'],
  components: {
    FormLayout
  },
  created() {
    this.doc = new Observable();
  },
  computed: {
    meta() {
      return frappe.getMeta('Kanban');
    },
    fields() {
      return this.meta.fields;
    }
  },
  methods: {
    closeModal() {
      this.$modal.hide();
    },
    submit() {
      const { kanbanname, sortby, referencedoctype } = this.doc;
      console.log(kanbanname, sortby, referencedoctype);
      console.log(this.doc);
    }
  }
};
</script>
