import ListAndForm from '../pages/ListAndForm';
import ListAndPrintView from '../pages/ListAndPrintView';
import Tree from '../components/Tree';
import KanbanTable from '../components/Kanban/KanbanTable';
import KanbanDetails from '../components/Kanban/KanbanDetails';
import Kanban from '../components/Kanban/Kanban';

export default [
  {
    path: '/list/:doctype',
    name: 'List',
    component: ListAndForm,
    props: true
  },
  {
    path: '/edit/:doctype/:name',
    name: 'Form',
    component: ListAndForm,
    props: true
  },
  {
    path: '/tree/:doctype',
    name: 'Tree',
    component: Tree,
    props: true
  },
  {
    path: '/print/:doctype/:name',
    name: 'PrintView',
    component: ListAndPrintView,
    props: true
  },
  {
    path: '/kanban',
    name: 'Kanban',
    component: KanbanTable
  },
  {
    path: '/Kanban/:name',
    name: 'Edit Kanban',
    component: KanbanDetails
  },
  {
    path: '/kanban/view/:name',
    name: 'Show Kanban',
    component: Kanban
  }
];
