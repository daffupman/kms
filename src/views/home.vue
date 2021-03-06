<template>
  <a-layout>
    <a-layout-sider width="200" style="background: #ffffff">
      <a-menu mode="inline" :style="{ height: '100%', borderRight: 0 }" @click="handleClick">
        <a-menu-item key="welcome">
          <MailOutlined/><span>欢迎</span>
        </a-menu-item>
        <a-sub-menu v-for="c in rootLevel" :key="c.id">
          <template v-slot:title>
            <span><user-outlined />{{c.cateName}}</span>
          </template>
          <a-menu-item v-for="child in c.children" :key="child.id">
            <MailOutlined/><span>{{child.cateName}}</span>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
      <div class="welcome" v-show="welcomeShowed">
        <h1>欢迎使用知识管理平台</h1>
      </div>
      <a-list v-show="!welcomeShowed" item-layout="vertical" size="large" :grid="{gutter: 20, column: 3}" :data-source="notes">
        <template #renderItem="{ item }">
          <a-list-item key="item.name">
            <template #actions>
              <span v-for="{ type, text } in actions" :key="type">
                <component v-bind:is="type" style="margin-right: 8px" />
                {{ text }}
              </span>
            </template>
            <a-list-item-meta :description="item.description">
              <template #title>
                <router-link :to="'/portal/doc?noteId=' + item.id">
                  {{ item.name }}
                </router-link>
              </template>
              <template #avatar><a-avatar :src="item.cover" /></template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from 'vue';
import axios from 'axios';
import {Tool} from '@/util/tool';
import {message} from 'ant-design-vue';

export default defineComponent({
  name: 'home',
  // setup是vue3新增的，用于初始化的方法
  setup() {

    const notes = ref();

    const rootLevel = ref();
    let categories: any;

    const handleQueryCategories = () => {
      axios.get("/notes/category/all").then(resp => {
        const response = resp.data;
        if (response.ok) {
          const data = response.data;
          rootLevel.value = Tool.array2Tree(data, 0)
        } else {
          message.error(response.message);
        }
      })
    }

    const welcomeShowed = ref(true);
    let currCategoryId = 0;

    const handleQueryNotes = () => {
      axios.get("/notes/note",
          {params: {page: 1, size: 1000, categoryId: currCategoryId}}
      ).then((resp) => {
        const response = resp.data;
        notes.value = response.data.list;
      });
    }

    const handleClick = (value: any) => {
      if (value.key === 'welcome') {
        welcomeShowed.value = true;
      } else {
        currCategoryId = value.key;
        welcomeShowed.value = false;
        handleQueryNotes()
      }
    };

    // onMounted方法中可以编写初始化逻辑
    onMounted(() => {
      handleQueryCategories();
    });

    return {
      notes,
      actions: [
        { type: 'StarOutlined', text: '156' },
        { type: 'LikeOutlined', text: '156' },
        { type: 'MessageOutlined', text: '2' },
      ],

      rootLevel,
      handleClick,
      welcomeShowed
    }
  }
});
</script>

<style scoped>
.ant-avatar {
  width: 50px;
  height: 50px;
  line-height: 50px;
  border-radius: 8%;
  margin: 5px 0;
}
</style>