<template>
  <div>
    <table class="datatable-wrapper">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column['name']">
            {{ column['name'] | capitalize }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="board in kanbanBoards" :key="board['name']" @click="editKanban" :boardname="board['name']">
          <td v-for="(column, key) in columns" :key="key">
            {{board[column['field']]}}
          </td>
          <td @click="showKanban($event,board.name)">Show Kanban</td>
        </tr>
      </tbody>
    </table>
    <div>
      <list-actions :doctype="doctype" :showNew="false" />
      <ul class="list-group">
        <list-item v-for="board in kanbanBoards" :key="board.name" :id="board.name" @clickItem="showKanban($event,board.name)" @checkItem="toggleCheck(board.name)">
          <span class="d-inline-block ml-2">
            {{board.kanbanname}}
          </span>
        </list-item>
      </ul>
    </div>
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
  async created() {
    const kanbanBoards = await frappe.db.getAll({
      doctype: 'Kanban',
      fields: ['name', ...this.meta.keywordFields]
    });
    this.kanbanBoards = kanbanBoards;
    console.log(this.kanbanBoards);
    console.log(this.meta);
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
      ]
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
    editKanban(e) {
      const name = e.currentTarget.getAttribute('boardname');
      this.$router.push(`/Kanban/${name}`);
    },
    showKanban(e, name) {
      e.stopPropagation();
      console.log('name', name);
      this.$router.push(`/Kanban/view/${name}`);
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
</style>
