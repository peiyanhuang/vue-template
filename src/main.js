// babel-polyfill按需引入
import 'core-js/es7/set'
import 'core-js/es7/promise'
import 'core-js/es7/array'
import 'core-js/es7/string'
import 'core-js/es7/object'
import 'regenerator-runtime/runtime'

import Vue from 'vue'
import App from './App'
import store from './store'
import router from './router'
import api from './api'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/styles/index.less'

Vue.use(ElementUI)
Vue.use(api)

/* eslint-disable no-new */
const app = new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

window.$app = app

console.log(process.env.NODE_ENV)

export default app
