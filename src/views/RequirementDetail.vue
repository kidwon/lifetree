// 需求详情页面 (RequirementDetail.vue)
<template>
  <div class="page">
    <header-bar :title="'需求详情'" />

    <div class="page-content">
      <div class="detail-header">
        <h2>{{ requirement.title }}</h2>
        <div class="detail-meta">
          <span>发布时间: {{ formatDate(requirement.createdAt) }}</span>
          <van-tag :type="getStatusType(requirement.status)" class="status-tag">
            {{ getStatusText(requirement.status) }}
          </van-tag>
        </div>
      </div>

      <van-cell-group inset title="需求描述">
        <div class="detail-content">
          <p>{{ requirement.description }}</p>
        </div>
      </van-cell-group>

      <van-cell-group inset title="操作" style="margin-top: 16px;">
        <van-cell title="查看相关结果" is-link @click="goToResults" />
        <van-cell title="更改状态" is-link @click="showStatusActionSheet = true" />
        <van-cell title="删除需求" is-link @click="confirmDelete" />
      </van-cell-group>
    </div>

    <!-- 状态切换动作面板 -->
    <van-action-sheet v-model:show="showStatusActionSheet" :actions="statusActions" cancel-text="取消"
      @select="onSelectStatus" />

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
import { showConfirmDialog, showSuccessToast, showFailToast } from 'vant'
import apiService from '../api/api'

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
      requirement: {
        id: '',
        title: '',
        description: '',
        status: '',
        createdBy: '',
        createdAt: '',
        updatedAt: ''
      },
      loading: true,
      showStatusActionSheet: false,
      statusActions: [
        { name: '已创建', value: 'CREATED' },
        { name: '确认中', value: 'CONFIRMING' },
        { name: '进行中', value: 'IN_PROGRESS' },
        { name: '已完成', value: 'COMPLETED' },
        { name: '已取消', value: 'CANCELLED' }
      ]
    }
  },
  created() {
    this.fetchRequirementDetail()
  },
  methods: {
    async fetchRequirementDetail() {
      this.loading = true
      try {
        const response = await apiService.requirements.getById(this.id)
        this.requirement = response.data
      } catch (error) {
        console.error('Error fetching requirement detail:', error)
        showFailToast('获取需求详情失败')
      } finally {
        this.loading = false
      }
    },
    formatDate(dateString) {
      if (!dateString) return '未知'

      // 格式化日期
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
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
    getStatusType(status) {
      const typeMap = {
        'CREATED': 'primary',
        'CONFIRMING': 'warning',
        'IN_PROGRESS': 'success',
        'COMPLETED': 'success',
        'CANCELLED': 'danger'
      }
      return typeMap[status] || 'default'
    },
    async onSelectStatus(action) {
      try {
        await apiService.requirements.update(this.id, { status: action.value })
        this.requirement.status = action.value
        showSuccessToast('状态更新成功')
      } catch (error) {
        console.error('Error updating status:', error)
        showFailToast('状态更新失败')
      }
    },
    confirmDelete() {
      showConfirmDialog({
        title: '确认删除',
        message: '确定要删除这个需求吗？此操作不可撤销！',
      }).then(async () => {
        try {
          await apiService.requirements.delete(this.id)
          showSuccessToast('需求已删除')
          // 返回到需求列表页
          this.$router.push('/requirements')
        } catch (error) {
          console.error('Error deleting requirement:', error)
          showFailToast('删除需求失败')
        }
      }).catch(() => {
        // 用户取消了操作，不做任何事
      })
    },
    goToAgreement() {
      // 将需求ID和状态作为查询参数传递给协议页面
      this.$router.push({
        path: '/agreement',
        query: {
          requirementId: this.id,
          status: this.requirement.status
        }
      })
    },
    goToResults() {
      this.$router.push(`/results/requirement/${this.id}`)
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
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-meta span {
  color: #999;
  font-size: 14px;
}

.status-tag {
  margin-bottom: 8px;
  display: inline-block;
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