import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'
import home from '../views/home.vue'
import about from '../views/about.vue'
import note from '../views/admin/note.vue'
import category from "@/views/admin/category.vue";

const routes = [
  {
    path: '/',
    name: 'Home',
    component: home
  },
  {
    path: '/note',
    name: 'Note',
    component: note
  },
  {
    path: '/category',
    name: 'Category',
    component: category
  },
  {
    path: '/about',
    name: 'About',
    component: about
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
