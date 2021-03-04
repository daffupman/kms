<template>
  <a-layout>
    <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
      <a-form layout="inline" :model="param">
        <a-form-item>
          <a-input v-model:value="param.name" placeholder="名称">
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleQuery({page: 1, size: pagination.pageSize})">
            查询
          </a-button>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="add()">
            新增
          </a-button>
        </a-form-item>
      </a-form>
      <a-table :columns="columns" :row-key="record => record.id" :data-source="categories" :pagination="pagination" :loading="loading" @change="handleTableChange">
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

  <a-modal title="编辑分类基本信息" v-model:visible="modalVisible" :confirm-loading="modalLoading" @ok="handleModalOk">
    <a-form :model="categories" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-form-item label="名称">
        <a-input v-model:value="categories.cateName" />
      </a-form-item>
      <a-form-item label="父分类id">
        <a-input v-model:value="categories.parentId" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import axios from 'axios';
import {Tool} from '@/util/tool';
import {message} from 'ant-design-vue';

export default defineComponent({
  name: 'category',
  setup() {
    const param: any = ref();
    param.value = {};

    const categories = ref();
    const category = ref();
    const pagination = ref({
      current: 1,
      pageSize: 4,
      total: 0
    });
    const loading = ref(false);

    const columns = [
      {
        title: '名称',
        dataIndex: 'cateName'
      },
      {
        title: '父类id',
        dataIndex: 'parentId'
      },
      {
        title: 'Action',
        key: 'action',
        slots: { customRender: 'action' }
      }
    ];

    /**
     * 数据查询
     **/
    const handleQuery = (params: any) => {
      loading.value = true;
      axios.get("http://localhost:10020/notes/category", {
        params: {
          cateName: param.value.name,
          pageNum: params.page,
          pageSize: params.size
        }
      }).then((resp) => {
        loading.value = false;
        const response = resp.data;
        if (response.ok) {
          categories.value = response.data.list;
          // 重置分页按钮
          pagination.value.current = params.page;
          pagination.value.total = response.data.total;
        } else {
          message.error(response.msg);
        }
      });
    };

    /**
     * 表格点击页码时触发
     */
    const handleTableChange = (pagination: any) => {
      handleQuery({
        page: pagination.current,
        size: pagination.pageSize
      });
    };

    // -------- 表单 ---------
    /**
     * 数组，[100, 101]对应：前端开发 / Vue
     */
    const modalVisible = ref(false);
    const modalLoading = ref(false);
    const handleModalOk = () => {
      modalLoading.value = true;

      axios.put("http://localhost:10020/notes/category", categories.value).then((resp) => {
        const response: any = resp.data;
        if (response.ok) {
          modalVisible.value = false;
          modalLoading.value = false;

          handleQuery({
            page: pagination.value.current,
            size: pagination.value.pageSize
          })
        }
      });
    };

    /**
     * 编辑
     */
    const edit = (record: any) => {
      modalVisible.value = true;
      // 需要使用复制功能，否则在编辑的时候，会立马修改页面上的值，尽管还没有提交修改
      categories.value = Tool.copy(record);
    };

    /**
     * 新增
     */
    const add = () => {
      modalVisible.value = true;
      categories.value = {};
    };

    /**
     * 删除
     */
    const del = (id: number) => {
      axios.delete("http://localhost:10020/notes/category/" + id).then((resp) => {
        const response: any = resp.data;
        if (response.ok) {
          handleQuery({
            page: pagination.value.current,
            size: pagination.value.pageSize
          })
        }
      });
    };

    onMounted(() => {
      handleQuery({
        page: 1,
        size: pagination.value.pageSize
      });
    });

    return {
      param,
      categories,
      pagination,
      columns,
      loading,

      edit,
      add,
      del,

      category,
      modalVisible,
      modalLoading,
      handleTableChange,
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