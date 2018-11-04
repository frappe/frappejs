<template>
  <div>
    <list-actions :doctype="doctype" :showNew="false" :showDelete="checkList.length" @delete="deleteCheckedItems" />
    <ul class="list-group">
      <list-item v-for="board in kanbanBoards" :key="board.name" :id="board.name" :isChecked="isChecked(board.name)" @checkItem="toggleCheck(board.name)" @clickItem="editKanban(board.name)">
        <span class="d-inline-block ml-2">
          {{board.kanbanname}}
        </span>
        <button class="btn btn-sm btn-primary" @click="showKanban($event,board.name)">Show Kanban</button>
      </list-item>
    </ul>
  </div>
</template>

<script>
import frappe from 'frappejs';
import ListActions from '../List/ListActions';
import ListItem from '../List/ListItem';

export default {
  name: 'KanbanTable',
  components: {
    ListActions,
    ListItem
  },
  created() {
    frappe.db.on(`change:${this.doctype}`, () => {
      this.updateList();
    });
  },
  mounted() {
    this.updateList();
  },
  computed: {
    meta() {
      return frappe.getMeta('Kanban');
    }
  },
  data() {
    return {
      doctype: 'Kanban',
      kanbanBoards: [],
      columns: [
        { name: 'name', field: 'kanbanname' },
        { name: 'reference doctype', field: 'referencedoctype' }
      ],
      checkList: []
    };
  },
  filters: {
    capitalize: function(value) {
      if (!value) return '';
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  },
  methods: {
    editKanban(name) {
      // console.log(e);
      this.$router.push(`/Kanban/${name}`);
    },
    showKanban(e, name) {
      e.stopPropagation();
      console.log('name', name);
      this.$router.push(`/Kanban/view/${name}`);
    },
    async deleteCheckedItems() {
      await frappe.db.deleteMany(this.doctype, this.checkList);
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
    async updateList() {
      const kanbanBoards = await frappe.db.getAll({
        doctype: 'Kanban',
        fields: ['name', ...this.meta.keywordFields]
      });
      this.kanbanBoards = kanbanBoards;
      console.log(this.kanbanBoards);
      console.log(this.meta);
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
  display: flex;
  justify-content: space-between;
  &:hover {
    cursor: pointer;
    background-color: $light;
  }
}

.list-group-item:first-child {
  border-top: none;
}
</style>
