<template>
  <div v-if="kanban !== null" class="kanban-container">
    <div class="kanban-list" v-for="list in kanban.lists" v-if="!list.archived" :id="list.listname" :key="list.listname" v-on:dragover="dragover" v-on:drop="drophandler">
      <list-actions :doctype="list.listname" :showDelete="checklist.length" @delete="deleteCards" :showNew="false" :showArchive="true" @archiveList="archiveList(list.listname)" />
      <ul class="list-group">
        <div v-for="card in cards" :key="card.cardtitle" v-if="card.listname === list.listname" :name="card.name" draggable="true" v-on:dragstart="dragstart">
          <list-item v-if="card.listname === list.listname" :id="card.name" :isChecked="isChecked(card.name)" @checkItem="toggleCheck(card.name)" @clickItem="displayCardDetails(card.name)">
            <span class="card-title">{{card.cardtitle}}</span>
          </list-item>
        </div>
        <button class="btn btn-lg" @click="addCard" :listname="list.listname">Add a card</button>
      </ul>
    </div>
    <button class="btn btn-lg" @click="addList">Add a List</button>
    <custom-modal v-if="showModal" @closeModal="closeModal" header="Create List">
      <form @submit.prevent="onSubmit">
        <label for="listname">
          List Name
          <input type="text" name="listname" v-model="newListName" required />
        </label>
        <input class="btn btn-primary" type="submit" value="submit" />
      </form>
    </custom-modal>
    <custom-modal v-if="showCardModal" @closeModal="closeCardModal" header="Create Card">
      <form @submit.prevent="onCardSubmit">
        <label for="card">
          Card Name
          <input type="text" name="cardname" v-model="cardconfig['cardname']" required />
        </label>
        <label for="listname">
          List Name
          <input type="text" name="listname" v-model="cardconfig['listname']" value="cardconfig['listname']" disabled />
        </label>
        <input class="btn btn-primary" type="submit" value="submit" />
      </form>
    </custom-modal>
    <custom-modal v-if="showCardInfoModal" @closeModal="closeCardInfoModal" header="Card Details">
      <form-actions class="p-3 border-bottom" v-if="currentCard !== null" :doc="currentCard" @save="saveCardChanges" @submit="submitCardChanges" :links="links" @revert="revert" @print="print" />
      <form-layout class="p-3" :doc="currentCard" :fields="cardmeta.fields" :layout="cardmeta.layout" v-if="currentCard !== null" />
    </custom-modal>
  </div>
</template>

<script>
import frappe from 'frappejs';
import CustomModal from './CustomModal';
import ListItem from '../List/ListItem';
import ListActions from '../List/ListActions';
import FormLayout from '../Form/FormLayout';
import FormActions from '../Form/FormActions';

export default {
  name: 'Kanban',
  components: {
    CustomModal,
    ListItem,
    ListActions,
    FormLayout,
    FormActions
  },
  data: function() {
    return {
      kanban: null,
      draggedItemName: '',
      doctype: 'Kanban',
      cards: [],
      showModal: false,
      newListName: '',
      showCardModal: '',
      cardconfig: {
        listname: '',
        cardname: '',
        carddescription: ''
      },
      checklist: [],
      showCardInfoModal: false,
      currentCard: null,
      links: []
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
    },
    referencedoctypemeta() {
      return frappe.getMeta(this.kanban.referencedoctype);
    },
    referencedoctypefields() {
      return this.referencedoctypemeta.fields.map(field => field.fieldname);
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
      console.log('hereh', e);
      e.dataTransfer.effectAllowed = 'move';
      let attribute, draggedItemName;
      draggedItemName = e.target.getAttribute('name');
      this.draggedItemName = draggedItemName;
      console.log(this.draggedItemName);
    },
    drophandler: function(e) {
      const destinationListName = e.target.id;
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
      this.getCards();
    },
    async getCards() {
      const allCards = await frappe.db.getAll({
        doctype: 'KanbanCard',
        filters: { boardname: this.name },
        fields: [...this.fields, 'name']
      });
      this.cards = allCards;
      console.log(this.cards);
    },
    addList() {
      console.log('adding list');
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    async onSubmit() {
      console.log('form submitted', this.newListName);
      const newList = await frappe.getNewDoc('KanbanList');
      newList.listname = this.newListName;
      const Kanban = await frappe.getDoc(this.doctype, this.name);
      Kanban.lists.push(newList);
      Kanban.update();
      this.updateKanban(Kanban);
      this.showModal = false;
    },
    async updateKanban(Kanban) {
      this.Kanban = Kanban;
    },
    async addCard(e) {
      const targetList = e.target.getAttribute('listname');
      this.cardconfig.listname = targetList;
      console.log(this.cardconfig);
      this.showCardModal = true;
    },
    closeCardModal() {
      this.showCardModal = false;
    },
    async onCardSubmit() {
      console.log('submitting card', this.cardconfig['cardname']);
      const newCard = await frappe.getNewDoc('KanbanCard');
      newCard.cardtitle = this.cardconfig.cardname;
      newCard.boardname = this.kanban.name;
      newCard.listname = this.cardconfig.listname;
      newCard.referencedoctype = this.kanban.referencedoctype;
      newCard.insert();
      await this.getCards();
      this.closeCardModal();
    },
    toggleCheck(name) {
      if (this.checklist.includes(name)) {
        this.checklist = this.checklist.filter(docname => docname !== name);
      } else {
        this.checklist = this.checklist.concat(name);
      }
    },
    isChecked(name) {
      return this.checklist.includes(name);
    },
    async deleteCards() {
      await frappe.db.deleteMany('KanbanCard', this.checklist);
      this.checklist = [];
    },
    async archiveList(listname) {
      const Kanban = await frappe.getDoc(this.doctype, this.name);
      Kanban.lists.forEach(
        list =>
          list.listname === listname
            ? (list.archived = 1)
            : (list.archived = list.archived)
      );
      Kanban.update();
      this.updateKanban(Kanban);
    },
    async displayCardDetails(cardName) {
      this.showCardInfoModal = true;
      const card = await frappe.getDoc('KanbanCard', cardName);
      this.currentCard = card;
    },
    closeCardInfoModal() {
      this.showCardInfoModal = false;
    },
    async saveCardChanges() {
      console.log('save');
      await this.currentCard.update();
    },
    submitCardChanges() {
      console.log('save');
    },
    revert() {
      console.log('save');
    },
    print() {
      console.log('print');
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../../styles/variables';

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
/* .list-name {
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
} */
</style>
