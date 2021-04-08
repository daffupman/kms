import { createStore } from 'vuex'

declare let SessionStorage: any;
const USER = "USER";

const store = createStore({
  // 定义全局变量
  state: {
    user: SessionStorage.get(USER) || {}
  },
  // 定义对全局变量的操作（同步）
  mutations: {
    setUser (state, user) {
      console.log("store user：", user);
      state.user = user;
      SessionStorage.set(USER, user);
    }
  },
  // 定义对全局变量的操作（异步）
  actions: {
  },
  modules: {
  }
})

export default store;