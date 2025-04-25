<template>
    <div class="page">
      <header-bar :title="'需求详情'" />
      
      <div class="page-content">
        <div class="detail-header">
          <h2>{{ requirement.title }}</h2>
          <div class="detail-meta">
            <span>发布时间: {{ requirement.date }}</span>
          </div>
        </div>
        
        <van-cell-group inset title="需求描述">
          <div class="detail-content">
            <p>{{ requirement.description }}</p>
          </div>
        </van-cell-group>
        
        <van-cell-group inset title="需求附件" style="margin-top: 16px;">
          <van-cell title="查看附件" is-link />
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
    name: 'RequirementDetailPage',
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
        requirement: {
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
              title: '需求1：移动应用开发',
              date: '2025-04-20',
              description: '开发一个移动版应用，包含需求列表、结果列表等功能。需要支持用户登录和个人信息管理。界面需要简洁易用，符合现代设计规范。'
            },
            2: {
              id: 2,
              title: '需求2：网页设计优化',
              date: '2025-04-21',
              description: '对现有网页进行设计优化，提升用户体验和交互效果。包括色彩方案调整、布局优化和响应式设计实现。'
            },
            3: {
              id: 3,
              title: '需求3：后端服务开发',
              date: '2025-04-22',
              description: '开发RESTful API服务，支持前端应用的数据需求。包括用户认证、数据存储和业务逻辑处理。需要高性能和可扩展性。'
            }
          }
          
          this.requirement = data[this.id] || {
            id: this.id,
            title: '未知需求',
            date: '未知',
            description: '没有找到对应的需求信息'
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