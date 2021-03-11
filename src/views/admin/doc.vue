<template>
  <a-layout>
    <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
      <a-form layout="inline" :model="param">
        <a-form-item>
          <a-button type="primary" @click="handleQuery()">
            查询
          </a-button>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="add()">
            新增
          </a-button>
        </a-form-item>
      </a-form>
      <a-table :columns="columns" :row-key="record => record.id" :data-source="rootLevel" :pagination="false" :loading="loading">
        <template #cover="{ text: cover }">
          <img v-if="cover" :src="cover" alt="avatar" />
        </template>
        <template v-slot:action="{ text, record }">
          <a-space size="small">
            <a-button type="primary" @click="edit(record)">
              编辑
            </a-button>
            <a-popconfirm title="删除后不可恢复，确认删除吗?" ok-text="是" cancel-text="否" @confirm="del(record.id)">
              <a-button type="danger">
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-layout-content>
  </a-layout>

  <a-modal title="文档" v-model:visible="modalVisible" :confirm-loading="modalLoading" @ok="handleModalOk">
    <a-form :model="docs" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-form-item label="名称">
        <a-input v-model:value="docs.name" />
      </a-form-item>
      <a-form-item label="父文档">

        <a-tree-select v-model:value="docs.parentId" style="width: 100%" :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                       :tree-data="treeSelectData" placeholder="请选择父文档" tree-default-expand-all
                       :replaceFields="{title: 'name', key: 'id', value: 'id'}">
        </a-tree-select>
      </a-form-item>
      <a-form-item label="排序">
        <a-input v-model:value="docs.sort" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref, createVNode} from 'vue';
import axios from 'axios';
import {Tool} from '@/util/tool';
import {message, Modal} from 'ant-design-vue';
import {useRoute} from "vue-router";
import ExclamationCircleOutlined from "@ant-design/icons-vue/ExclamationCircleOutlined";

export default defineComponent({
  name: 'doc',
  setup() {
    const route = useRoute();
    const param: any = ref();
    param.value = {};

    const docs = ref();
    const doc = ref();
    const loading = ref(false);

    const columns = [
      {
        title: '名称',
        dataIndex: 'name'
      },
      {
        title: '排序',
        dataIndex: 'sort'
      },
      {
        title: '父文档',
        dataIndex: 'parentId'
      },
      {
        title: 'Action',
        key: 'action',
        slots: { customRender: 'action' }
      }
    ];

    const rootLevel = ref();

    /**
     * 数据查询
     **/
    const handleQuery = () => {
      loading.value = true;
      // 如果不清楚数据，在编辑保存后，重新加载列表数据，再进入编辑页面会显示之前的数据
      rootLevel.value = [];
      axios.get("/notes/doc/all").then((resp) => {
        loading.value = false;
        const response = resp.data;
        if (response.ok) {
          docs.value = response.data;
          rootLevel.value = Tool.array2Tree(response.data, 0);
        } else {
          message.error(response.msg);
        }
      });
    };

    // -------- 表单 ---------
    // 由于树选择组件的属性状态，会随当时编辑的节点而变化，所以单独声明一个响应式变量
    const treeSelectData = ref();
    treeSelectData.value = [];
    const modalVisible = ref(false);
    const modalLoading = ref(false);
    const handleModalOk = () => {
      modalLoading.value = true;

      axios.put("/notes/doc", docs.value).then((resp) => {
        const response: any = resp.data;
        if (response.ok) {
          modalVisible.value = false;
          modalLoading.value = false;

          handleQuery();
        } else {
          message.success(response.msg);
        }
        modalLoading.value = false;
      });
    };

    /**
     * 将某节点及其子孙节点全部置为disabled
     */
    const setDisable = (treeSelectData: any, id: any) => {
      // console.log(treeSelectData, id);
      // 遍历数组，即遍历某一层节点
      for (let i = 0; i < treeSelectData.length; i++) {
        const node = treeSelectData[i];
        if (node.id === id) {
          // 如果当前节点就是目标节点
          // 将目标节点设置为disabled
          node.disabled = true;

          // 遍历所有子节点，将所有子节点全部都加上disabled
          const children = node.children;
          if (Tool.isNotEmpty(children)) {
            for (let j = 0; j < children.length; j++) {
              setDisable(children, children[j].id)
            }
          }
        } else {
          // 如果当前节点不是目标节点，则到其子节点再找找看。
          const children = node.children;
          if (Tool.isNotEmpty(children)) {
            setDisable(children, id);
          }
        }
      }
    };

    /**
     * 获取指定id及其子节点
     */
    const deletingIds: Array<string> = [];
    const deletingNames: Array<string> = [];
    const getDelIds = (treeSelectData: any, id: any) => {
      // 遍历数组，即遍历某一层节点
      for (let i = 0; i < treeSelectData.length; i++) {
        const node = treeSelectData[i];
        if (node.id === id) {
          // 如果当前节点就是目标节点
          // 将目标节点设置为disabled
          // node.disabled = true;
          deletingIds.push(id);
          deletingNames.push(node.name);

          // 遍历所有子节点，将所有子节点全部都加上disabled
          const children = node.children;
          if (Tool.isNotEmpty(children)) {
            for (let j = 0; j < children.length; j++) {
              getDelIds(children, children[j].id)
            }
          }
        } else {
          // 如果当前节点不是目标节点，则到其子节点再找找看。
          const children = node.children;
          if (Tool.isNotEmpty(children)) {
            getDelIds(children, id);
          }
        }
      }
    };

    /**
     * 编辑
     */
    const edit = (record: any) => {
      modalVisible.value = true;
      modalLoading.value = false;
      // 需要使用复制功能，否则在编辑的时候，会立马修改页面上的值，尽管还没有提交修改
      docs.value = Tool.copy(record);
      docs.value.noteId = route.query.noteId;
      treeSelectData.value = Tool.copy(rootLevel.value);
      setDisable(treeSelectData.value, record.id);
      treeSelectData.value.unshift({id: 0, name: '无'})
    };

    /**
     * 新增
     */
    const add = () => {
      modalVisible.value = true;
      docs.value = {
        noteId: route.query.noteId,
      };

      treeSelectData.value = Tool.copy(rootLevel.value);
      treeSelectData.value.unshift({id: 0, name: '无'});
    };

    /**
     * 删除
     */
    const del = (id: string) => {
      // 清空
      deletingIds.length = 0;
      deletingNames.length = 0;
      // 重新获取
      getDelIds(rootLevel.value, id);
      Modal.confirm({
        title: '【警告】',
        icon: createVNode(ExclamationCircleOutlined),
        content: '确认删除：【' + deletingNames.join('、') + '】？',
        cancelText: '取消',
        okText: '确认',
        onOk() {
          axios.delete("/notes/doc/" + deletingIds.join(',')).then((resp) => {
            const response: any = resp.data;
            if (response.ok) {
              handleQuery()
            }
          });
        }
      })
    };

    onMounted(() => {
      handleQuery();
    });

    return {
      rootLevel,
      param,
      docs,
      columns,
      loading,
      treeSelectData,

      edit,
      add,
      del,

      doc,
      modalVisible,
      modalLoading,
      handleModalOk,
      handleQuery
    }
  }
});
</script>

<style scoped>
img {
  width: 32px;
  height: 32px;
}
</style>