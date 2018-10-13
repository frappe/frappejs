import ListAndForm from '../pages/ListAndForm';
import ListAndPrintView from '../pages/ListAndPrintView';
import Calendar from '../pages/Calendar';
import Tree from '../components/Tree';

export default [
  {
    path: '/list/:doctype',
    name: 'List',
    component: ListAndForm,
    props: true
  },
  {
    path: '/calendar/:doctype',
    name:'Calendar',
    component: Calendar,
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
  }
];
