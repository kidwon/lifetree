<!-- AdminDashboard.vue -->
<template>
  <div class="page">
    <header-bar :title="'管理控制台'" />
    
    <div class="page-content">
      <div class="section-header">
        <h2>系统状态</h2>
      </div>
      
      <van-cell-group inset class="dashboard-group">
        <van-cell title="API状态" :value="apiStatus" :value-class="apiStatus === '在线' ? 'status-online' : 'status-offline'" />
        <van-cell title="当前用户数" :value="userCount.toString()" />
        <van-cell title="需求总数" :value="requirementCount.toString()" />
        <van-cell title="结果总数" :value="resultCount.toString()" />
      </van-cell-group>
      
      <div class="section-header">
        <h2>操作</h2>
      </div>
      
      <van-cell-group inset class="dashboard-group">
        <van-cell title="用户管理" is-link @click="navigateTo('/admin/users')" />
        <van-cell title="系统设置" is-link @click="navigateTo('/admin/settings')" />
        <van-cell 
          title="控制台日志" 
          is-link 
          :value="logVisible ? '已开启' : '已关闭'"
          :value-class="logVisible ? 'status-online' : ''"
          @click="toggleConsoleLogger" 
        />
      </van-cell-group>
    </div>
    
    <!-- 日志控制台组件，根据logVisible控制显示 -->
    <console-logger v-if="logVisible" />
    
    <nav-bar />
  </div>
</template>

<script>
import HeaderBar from '../components/HeaderBar.vue'
import NavBar from '../components/NavBar.vue'
import ConsoleLogger from '../components/ConsoleLogger.vue'
import apiService from '../api/api'
import { showToast, showFailToast } from 'vant'

export default {
  name: 'AdminDashboard',
  components: {
    HeaderBar,
    NavBar,
    ConsoleLogger
  },
  data() {
    return {
      apiStatus: '检查中...',
      userCount: 0,
      requirementCount: 0,
      resultCount: 0,
      logVisible: false
    }
  },
  mounted() {
    this.checkApiStatus()
    this.fetchSystemStats()
    
    // 触发一些控制台输出，用于演示
    console.log('管理控制台已加载')
    console.info('这是一条信息日志')
    setTimeout(() => {
      console.warn('这是一条警告日志')
    }, 1000)
    setTimeout(() => {
      console.error('这是一条错误日志')
    }, 2000)
  },
  methods: {
    async checkApiStatus() {
      try {
        // 检查API状态
        const response = await apiService.health()
        this.apiStatus = response.data.status === 'UP' ? '在线' : '离线'
        console.log('API状态检查完成:', this.apiStatus)
      } catch (error) {
        console.error('API状态检查失败:', error)
        this.apiStatus = '离线'
      }
    },
    async fetchSystemStats() {
      try {
        // 获取系统统计数据
        const usersResponse = await apiService.user.getAllUsers()
        this.userCount = usersResponse.data.length
        console.log('获取到用户数量:', this.userCount)
        
        const requirementsResponse = await apiService.requirements.getAll()
        this.requirementCount = requirementsResponse.data.length
        console.log('获取到需求数量:', this.requirementCount)
        
        const resultsResponse = await apiService.results.getAll()
        this.resultCount = resultsResponse.data.length
        console.log('获取到结果数量:', this.resultCount)
      } catch (error) {
        console.error('获取系统统计数据失败:', error)
        showFailToast('获取系统统计数据失败')
      }
    },
    toggleConsoleLogger() {
      this.logVisible = !this.logVisible
      showToast(this.logVisible ? '已开启日志控制台' : '已关闭日志控制台')
      console.log(this.logVisible ? '日志控制台已开启' : '日志控制台已关闭')
    },
    navigateTo(path) {
      this.$router.push(path)
    }
  }
}
</script>

<style scoped>
.page-content {
  padding-top: 56px;
  padding-bottom: 50px;
}

.section-header {
  padding: 16px;
  color: #323233;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.dashboard-group {
  margin-bottom: 20px;
}

.status-online {
  color: #07c160;
}

.status-offline {
  color: #ee0a24;
}
</style>