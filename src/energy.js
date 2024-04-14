import 'babel-polyfill'
import 'es6-promise/auto'

import * as Vue from 'vue'
import axios from 'axios'
import App from './energy.vue'

// 'apiProxy' is now ready to be used as middleware in a server.

const app = Vue.createApp(App);
app.mount('#app');

app.provide('$axios', axios);