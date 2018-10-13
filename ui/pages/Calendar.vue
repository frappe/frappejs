<template>
  <div id="calendarFull">
    <button @click="refreshEvents">Refresh</button>
    <button v-if="selected._id" @click="removeEvent">Remove</button>
    <pre v-if="selected._id">Title: {{selected.title}}
    Start: {{selected.start}}
    End: {{selected.end}}
    Allday: {{selected.allDay}}
    ID: {{selected.id}}</pre>
    <full-calendar ref="calendar" :events="events" @event-drop="eventDrop" @event-resize="eventResize" @event-selected="eventSelected" @event-created="eventCreated" :config="config"></full-calendar>
  </div>
</template>

<script>
import frappe from "frappejs";
import Vue from 'vue'
import FullCalendar from 'vue-full-calendar';
import Form from '../components/Form/Form';
const { DateTime } = require('luxon');
Vue.use(FullCalendar);



export default {
  name: 'calendarFull',
  data() {
    return {
      events: [],

      config: {
        eventClick: (event) => {
          this.selected = event;
        },
      },

      selected: {},
    };
  },

  async created(){ 
  var allEvents=await frappe.db.getAll({
          doctype: "Event",
          fields: ["title", "startDate","startTime","endDate","endTime","name"]
        })
  this.events=[];
  for(var i=0;i<allEvents.length;i++){
    var event = {};

    event.title = allEvents[i].title;
    event.id = allEvents[i].name;

    event.start = DateTime.fromISO(allEvents[i].startDate+"T"+allEvents[i].startTime).toISO()
    event.end = DateTime.fromISO(allEvents[i].endDate+"T"+allEvents[i].endTime).toISO()

    this.events.push(event);

  }

  this.$root.$on('navbarSearch', this.updateList);
  },

  methods: {
async updateList(query = null) {
      let filters = null;
      if (query) {
        filters = {
          title: ['like', query]
        };
      }
      const indicatorField = this.hasIndicator
        ? this.meta.indicators.key
        : null;
      const fields = [
        "title", "startDate","startTime","endDate","endTime","name"
      ].filter(Boolean);
      const allEvents = await frappe.db.getAll({
        doctype: "Event",
        fields: fields,
        filters: filters || null
      });
      this.events=[];
        for(var i=0;i<allEvents.length;i++){
          var event = {};
          event.title = allEvents[i].title;
          event.id = allEvents[i].name;
          event.start = DateTime.fromISO(allEvents[i].startDate+"T"+allEvents[i].startTime).toISO()
          event.end = DateTime.fromISO(allEvents[i].endDate+"T"+allEvents[i].endTime).toISO()
          this.events.push(event);
        }
    },
    async eventDrop(event) {
      this.selected = event;
      let allEvents = await frappe.db.getAll({doctype:'Event', fields:['name'], filters: {name: this.selected.id}});
      let currEvent = await frappe.getDoc('Event', allEvents[0].name);
      
      var dtstart = (event.start).format("YYYY-MM-DD HH:mm").split(" ")
      currEvent.startTime = dtstart[1];
      currEvent.startDate = dtstart[0];

      var dtend = (event.end).format("YYYY-MM-DD HH:mm").split(" ")
      currEvent.endTime = dtend[1];
      currEvent.endDate = dtend[0];

      await currEvent.update();
      this.selected = {};
    },

    async eventResize(event) {
      this.selected = event;
      let allEvents = await frappe.db.getAll({doctype:'Event', fields:['name'], filters: {name: this.selected.id}});
      let currEvent = await frappe.getDoc('Event', allEvents[0].name);

      
      var dtstart = (event.start).format("YYYY-MM-DD HH:mm").split(" ")
      currEvent.startTime = dtstart[1];
      currEvent.startDate = dtstart[0];


      var dtend = (event.end).format("YYYY-MM-DD HH:mm").split(" ")
      currEvent.endTime = dtend[1];
      currEvent.endDate = dtend[0];


      await currEvent.update();
      this.selected = {};
    },

    refreshEvents() {
      this.$refs.calendar.$emit('refetch-events');
    },

    async removeEvent() {
      this.$refs.calendar.$emit('remove-event', this.selected);
      
      let allEvents = await frappe.db.getAll({doctype:'Event', fields:['name'], filters: {name: this.selected.id}});
      let currEvent = await frappe.getDoc('Event', allEvents[0].name);
      
      await currEvent.delete();
      this.selected = {};
    },

    eventSelected(event) {
      this.selected = event; 
    },

    eventCreated(...test) {
      var start = (test[0].start).format("YYYY-MM-DD HH:mm").split(" ")
      var end = (test[0].end).format("YYYY-MM-DD HH:mm").split(" ")
      console.log(start)
      console.log(end)
      var event = frappe.getNewDoc('Event')
      var final;
      event.then((value) => {
      this.$formModal.open(
        value,
        {
          defaultValues: {
            startDate: start[0],
            startTime: start[1],
            endDate: end[0],
            endTime: end[1],            
          },
          onClose: () => {
            // if new doc was not created
            // then reset the input value
            console.log("XSX");
            location.reload();
            }
        },
        {
          footerComponent: "xyz"
        }
      );
      value.on('afterInsert', data => {
        console.log("XXXXXXXX");
        this.$formModal.close();
        location.reload();
      })
      })
    },
  },
};
</script>

<style>
@import '~fullcalendar/dist/fullcalendar.css';
/* @import 'added.css'; */
@import 'modified.css';
#calendarFull {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* margin-top: 60px; */
}
</style>
