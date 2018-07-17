import ListAndForm from '../pages/ListAndForm';
import FilePick from '../pages/File/FilePick';
import FileManager from '../pages/File/FileManager'
import ListAndPrintView from '../pages/ListAndPrintView';

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
    path: '/FileList/:doctype',
    name: 'FileList',
    component: FileManager,
    props: true
  },
  {
    path: '/FileEdit/:doctype/:name',
    name: 'FileForm',
    component: FileManager,
    props: true
  },
  {
    path: '/FilePick/:doctype',
    name: 'FilePick',
    component: FilePick,
    props: true
  },
  {
    path: '/print/:doctype/:name',
    name: 'PrintView',
    component: ListAndPrintView,
    props: true
  }
];
