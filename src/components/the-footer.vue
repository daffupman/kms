<template>
  <a-layout-footer style="text-align: center">
    [ 笔记应用 Notes App ] - Knowledge Management System
  </a-layout-footer>
</template>

<script lang="ts">
import {defineComponent, onMounted} from 'vue';
import {Tool} from '@/util/tool';
import {notification} from 'ant-design-vue';

export default defineComponent({
  name: 'the-footer',
  setup() {
    let websocket: any;
    let token: any;
    const onOpen = () => {
      console.log("websocket连接成功，状态码：", websocket.readyState);
    };
    const onMessage = (event: any) => {
      notification['info']({
        message: '系统通知',
        description: event.data,
        duration: 2
      });
    };
    const onError = () => {
      console.log('websocket连接错误，状态码：', websocket.readyState);
    };
    const onClose = () => {
      console.log('websocket连接关闭，状态码：', websocket.readyState);
    };
    const initWebSocket = () => {
      websocket.onopen = onOpen;
      websocket.onmessage = onMessage;
      websocket.onerror = onError;
      websocket.onclose = onClose;
    };
    onMounted(() => {
      if ('WebSocket' in window) {
        token = Tool.uuid(10);
        websocket = new WebSocket(process.env.VUE_APP_NOTES_WS_SERVER + '/notes/ws/' + token);
        initWebSocket();
      } else {
        alert('当前浏览器不支持')
      }
    })
  }
});
</script>