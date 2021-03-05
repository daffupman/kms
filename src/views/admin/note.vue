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
      <a-table :columns="columns" :row-key="record => record.id" :data-source="notes" :pagination="pagination" :loading="loading" @change="handleTableChange">
        <template #cover="{ text: cover }">
          <img v-if="cover" :src="cover" alt="avatar" />
        </template>
        <template v-slot:category="{text, record}">
          <span>{{getCategoryName(record.category1Id)}} / {{getCategoryName(record.category2Id)}}</span>
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

  <a-modal title="编辑笔记基本信息" v-model:visible="modalVisible" :confirm-loading="false" @ok="handleModalOk">
    <a-form :model="notes" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-form-item label="封面">
        <a-input v-model:value="notes.cover" />
      </a-form-item>
      <a-form-item label="名称">
        <a-input v-model:value="notes.name" />
      </a-form-item>
      <a-form-item label="分类">
        <a-cascader v-model:value="categoryIds" :field-names="{label: 'cateName', value: 'id', children: 'children'}" :options="rootLevel"/>
      </a-form-item>
      <a-form-item label="描述">
        <a-input v-model:value="notes.description" type="textarea"/>
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
  name: 'note',
  setup() {
    const param: any = ref();
    param.value = {};

    const notes = ref();
    const note = ref();
    const pagination = ref({
      current: 1,
      pageSize: 4,
      total: 0
    });
    const loading = ref(false);

    const columns = [
      {
        title: '封面',
        dataIndex: 'cover',
        slots: { customRender: 'cover' }
      },
      {
        title: '名称',
        dataIndex: 'name'
      },
      {
        title: '分类',
        slots: { customRender: 'category'}
      },
      {
        title: '文档数',
        dataIndex: 'docCount'
      },
      {
        title: '阅读数',
        dataIndex: 'viewCount'
      },
      {
        title: '点赞数',
        dataIndex: 'voteCount'
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
      axios.get("http://localhost:10020/notes/note", {
        params: {
          noteName: param.value.name,
          pageNum: params.page,
          pageSize: params.size
        }
      }).then((resp) => {
        loading.value = false;
        const response = resp.data;
        if (response.ok) {
          notes.value = response.data.list;
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
    const categoryIds = ref();
    const handleModalOk = () => {
      modalLoading.value = true;
      notes.value.category1Id = categoryIds.value[0];
      notes.value.category2Id = categoryIds.value[1];
      axios.put("http://localhost:10020/notes/note", notes.value).then((resp) => {
        const response: any = resp.data;
        if (response.ok) {
          modalVisible.value = false;
          modalLoading.value = false;

          handleQuery({
            page: pagination.value.current,
            size: pagination.value.pageSize
          })
        } else {
          message.error(response.message);
        }
      });
    };

    /**
     * 编辑
     */
    const edit = (record: any) => {
      modalVisible.value = true;
      // 需要使用复制功能，否则在编辑的时候，会立马修改页面上的值，尽管还没有提交修改
      notes.value = Tool.copy(record);
      categoryIds.value = [notes.value.category1Id, notes.value.category2Id];
    };

    /**
     * 新增
     */
    const add = () => {
      modalVisible.value = true;
      notes.value = {};
    };

    /**
     * 删除
     */
    const del = (id: number) => {
      axios.delete("http://localhost:10020/notes/note/" + id).then((resp) => {
        const response: any = resp.data;
        if (response.ok) {
          handleQuery({
            page: pagination.value.current,
            size: pagination.value.pageSize
          })
        }
      });
    };

    const rootLevel = ref();
    let categories: any;

    const handleQueryCategories = () => {
      loading.value = true;
      axios.get("http://localhost:10020/notes/category/all").then(resp => {
        loading.value = false;
        const response = resp.data;
        if (response.ok) {
          const data = response.data;
          categories = data;
          rootLevel.value = Tool.array2Tree(data, 0)
          handleQuery({
            page: 1,
            size: pagination.value.pageSize
          });
        } else {
          message.error(response.message);
        }
      })
    }

    const getCategoryName = (cid: number) => {
      let result = "";
      categories.forEach((each: any) => {
        if (each.id === cid) {
          result = each.cateName;
        }
      })
      return result;
    }

    onMounted(() => {
      handleQueryCategories();
    });

    return {
      param,
      notes,
      pagination,
      columns,
      loading,
      categoryIds,
      rootLevel,

      edit,
      add,
      del,

      note,
      modalVisible,
      modalLoading,
      handleTableChange,
      handleModalOk,
      handleQuery,
      getCategoryName
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