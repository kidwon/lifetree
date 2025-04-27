<template>
  <div class="page">
    <header-bar :title="result.title || '结果详情'" />
    
    <div class="page-content">
      <div class="detail-header">
        <h2>{{ result.title }}</h2>
        <div class="detail-meta">
          <span>完成时间: {{ result.date }}</span>
        </div>
      </div>
      
      <van-cell-group inset title="结果内容">
        <div class="detail-content">
          <p>{{ result.description }}</p>
        </div>
      </van-cell-group>
      
      <van-cell-group inset title="相关文件" style="margin-top: 16px;">
        <van-cell title="查看文件" is-link />
      </van-cell-group>
    </div>
    
    <div class="bottom-action-bar">
      <div @click="goToAgreement">
        <div class="icon-circle">
          <van-icon name="friends-o" size="24" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderBar from '../components/HeaderBar.vue'

export default {
  name: 'ResultDetailPage',
  components: {
    HeaderBar
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      // 示例数据
      result: {
        id: null,
        title: '',
        date: '',
        description: ''
      }
    }
  },
  created() {
    // 模拟从API获取数据
    this.fetchData()
  },
  methods: {
    fetchData() {
      // 模拟API调用
      // 实际应用中，这里应该调用真实的API
      setTimeout(() => {
        // 假数据
        const data = {
          1: {
            id: 1,
            title: '结果1：应用原型设计',
            date: '2025-04-23',
            description: '完成了移动应用的原型设计，包括所有主要页面的布局和交互逻辑。设计符合现代UI/UX标准，着重考虑了用户体验和交互流畅性。'
          },
          2: {
            id: 2,
            title: '结果2：UI界面优化方案',
            date: '2025-04-24',
            description: '完成了网页UI优化方案，包括新的色彩方案、字体选择和布局调整。提供了响应式设计方案，确保在各种设备上都有良好的显示效果。'
          },
          3: {
            id: 3,
            title: '结果3：API接口文档',
            date: '2025-04-25',
            description: '完成了RESTful API接口文档，详细描述了所有接口的参数、返回值和使用方法。提供了认证机制说明和示例代码，便于前端开发人员集成。'
          }
        }
        
        this.result = data[this.id] || {
          id: this.id,
          title: '未知结果',
          date: '未知',
          description: '没有找到对应的结果信息'
        }
      }, 100)
    },
    goToAgreement() {
      this.$router.push('/agreement')
    }
  }
}
</script>

<style scoped>
.page-content {
  padding-top: 56px;
  padding-bottom: 70px;
}

.detail-header {
  padding: 16px;
}

.detail-meta {
  color: #999;
  font-size: 14px;
  margin-top: 8px;
}

.detail-content {
  padding: 16px;
  line-height: 1.6;
}

.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
}

.icon-circle .van-icon {
  color: #323233;
}
</style>