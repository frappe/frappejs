<template>
  <div class="frappe-list">
    <list-actions :doctype="doctype" :showDelete="checkList.length" @new="$emit('newDoc')" :showCreateKanban="hasItems" @delete="deleteCheckedItems" @createKanban="createKanban" />
    <ul class="list-group">
      <list-item v-for="doc of data" :key="doc.name" :id="doc.name" :isActive="doc.name === $route.params.name" :isChecked="isChecked(doc.name)" @clickItem="openForm(doc.name)" @checkItem="toggleCheck(doc.name)">
        <indicator v-if="hasIndicator" :color="getIndicatorColor(doc)" />
        <span class="d-inline-block ml-2">
          {{ doc[meta.titleField || 'name'] }}
        </span>
      </list-item>
    </ul>
  </div>
</template>
<script>
import frappe from 'frappejs';
import ListActions from './ListActions';
import ListItem from './ListItem';
// import FormLayout from '../Form/FormLayout';
import KanbanModel from '../../../models/doctype/Kanban/Kanban';
import KanbanModal from '../KanbanModal';

export default {
  name: 'List',
  props: ['doctype'],
  components: {
    ListActions,
    ListItem
  },
  data() {
    return {
      data: [],
      checkList: [],
      activeItem: ''
    };
  },
  computed: {
    meta() {
      return frappe.getMeta(this.doctype);
    },
    hasIndicator() {
      return Boolean(this.meta.indicators);
    },
    hasItems() {
      const fields = this.meta.fields;
      const isSelectFieldPresent = fields.find(
        field => field.fieldtype === 'Select'
      );
      if (isSelectFieldPresent && this.data.length > 0) return true;
      else return false;
    }
  },
  created() {
    frappe.db.on(`change:${this.doctype}`, () => {
      this.updateList();
    });
    this.$root.$on('navbarSearch', this.updateList);
    this.$root.$emit('newList');
  },
  mounted() {
    this.updateList();
  },
  methods: {
    async updateList(query = null) {
      let filters = null;
      if (query) {
        filters = {
          keywords: ['like', query]
        };
      }

      const indicatorField = this.hasIndicator
        ? this.meta.indicators.key
        : null;

      const fields = [
        'name',
        indicatorField,
        this.meta.titleField,
        ...this.meta.keywordFields
      ].filter(Boolean);

      const data = await frappe.db.getAll({
        doctype: this.doctype,
        fields,
        filters: filters || null
      });

      this.data = data;
    },
    openForm(name) {
      this.activeItem = name;
      this.$emit('openForm', name);
    },
    async deleteCheckedItems() {
      await frappe.db.deleteMany(this.doctype, this.checkList);
      this.$router.push(`/list/${this.doctype}`);
      this.checkList = [];
    },
    toggleCheck(name) {
      if (this.checkList.includes(name)) {
        this.checkList = this.checkList.filter(docname => docname !== name);
      } else {
        this.checkList = this.checkList.concat(name);
      }
    },
    isChecked(name) {
      return this.checkList.includes(name);
    },
    getIndicatorColor(doc) {
      return this.meta.getIndicatorColor(doc);
    },
    async createKanban() {
      // const kanban = frappe.getMeta('Kanban');
      // const fields = kanban.fields;
      // const newDoc = await frappe.getNewDoc('Kanban');
      KanbanModel.populateFieldsAndOptions(this.doctype).then(
        refDoctypeFields => {
          console.log('promise resolved');
          this.$modal.show({
            component: KanbanModal,
            modalProps: {
              title: 'Create Kanban'
            },
            props: {
              refdoctype: this.doctype
              // doc: newDoc
            }
          });
        }
      );
    }
  }
};
</script>
<style lang="scss" scoped>
@import '../../styles/variables';

.list-group-item {
  border-left: none;
  border-right: none;
  border-radius: 0;
}

.list-group-item:first-child {
  border-top: none;
}

.list-group-item:not(.active):hover {
  background-color: $light;
}
</style>
