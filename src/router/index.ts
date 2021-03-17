import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'
import home from '../views/home.vue'
import about from '../views/about.vue'
import note from '../views/admin/note.vue'
import doc from '../views/admin/doc.vue'
import portalDoc from '../views/portal-doc.vue'
import category from "@/views/admin/category.vue";
import user from "@/views/admin/user.vue";

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
    path: '/doc',
    name: 'Doc',
    component: doc
  },
  {
    path: '/user',
    name: 'User',
    component: user
  },
  {
    path: '/portal/doc',
    name: 'PortalDoc',
    component: portalDoc
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
