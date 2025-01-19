import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// 挂载TodoList组件
import TodoList from './components/TodoList.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.component('TodoList', TodoList)

app.mount('#app')
