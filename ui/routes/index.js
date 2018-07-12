import ListAndForm from '../pages/ListAndForm';
import Fpick from '../pages/File/Fpick';
import FListAndForm from '../pages/File/FListAndForm'

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
    path: '/Flist/:doctype',
    name: 'FileList',
    component: FListAndForm,
    props: true
  },
  {
    path: '/Fedit/:doctype/:name',
    name: 'FileForm',
    component: FListAndForm,
    props: true
  },
  {
    path: '/fpick/:doctype',
    name: 'FilePick',
    component: Fpick,
    props: true
  }
];
