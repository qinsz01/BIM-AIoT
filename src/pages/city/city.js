import 'babel-polyfill'
import 'es6-promise/auto'

import { createApp } from 'vue'
import axios from 'axios'
import App from './GISScene.vue'

const app = createApp(App);
app.mount('#app');

app.provide('$axios', axios);

axios.interceptors.response.use(
  response => {
    response.headers['X-Frame-Options'] = 'SAMEORIGIN';
    return response;
  },
  error => {
    return Promise.reject(error);
  }
)
