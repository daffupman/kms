<template>
  <div>
    <a-row>
      <a-col :span="24">
        <a-card>
          <a-row>
            <a-col :span="8">
              <a-statistic title="总阅读量" :value="statistic.viewCount">
                <template #suffix>
                  <UserOutlined/>
                </template>
              </a-statistic>
            </a-col>
            <a-col :span="8">
              <a-statistic title="总点赞量" :value="statistic.voteCount">
                <template #suffix>
                  <like-outlined/>
                </template>
              </a-statistic>
            </a-col>
            <a-col :span="8">
              <a-statistic title="点赞率" :value="statistic.voteCount / statistic.viewCount * 100"
                           :precision="2" suffix="%" :value-style="{ color: '#cf1322' }">
                <template #suffix>
                  <like-outlined/>
                </template>
              </a-statistic>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>
    <br>
    <a-row :gutter="16">
      <a-col :span="12">
        <a-card>
          <a-row>
            <a-col :span="12">
              <a-statistic title="今日阅读" :value="statistic.todayViewCount" style="margin-right: 50px">
                <template #suffix>
                  <UserOutlined/>
                </template>
              </a-statistic>
            </a-col>
            <a-col :span="12">
              <a-statistic title="今日点赞" :value="statistic.todayVoteCount">
                <template #suffix>
                  <like-outlined/>
                </template>
              </a-statistic>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card>
          <a-row>
            <a-col :span="12">
              <a-statistic
                  title="预计今日阅读"
                  :value="statistic.todayViewIncrease"
                  :value-style="{ color: '#0000ff' }">
                <template #suffix>
                  <UserOutlined/>
                </template>
              </a-statistic>
            </a-col>
            <a-col :span="12">
              <a-statistic
                  title="预计今日阅读增长" :value="statistic.todayViewIncreaseRateAbs"
                  :precision="2" suffix="%" class="demo-class"
                  :value-style="statistic.todayViewIncreaseRate < 0 ? { color: '#3f8600' } : { color: '#cf1322' }">
                <template #prefix>
                  <arrow-down-outlined v-if="statistic.todayViewIncreaseRate < 0"/>
                  <arrow-up-outlined v-if="statistic.todayViewIncreaseRate >= 0"/>
                </template>
              </a-statistic>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>
    <br/>
    <a-row>
      <a-col :span="24">
        <div id="main" style="width: 100%; height: 300px;"/>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from 'vue'
import axios from 'axios';
import {message} from "ant-design-vue";

declare let echarts: any;
export default defineComponent({
  name: 'the-welcome',
  setup() {
    const statistic = ref();
    statistic.value = {};
    const queryStatistics = () => {
      axios.get('/notes/note/statistics').then((resp) => {
        const response = resp.data;
        if (response.ok) {
          const data = response.data;
          statistic.value.viewCount = data[1].viewCount;
          statistic.value.voteCount = data[1].voteCount;
          statistic.value.todayViewCount = data[1].viewIncrease;
          statistic.value.todayVoteCount = data[1].voteIncrease;
          // 按分钟计算当前时间点，占一天的百分比
          const now = new Date();
          const nowRate = (now.getHours() * 60 + now.getMinutes()) / (60 * 24);
          // console.log(nowRate)
          statistic.value.todayViewIncrease = parseInt(String(data[1].viewIncrease / nowRate));
          // todayViewIncreaseRate：今日预计增长率
          statistic.value.todayViewIncreaseRate = (statistic.value.todayViewIncrease - data[0].viewIncrease) / data[0].viewIncrease * 100;
          statistic.value.todayViewIncreaseRateAbs = Math.abs(statistic.value.todayViewIncreaseRate);
        } else {
          message.error(response.msg)
        }
      });
    };

    const init30DayEcharts = (list: any) => {
      const myChart = echarts.init(document.getElementById('main'));

      const xAxis = [];
      const seriesView = [];
      const seriesVote = [];
      for (let i = 0; i < list.length; i++) {
        const record = list[i];
        xAxis.push(record.createTime);
        seriesView.push(record.viewIncrease);
        seriesVote.push(record.voteIncrease);
      }

      // 指定图表的配置项和数据
      const option = {
        title: {
          text: '30天趋势图'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['总阅读量', '总点赞量']
        },
        grid: {
          left: '1%',
          right: '3%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xAxis
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '总阅读量',
            type: 'line',
            // stack: '总量', 不堆叠
            data: seriesView,
            smooth: true
          },
          {
            name: '总点赞量',
            type: 'line',
            // stack: '总量', 不堆叠
            data: seriesVote,
            smooth: true
          }
        ]
      };

      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
    };

    const queryStatistics30 = () => {
      axios.get('/notes/note/statistics30').then((resp) => {
        const response = resp.data;
        if (response.ok) {
          const statisticList = response.data;
          console.log(statisticList);
          init30DayEcharts(statisticList)
        }
      });
    };

    onMounted(() => {
      queryStatistics();
      queryStatistics30();
    });
    return {
      statistic,
      queryStatistics,
      queryStatistics30,
    }
  }
});
</script>