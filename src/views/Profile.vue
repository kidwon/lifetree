// 个人信息页面 (Profile.vue)
<template>
  <div class="page">
    <header-bar :title="'个人信息'" :show-back="false" />
    
    <div class="page-content">
      <div class="profile-avatar">
        <van-icon name="contact" size="64" />
      </div>
      
      <van-cell-group inset>
        <van-cell title="用户名" :value="user.name" />
        <van-cell title="邮箱" :value="user.email" />
      </van-cell-group>

      <div class="action-buttons logout-button">
        <van-button type="default" block @click="logout">退出登录</van-button>
      </div>
      
      <van-tabs v-model:active="activeTab" sticky>
        <!-- 我的需求 Tab -->
        <van-tab title="我的需求">
          <div class="section-header my-requirements-header">
            <div class="section-title">我创建的需求</div>
          </div>
          
          <van-list
            v-model:loading="myRequirementsLoading"
            :finished="myRequirementsFinished"
            finished-text="没有更多了"
            @load="loadMyRequirements"
          >
            <van-cell
              v-for="item in myRequirements"
              :key="item.id"
              :title="item.title"
              :label="getApplicantInfo(item)"
              is-link
              @click="goToRequirementDetail(item.id)"
            >
              <template #right-icon v-if="item.status === 'CONFIRMING' && item.pendingApproval">
                <div class="action-buttons">
                  <van-button size="small" type="success" @click.stop="approveRequirement(item.id)">同意</van-button>
                  <van-button size="small" type="danger" @click.stop="rejectRequirement(item.id)">拒绝</van-button>
                </div>
              </template>
            </van-cell>
          </van-list>
        </van-tab>
        
        <!-- 待确认的需求 Tab -->
        <van-tab title="待确认的需求">
          <div class="section-header my-applications-header">
            <div class="section-title">我申请的需求</div>
          </div>
          
          <van-list
            v-model:loading="pendingRequirementsLoading"
            :finished="pendingRequirementsFinished"
            finished-text="没有更多了"
            @load="loadPendingRequirements"
          >
            <van-cell
              v-for="item in pendingRequirements"
              :key="item.id"
              :title="item.title"
              is-link
              @click="goToRequirementDetail(item.id)"
            >
              <template #right-icon>
                <van-tag :type="getApplicationStatusType(item.applicationStatus)">
                  {{ getApplicationStatusText(item.applicationStatus) }}
                </van-tag>
              </template>
            </van-cell>
          </van-list>
        </van-tab>
      </van-tabs>
      
      
    </div>
    
    <nav-bar />
  </div>
</template>

<script>
import HeaderBar from '../components/HeaderBar.vue'
import NavBar from '../components/NavBar.vue'
import { showSuccessToast, showFailToast } from 'vant'
import apiService from '../api/api'
import auth from '@/store/auth'

export default {
  name: 'ProfilePage',
  components: {
    HeaderBar,
    NavBar
  },
  data() {
    return {
      user: {
        id: '',
        name: '',
        email: ''
      },
      activeTab: 0,
      // 我的需求（别人申请接受的）
      myRequirements: [],
      myRequirementsLoading: false,
      myRequirementsFinished: false,
      // 我申请接受的需求
      pendingRequirements: [],
      pendingRequirementsLoading: false,
      pendingRequirementsFinished: false
    }
  },
  created() {
    this.fetchUserData()
  },
  methods: {
    fetchUserData() {
      // 从store中获取用户信息
      this.user = auth.state.user || { name: '未知用户', email: '未知邮箱' }
    },
    
    // 加载我创建的需求（别人申请接受的）
    async loadMyRequirements() {
      try {
        const response = await apiService.requirements.getMyRequirementsWithApplications()
        this.myRequirements = response.data
        
        // 标记加载完成
        this.myRequirementsFinished = true
        this.myRequirementsLoading = false
      } catch (error) {
        console.error('Error loading my requirements:', error)
        showFailToast('加载需求失败')
        this.myRequirementsLoading = false
      }
    },
    
    // 加载我申请接受的需求
    async loadPendingRequirements() {
      try {
        const response = await apiService.requirements.getMyApplications()
        this.pendingRequirements = response.data
        
        // 标记加载完成
        this.pendingRequirementsFinished = true
        this.pendingRequirementsLoading = false
      } catch (error) {
        console.error('Error loading pending requirements:', error)
        showFailToast('加载申请失败')
        this.pendingRequirementsLoading = false
      }
    },
    
    // 同意需求申请
    async approveRequirement(requirementId) {
      try {
        await apiService.requirements.approveApplication(requirementId)
        showSuccessToast('已同意申请')
        
        // 刷新数据
        this.loadMyRequirements()
      } catch (error) {
        console.error('Error approving application:', error)
        showFailToast('操作失败')
      }
    },
    
    // 拒绝需求申请
    async rejectRequirement(requirementId) {
      try {
        await apiService.requirements.rejectApplication(requirementId)
        showSuccessToast('已拒绝申请')
        
        // 刷新数据
        this.loadMyRequirements()
      } catch (error) {
        console.error('Error rejecting application:', error)
        showFailToast('操作失败')
      }
    },
    
    // 获取申请者信息显示文本
    getApplicantInfo(requirement) {
      if (requirement.applicant && requirement.status === 'CONFIRMING') {
        return `申请者: ${requirement.applicant.name}`
      }
      return `状态: ${this.getStatusText(requirement.status)}`
    },
    
    // 获取需求状态文本
    getStatusText(status) {
      const statusMap = {
        'CREATED': '已创建',
        'CONFIRMING': '确认中',
        'IN_PROGRESS': '进行中',
        'COMPLETED': '已完成',
        'CANCELLED': '已取消'
      }
      return statusMap[status] || '未知状态'
    },
    
    // 获取申请状态文本
    getApplicationStatusText(status) {
      const statusMap = {
        'PENDING': '等待确认',
        'APPROVED': '已同意',
        'REJECTED': '已拒绝'
      }
      return statusMap[status] || '未知状态'
    },
    
    // 获取申请状态类型（用于标签颜色）
    getApplicationStatusType(status) {
      const typeMap = {
        'PENDING': 'warning',
        'APPROVED': 'success',
        'REJECTED': 'danger'
      }
      return typeMap[status] || 'default'
    },
    
    // 跳转到需求详情页
    goToRequirementDetail(id) {
      this.$router.push(`/requirement/${id}`)
    },
    
    // 退出登录
    logout() {
      auth.logout()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.page-content {
  padding-top: 56px;
  padding-bottom: 50px;
}

.profile-avatar {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

.profile-avatar .van-icon {
  background-color: #f2f2f2;
  border-radius: 50%;
  padding: 20px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.logout-button {
  margin: 30px 16px;
}

/* 标题区域 - 基础样式 */
.section-header {
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 4px;
}

.section-subtitle {
  font-size: 12px;
  color: #969799;
}

/* 我创建的需求标题栏样式 */
.my-requirements-header {
  background-color: #e6f7ff;
  border-left: 4px solid #1989fa;
}

.my-requirements-header .section-title {
  color: #1989fa;
}

/* 我申请的需求标题栏样式 */
.my-applications-header {
  background-color: #f0f9eb;
  border-left: 4px solid #07c160;
}

.my-applications-header .section-title {
  color: #07c160;
}

/* 让整个cell可点击 */
:deep(.van-cell) {
  position: relative;
  z-index: 1;
}

/* 在点击按钮时阻止事件冒泡 */
:deep(.van-button) {
  position: relative;
  z-index: 2;
}
</style>