<template>
  <a-layout-header class="header">
    <div class="logo"/>
    <a-menu theme="dark" mode="horizontal" v-model:selectedKeys="selectedKeys1" :style="{ lineHeight: '64px' }">
      <a-menu-item key="/">
        <router-link to="/">首页</router-link>
      </a-menu-item>
      <a-menu-item key="/note">
        <router-link to="/note">笔记管理</router-link>
      </a-menu-item>
      <a-menu-item key="/category">
        <router-link to="/category">分类管理</router-link>
      </a-menu-item>
      <a-menu-item key="/about">
        <router-link to="/about">关于我们</router-link>
      </a-menu-item>
    </a-menu>
  </a-layout-header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'the-header',
});
</script>