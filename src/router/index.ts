import { createRouter, createWebHistory } from 'vue-router'
import TodoList from '../components/TodoList.vue'
import Goals2025 from '../components/Goals2025.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/todo',
      name: 'todo',
      component: TodoList
    },
    {
      path: '/goals2025',
      name: 'goals2025',
      component: Goals2025
    }
  ]
})

export default router
