<template>
    <div class="page">
      <header-bar 
        :title="'相关结果'" 
        right-text="添加结果"
        @right-click="goToNewResult"
      />
      
      <div class="page-content">
        <van-loading v-if="loading" vertical class="loading-overlay">加载中...</van-loading>
        
        <template v-else>
          <div class="requirement-info">
            <h3>需求: {{ requirementTitle }}</h3>
          </div>
          
          <van-empty v-if="resultsList.length === 0" description="暂无相关结果数据" />
          
          <van-cell-group v-else class="list-container">
            <van-cell 
              v-for="item in resultsList" 
              :key="item.id"
              :title="item.title"
              is-link
              @click="goToResultDetail(item.id)"
              class="list-item"
            >
              <template #right-icon>
                <van-tag :type="getStatusType(item.status)" class="status-tag">{{ getStatusText(item.status) }}</van-tag>
              </template>
            </van-cell>
          </van-cell-group>
        </template>
      </div>
    </div>
  </template>
  
  <script>
  import HeaderBar from '../components/HeaderBar.vue'
  import apiService from '../api/api'
  import { showFailToast } from 'vant'
  
  export default {
    name: 'ResultsByRequirementPage',
    components: {
      HeaderBar
    },
    props: {
      requirementId: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        resultsList: [],
        requirementTitle: '',
        loading: true
      }
    },
    created() {
      this.fetchRequirementData()
      this.fetchResultsData()
    },
    methods: {
      async fetchRequirementData() {
        try {
          const response = await apiService.requirements.getById(this.requirementId)
          this.requirementTitle = response.data.title
        } catch (error) {
          console.error('Error fetching requirement data:', error)
          this.requirementTitle = '未知需求'
        }
      },
      async fetchResultsData() {
        try {
          const response = await apiService.results.getByRequirement(this.requirementId)
          this.resultsList = response.data
        } catch (error) {
          console.error('Error fetching results data:', error)
          showFailToast('获取结果数据失败')
        } finally {
          this.loading = false
        }
      },
      goToResultDetail(id) {
        this.$router.push(`/result/${id}`)
      },
      goToNewResult() {
        // 导航到创建新结果页面，预填关联的需求ID
        this.$router.push(`/result/new?requirementId=${this.requirementId}`)
      },
      getStatusText(status) {
        const statusMap = {
          'DRAFT': '草稿',
          'COMPLETED': '已完成',
          'ARCHIVED': '已归档',
          'REJECTED': '已拒绝'
        }
        return statusMap[status] || '未知状态'
      },
      getStatusType(status) {
        const typeMap = {
          'DRAFT': 'primary',
          'COMPLETED': 'success',
          'ARCHIVED': 'warning',
          'REJECTED': 'danger'
        }
        return typeMap[status] || 'default'
      }
    }
  }
  </script>
  
  <style scoped>
  .page-content {
    padding-top: 56px;
    padding-bottom: 20px;
  }
  
  .requirement-info {
    padding: 16px;
    background-color: #f7f8fa;
    border-bottom: 1px solid #ebedf0;
  }
  
  .requirement-info h3 {
    margin: 0;
    font-size: 16px;
    color: #323233;
  }
  
  .list-container {
    margin-top: 12px;
  }
  
  .list-item {
    font-size: 16px;
    border-bottom: 1px solid #ebedf0;
  }
  
  .status-tag {
    margin-right: 8px;
  }
  
  .loading-overlay {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
  }
  </style>