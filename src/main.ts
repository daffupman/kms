import { createApp } from 'vue'
import App from './app.vue'
import router from './router'
import store from './store'
import antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import * as Icons from '@ant-design/icons-vue';
import axios from 'axios';
import {Tool} from "@/util/tool";

axios.defaults.baseURL = process.env.VUE_APP_NOTES_SERVER;

/**
 * axios拦截器
 */
axios.interceptors.request.use(function (config) {
    const token = store.state.user.token;
    if (Tool.isNotEmpty(token)) {
        config.headers.token = token;
    }
    console.log('请求参数：', config);
    return config;
}, error => {
    return Promise.reject(error);
});
axios.interceptors.response.use(resp => {
    console.log('返回结果：', resp);
    const response = resp.data;
    if (!response.ok && response.code === 4000) {
        // 没有认证，那么就跳转到首页
        router.replace({path: '/'}).then(() => {
            store.commit('setUser', {})
            console.log("用户未登录")
        });
    }
    return resp;
}, error => {
    console.log('返回错误：', error);
    return Promise.reject(error);
});


const app = createApp(App);
app.use(store).use(router).use(antd).mount('#app');

const icons: any = Icons;
for (const ic in icons) {
    app.component(ic, icons[ic])
}