import 'babel-polyfill'
import 'es6-promise/auto'

import { createApp } from 'vue'
import axios from 'axios'
import App from './energy.vue'

const app = createApp(App);
app.mount('#app');

app.provide('$axios', axios);