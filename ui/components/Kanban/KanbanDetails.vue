<template>
  <div>
    <form>
      <div :key="key" v-for="(field,key) in fields">
        <label>
          {{field.label}}
          <input class="form-control form-control-lg" :disabled="disabled(field)" v-if="fieldtypes[field.fieldtype] === 'text'" type="text" v-model="configdata[field.fieldname]" />
          <select class="form-control form-control-lg" v-if="fieldtypes[field.fieldtype] === 'select'" v-model="configdata.sortby">
            <option v-for="(option) in options" :key="option" :value="option">
              {{option}}
            </option>
          </select>
          <div v-if="field.fieldname === 'lists'">
            <div v-for="(list,key) in configdata['lists']" :key="key">
              {{list.listname}}
            </div>
          </div>
        </label>
      </div>
      <div>
        <button class="btn btn-primary btn-lg" @click="update" type="submit" value="submit">
          submit
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import frappe from 'frappejs';

export default {
  name: 'KanbanDetails',
  data() {
    return {
      doctype: 'Kanban',
      configdata: {
        kanbanname: '',
        referencedoctype: '',
        sortby: '',
        lists: []
      },
      doc: null
    };
  },
  computed: {
    name() {
      return this.$route.params.name;
    },
    options() {
      const options = [];
      if (this.configdata.referencedoctype) {
        const refdoctypemeta = frappe.getMeta(this.configdata.referencedoctype);
        console.log(refdoctypemeta);
        refdoctypemeta.fields.forEach(field => {
          if (field.fieldtype === 'Select') options.push(field.fieldname);
        });
      }
      return options;
    },
    meta() {
      return frappe.getMeta(this.doctype);
    },
    fields() {
      console.log(this.meta.fields);
      return this.meta.fields;
    },
    disabled() {
      return field => {
        return field.fieldname === 'referencedoctype' ? true : false;
      };
    },
    fieldtypes() {
      return {
        Select: 'select',
        Data: 'text'
      };
    }
  },
  created() {
    const doc = this.getDetails();
    doc.then(data => {
      console.log(data);
      Object.keys(this.configdata).forEach(
        field => (this.configdata[field] = data[field])
      );
      console.log(this.configdata);
    });
  },
  methods: {
    async getDetails() {
      const doc = await frappe.getDoc(this.doctype, this.name);
      console.log('doc', doc);
      this.doc = doc;
      return doc;
    },
    async update(e) {
      e.preventDefault();
      const doc = await frappe.getDoc(this.doctype, this.name);
      console.log(doc);
      Object.keys(this.configdata).forEach(
        field => (doc[field] = this.configdata[field])
      );
      doc.update();
    }
  }
};
</script>

