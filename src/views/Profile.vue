// 修改后的个人信息页面 (Profile.vue)
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
              :label="getPendingApplicantsInfo(item)"
              is-link
              @click="goToRequirementDetail(item.id)"
            >
              <!-- 如果有待处理的申请，显示"查看申请"按钮 -->
              <template #right-icon v-if="item.pendingApplicationsCount > 0">
                <van-button 
                  size="small" 
                  type="primary" 
                  @click.stop="viewApplications(item.id)"
                >
                  查看申请({{ item.pendingApplicationsCount }})
                </van-button>
              </template>
            </van-cell>
          </van-list>
        </van-tab>
        
        <!-- 待确认的需求 Tab -->
        <van-tab title="我的申请">
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
                <van-tag :type="getApplicationStatusType(item.applicationStatus)" class="custom-tag" round>
                  {{ getApplicationStatusText(item.applicationStatus) }}
                </van-tag>
              </template>
            </van-cell>
          </van-list>
        </van-tab>
      </van-tabs>
    </div>
    
    <!-- 申请列表弹窗 -->
    <van-popup
      v-model:show="showApplicationsPopup"
      position="bottom"
      :style="{ height: '60%' }"
      round
    >
      <div class="popup-header">
        <div class="popup-title">申请列表</div>
        <van-icon name="cross" @click="showApplicationsPopup = false" />
      </div>
      
      <div class="applications-list">
        <van-loading v-if="applicationsLoading" vertical>加载中...</van-loading>
        
        <template v-else>
          <van-empty v-if="applications.length === 0" description="暂无申请" />
          
          <van-cell-group v-else>
            <van-cell 
              v-for="app in applications" 
              :key="app.id" 
              :title="app.applicantName"
              :label="formatDate(app.createdAt)"
              :value="getApplicationStatusText(app.status)"
              :value-class="getApplicationStatusClass(app.status)"
            >
              <template #right-icon v-if="app.status === 'PENDING'">
                <div class="application-actions">
                  <van-button 
                    size="small" 
                    type="success" 
                    @click="approveApplication(app.requirementId, app.id)"
                    :loading="approvingId === app.id"
                  >
                    同意
                  </van-button>
                  <van-button 
                    size="small" 
                    type="danger" 
                    @click="rejectApplication(app.requirementId, app.id)"
                    :loading="rejectingId === app.id"
                  >
                    拒绝
                  </van-button>
                </div>
              </template>
            </van-cell>
          </van-cell-group>
        </template>
      </div>
    </van-popup>
    
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
      pendingRequirementsFinished: false,
      // 申请列表
      showApplicationsPopup: false,
      applications: [],
      applicationsLoading: false,
      currentRequirementId: null,
      // 操作状态
      approvingId: null,
      rejectingId: null
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
    
    // 加载指定需求的所有申请
    async loadApplications(requirementId) {
      this.applicationsLoading = true
      this.currentRequirementId = requirementId
      
      try {
        const response = await apiService.requirements.getApplicationsByRequirement(requirementId)
        this.applications = response.data
      } catch (error) {
        console.error('Error loading applications:', error)
        showFailToast('加载申请列表失败')
      } finally {
        this.applicationsLoading = false
      }
    },
    
    // 查看申请列表
    viewApplications(requirementId) {
      this.loadApplications(requirementId)
      this.showApplicationsPopup = true
    },
    
    // 同意需求申请
    async approveApplication(requirementId, applicationId) {
      this.approvingId = applicationId
      
      try {
        await apiService.requirements.approveApplication(requirementId, applicationId)
        showSuccessToast('已同意申请')
        
        // 刷新申请列表
        this.loadApplications(requirementId)
        // 刷新需求列表
        this.loadMyRequirements()
      } catch (error) {
        console.error('Error approving application:', error)
        showFailToast('操作失败')
      } finally {
        this.approvingId = null
      }
    },
    
    // 拒绝需求申请
    async rejectApplication(requirementId, applicationId) {
      this.rejectingId = applicationId
      
      try {
        await apiService.requirements.rejectApplication(requirementId, applicationId)
        showSuccessToast('已拒绝申请')
        
        // 刷新申请列表
        this.loadApplications(requirementId)
        // 刷新需求列表
        this.loadMyRequirements()
      } catch (error) {
        console.error('Error rejecting application:', error)
        showFailToast('操作失败')
      } finally {
        this.rejectingId = null
      }
    },
    
    // 获取申请者信息显示文本 - 修改为显示申请数量
    getPendingApplicantsInfo(requirement) {
      if (requirement.pendingApplicationsCount > 0) {
        return `${requirement.pendingApplicationsCount}人申请 | 状态: ${this.getStatusText(requirement.status)}`
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
    
    // 获取申请状态CSS类（用于显示颜色）
    getApplicationStatusClass(status) {
      const classMap = {
        'PENDING': 'status-pending',
        'APPROVED': 'status-approved',
        'REJECTED': 'status-rejected'
      }
      return classMap[status] || ''
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
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

/* 弹窗样式 */
.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

.popup-title {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
}

.applications-list {
  padding: 16px;
  height: calc(100% - 60px);
  overflow-y: auto;
}

.application-actions {
  display: flex;
  gap: 8px;
}

/* 申请状态颜色 */
.status-pending {
  color: #ff976a;
}

.status-approved {
  color: #07c160;
}

.status-rejected {
  color: #ee0a24;
}
</style>