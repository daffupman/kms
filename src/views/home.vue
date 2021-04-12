<template>
  <a-layout>
    <a-layout-sider width="200" style="background: #ffffff">
      <a-menu mode="inline" :style="{ height: '100%', borderRight: 0 }" @click="handleClick">
        <a-menu-item key="welcome">
          <MailOutlined/>
          <span>欢迎</span>
        </a-menu-item>
        <a-sub-menu v-for="c in rootLevel" :key="c.id" v-show="user.id">
          <template v-slot:title>
            <span><user-outlined/>{{ c.cateName }}</span>
          </template>
          <a-menu-item v-for="child in c.children" :key="child.id">
            <MailOutlined/>
            <span>{{ child.cateName }}</span>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
      <div class="welcome" v-show="welcomeShowed">
        <the-welcome/>
      </div>
      <a-list v-if="!welcomeShowed" item-layout="vertical" size="large" :grid="{gutter: 20, column: 3}"
              :data-source="notes">
        <template #renderItem="{ item }">
          <a-list-item key="item.name">
            <template #actions>
              <span>
                <component v-bind:is="'FileOutlined'" style="margin-right: 8px"/>
                {{ item.docCount }}
              </span>
              <span>
                <component v-bind:is="'UserOutlined'" style="margin-right: 8px"/>
                {{ item.viewCount }}
              </span>
              <span>
                <component v-bind:is="'LikeOutlined'" style="margin-right: 8px"/>
                {{ item.voteCount }}
              </span>
            </template>
            <a-list-item-meta :description="item.description">
              <template #title>
                <router-link :to="'/portal/doc?noteId=' + item.id">
                  {{ item.name }}
                </router-link>
              </template>
              <template #avatar>
                <a-avatar :src="item.cover"/>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, ref} from 'vue';
import axios from 'axios';
import {Tool} from '@/util/tool';
import {message} from 'ant-design-vue';
import store from "@/store";
import TheWelcome from "@/components/the-welcome.vue";

export default defineComponent({
  name: 'home',
  components: {
    TheWelcome
  },
  // setup是vue3新增的，用于初始化的方法
  setup() {

    const notes = ref();
    const rootLevel = ref();
    const user = computed(() => store.state.user);

    const handleQueryCategories = () => {
      if (user.value.id) {
        axios.get("/notes/category/all").then(resp => {
          const response = resp.data;
          console.log(response)
          if (response.ok) {
            const data = response.data;
            rootLevel.value = Tool.array2Tree(data, 0)
          } else {
            message.error(response.msg);
          }
        })
      }
    }

    const welcomeShowed = ref(true);
    let currCategoryId = 0;

    const handleQueryNotes = () => {
      axios.get("/notes/note",
          {params: {page: 1, size: 1000, categoryId: currCategoryId}}
      ).then((resp) => {
        const response = resp.data;
        if (response.ok) {
          notes.value = response.data.list;
        } else {
          message.error(response.msg)
        }
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
        {type: 'StarOutlined', text: '156'},
        {type: 'LikeOutlined', text: '156'},
        {type: 'MessageOutlined', text: '2'},
      ],
      rootLevel,
      welcomeShowed,
      user,

      handleClick
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