<template>
  <div v-if="kanban !== null" class="kanban-container">
    <div class="kanban-list" v-for="list in kanban.lists" :id="list.listname" :key="list.listname" v-on:dragover="dragover" v-on:drop="drophandler">
      <div class="list-name">
        {{list.listname | capitalize}}
        <div v-for="card in cards" :key="card.cardtitle">
          <div v-if="card.listname === list.listname" :name="card.name" class="card-item" draggable="true" v-on:dragstart="dragstart">
            <span class="card-title">{{card.cardtitle}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import frappe from 'frappejs';
import Vue from 'vue';

export default {
  name: 'Kanban',
  // components: {
  //   KanbanBoard
  // },
  data: function() {
    return {
      kanban: null,
      draggedItemName: '',
      doctype: 'Kanban',
      cards: []
    };
  },
  computed: {
    name() {
      return this.$route.params.name;
    },
    cardmeta() {
      return frappe.getMeta('KanbanCard');
    },
    fields() {
      return this.cardmeta.fields.map(field => field.fieldname);
    }
  },
  filters: {
    capitalize(value) {
      if (!value) return '';
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  },
  created() {
    this.initKanbanBoard();
  },
  methods: {
    dragstart: function(e) {
      console.log(e);
      e.dataTransfer.effectAllowed = 'move';
      let attribute, draggedItemName;
      draggedItemName = e.target.getAttribute('name');
      this.draggedItemName = draggedItemName;
      console.log(this.draggedItemName);
    },
    drophandler: function(e) {
      const destinationListName = e.target.id;
      // const draggedItemN = this.draggedItem;
      const draggedItem = this.cards.filter(
        card => card.name === this.draggedItemName
      )[0];
      draggedItem.listname = destinationListName;
      this.updateItem(destinationListName);
    },
    dragover: function(e) {
      e.preventDefault();
    },
    async updateItem(destinationListName) {
      console.log(this.draggedItemName);
      const sourceItem = await frappe.getDoc(
        'KanbanCard',
        this.draggedItemName
      );
      sourceItem.listname = destinationListName;
      sourceItem.update();
    },
    onSubmit: function() {
      console.log(this.doctype, this.field);
      if (this.doctype === 'ToDo') this.updateListsForTodos();
      else if (this.doctype === 'Party') this.updateListsForParty();
    },
    async initKanbanBoard() {
      const kanban = await frappe.getDoc(this.doctype, this.name);
      this.kanban = kanban;
      this.getCards(kanban.name);
    },
    async getCards(boardname) {
      const allCards = await frappe.db.getAll({
        doctype: 'KanbanCard',
        filters: { boardname },
        fields: [...this.fields, 'name']
      });
      this.cards = allCards;
      console.log(this.cards);
    }
  }
};
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.kanban-container {
  display: flex;
  margin: 0 auto;
  justify-content: space-around;
}
.kanban-list {
  margin: 1rem 0;
  border-radius: 5px;
  min-height: 400px;
  min-width: 300px;
  background-color: #e8ebed;
  box-shadow: -1px 1px 16px -3px rgba(0, 0, 0, 0.75);
}
.list-name {
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
}
.card-item {
  background: #fff;
  margin: 0.5rem;
  padding: 1rem;
  border-radius: 5px;
}
.card-item:hover {
  box-shadow: -1px 10px 12px -7px rgba(0, 0, 0, 0.75);
}
.card-title {
  color: #2066d6;
  font-size: 1.2rem;
  font-weight: bold;
}
</style>
