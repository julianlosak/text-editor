// Import methods to save and get data from the IndexedDB database in './database.js'
import { getDb, putDb } from './database';
import { header } from './header';

export default class {
  constructor() {
    // Check if CodeMirror is loaded
    if (typeof CodeMirror === 'undefined') {
      throw new Error('CodeMirror is not loaded');
    }

    // Initialize the CodeMirror editor
    this.editor = CodeMirror(document.querySelector('#main'), {
      value: '',
      mode: 'javascript',
      theme: 'monokai',
      lineNumbers: true,
      lineWrapping: true,
      autofocus: true,
      indentUnit: 2,
      tabSize: 2,
    });

    // Load data from IndexedDB
    getDb()
      .then((data) => {
        if (data) {
          console.info('Loaded data from IndexedDB, injecting into editor');
          this.editor.setValue(data);
        } else {
          // If there's no data in IndexedDB, check localStorage
          const localData = localStorage.getItem('content');
          if (localData) {
            console.info('Loaded data from localStorage, injecting into editor');
            this.editor.setValue(localData);
          } else {
            // If neither IndexedDB nor localStorage has data, set the editor content to the header.
            this.editor.setValue(header);
          }
        }
      })
      .catch((error) => {
        console.error('Error loading data from IndexedDB:', error);
      });

    // Save the content of the editor to localStorage when changes are made
    this.editor.on('change', () => {
      localStorage.setItem('content', this.editor.getValue());
    });

    // Save the content of the editor to IndexedDB when the editor loses focus
    this.editor.on('blur', () => {
      console.log('The editor has lost focus');
      putDb(this.editor.getValue())
        .then(() => {
          console.log('Content saved to IndexedDB');
        })
        .catch((error) => {
          console.error('Error saving data to IndexedDB:', error);
        });
    });
  }
}
