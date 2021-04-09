import {createRouter, createWebHistory} from 'vue-router'
import home from '../views/home.vue'
import about from '../views/about.vue'
import note from '../views/admin/note.vue'
import doc from '../views/admin/doc.vue'
import portalDoc from '../views/portal-doc.vue'
import category from "@/views/admin/category.vue";
import user from "@/views/admin/user.vue";
import {Tool} from "@/util/tool";
import store from "@/store";

const routes = [
    {
        path: '/',
        name: 'Home',
        component: home
    },
    {
        path: '/note',
        name: 'Note',
        component: note,
        meta: {
            requiredAuth: true
        }
    },
    {
        path: '/category',
        name: 'Category',
        component: category,
        meta: {
            requiredAuth: true
        }
    },
    {
        path: '/doc',
        name: 'Doc',
        component: doc,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/user',
        name: 'User',
        component: user,
        meta: {
            requiresAuth: true
        }
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

// 路由登录拦截
router.beforeEach((to, from, next) => {
    if (to.matched.some(item => item.meta.requiresAuth)) {
        const loginUser = store.state.user;
        if (Tool.isEmpty(loginUser)) {
            next('/');
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router
