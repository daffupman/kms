<template>
  <a-layout>
    <a-layout-content :style="{background: '#fff', padding: '24px', margin: 0, minHeight: '280px'}">
      <h3 v-if="rootLevel.length === 0">暂无相关文档</h3>
      <a-row>
        <a-col :span="6">
          <a-tree v-if="rootLevel.length > 0" :tree-data="rootLevel" @select="onSelect" :replaceFields="{title: 'name', key: 'id', value: 'id'}"
                  :defaultExpandAll="true" :defaultSelectedKeys="defaultSelectedKeys">
          </a-tree>
        </a-col>
        <a-col :span="18" v-if="rootLevel.length > 0">
          <div>
            <h2>{{doc.name}}</h2>
            <div>
              <span>阅读数：{{doc.viewCount}}</span>
            </div>
            <a-divider style="height: 2px; background-color: #9999cc"/>
          </div>
          <div class="editor" :innerHTML="html"></div>
          <div class="vote-div">
            <a-button type="primary" shape="round" size="large" @click="vote">
              <template #icon><LikeOutlined/>&nbsp;{{doc.voteCount}}&nbsp;次点赞&nbsp;</template>
            </a-button>
          </div>
        </a-col>
      </a-row>
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref} from 'vue';
import axios from 'axios';
import {message} from 'ant-design-vue';
import {Tool} from "@/util/tool";
import {useRoute} from "vue-router";

export default defineComponent({
  name: 'PortalDoc',
  setup() {
    const docs = ref();
    const route = useRoute();
    const defaultSelectedKeys = ref();
    defaultSelectedKeys.value = [];
    // 当前选中的文档
    const doc = ref();
    doc.value = {};

    /**
     * 一级文档树，children属性就是二级文档
     * [{
     *   id: "",
     *   name: "",
     *   children: [{
     *     id: "",
     *     name: "",
     *   }]
     * }]
     */
    const rootLevel = ref(); // 一级文档树，children属性就是二级文档
    rootLevel.value = [];

    const html = ref();

    /**
     * 内容查询
     **/
    const handleQueryContent = (docId: string) => {
      axios.get("/notes/doc/" + docId + "/content").then((resp) => {
        const response = resp.data;
        if (response.ok) {
          html.value = response.data;
        } else {
          message.error(response.msg);
        }
      });
    };

    const onSelect = (selectedKeys: any, info: any) => {
      if (Tool.isNotEmpty(selectedKeys)) {
        doc.value = info.selectedNodes[0].props;
        handleQueryContent(selectedKeys[0]);
      }
    };

    /**
     * 数据查询
     **/
    const handleQuery = () => {
      axios.get("/notes/note/" + route.query.noteId + "/docs").then((resp) => {
        const response = resp.data;
        if (response.ok) {
          docs.value = response.data;
          rootLevel.value = [];
          rootLevel.value = Tool.array2Tree(docs.value, 0);
          if (Tool.isNotEmpty(rootLevel.value)) {
            defaultSelectedKeys.value = [rootLevel.value[0].id];
            handleQueryContent(rootLevel.value[0].id);
            doc.value = rootLevel.value[0];
          }
        } else {
          message.error(response.msg);
        }
      });
    };

    const vote = () => {
      axios.get('/notes/doc/' + doc.value.id + '/voting').then(resp => {
        const response = resp.data;
        if (response.ok) {
          doc.value.voteCount ++;
          message.success("点赞成功！");
        } else {
          message.error(response.msg);
        }
      })
    }

    onMounted(() => {
      handleQuery();
    });

    return {
      rootLevel,
      html,
      doc,

      onSelect,
      vote
    }
  }
});
</script>

<style>
/* wangeditor默认样式, 参照: http://www.wangeditor.com/doc/pages/02-%E5%86%85%E5%AE%B9%E5%A4%84%E7%90%86/03-%E8%8E%B7%E5%8F%96html.html */
/* table 样式 */
.editor table {
  border-top: 1px solid #ccc;
  border-left: 1px solid #ccc;
}
.editor table td,
.editor table th {
  border-bottom: 1px solid #ccc;
  border-right: 1px solid #ccc;
  padding: 3px 5px;
}
.editor table th {
  border-bottom: 2px solid #ccc;
  text-align: center;
}

/* blockquote 样式 */
.editor blockquote {
  display: block;
  border-left: 8px solid #d0e5f2;
  padding: 5px 10px;
  margin: 10px 0;
  line-height: 1.4;
  font-size: 100%;
  background-color: #f1f1f1;
}

/* code 样式 */
.editor code {
  display: inline-block;
  *display: inline;
  *zoom: 1;
  background-color: #f1f1f1;
  border-radius: 3px;
  padding: 3px 5px;
  margin: 0 3px;
}
.editor pre code {
  display: block;
}

/* ul ol 样式 */
.editor ul, ol {
  margin: 10px 0 10px 20px;
}

/* 和antdv p冲突，覆盖掉 */
.editor blockquote p {
  font-family:"YouYuan",serif;
  margin: 20px 10px !important;
  font-size: 16px !important;
  font-weight:600;
}

.vote-div {
  padding: 15px;
  text-align: center;
}
</style>