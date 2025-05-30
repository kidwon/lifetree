<template>
  <div class="page">
    <header-bar 
      :title="result.title || '结果详情'" 
      right-text="编辑"
      @right-click="goToEdit"
      v-if="hasPermission"
    />
    <header-bar 
      :title="result.title || '结果详情'" 
      v-else
    />
    
    <div class="page-content">
      <van-loading v-if="loading" vertical class="loading-overlay">加载中...</van-loading>
      
      <template v-else>
        <div class="detail-header">
          <h2>{{ result.title }}</h2>
          <div class="detail-meta">
            <div class="status-row">
              <van-tag :type="getStatusType(result.status)" class="custom-tag" round>
                {{ getStatusText(result.status) }}
              </van-tag>
            </div>
            <span>创建时间: {{ formatDate(result.createdAt) }}</span>
            <span>更新时间: {{ formatDate(result.updatedAt) }}</span>
          </div>
        </div>
        
        <van-cell-group inset title="结果描述">
          <div class="detail-content">
            <!-- 使用v-html显示HTML格式的内容 -->
            <p v-html="result.description"></p>
          </div>
        </van-cell-group>

        <van-cell-group inset title="关联需求" v-if="result.relatedRequirementId">
          <van-cell
            :title="relatedRequirementTitle || '查看关联需求'"
            is-link
            @click="goToRelatedRequirement"
          />
        </van-cell-group>
        
        <!-- 只有管理员或创建者才能看到操作选项 -->
        <van-cell-group v-if="hasPermission" inset title="操作" style="margin-top: 16px;">
          <van-cell title="更改状态" is-link @click="showStatusActionSheet = true" />
          <van-cell title="删除结果" is-link @click="confirmDelete" />
        </van-cell-group>
      </template>
    </div>
    
    <!-- 状态切换动作面板 -->
    <van-action-sheet
      v-model:show="showStatusActionSheet"
      :actions="statusActions"
      cancel-text="取消"
      @select="onSelectStatus"
    />
  </div>
</template>

<script>
import HeaderBar from '../components/HeaderBar.vue'
import apiService from '../api/api'
import { showFailToast, showSuccessToast, showConfirmDialog } from 'vant'
import auth from '@/store/auth'

export default {
  name: 'ResultDetailPage',
  components: {
    HeaderBar
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      result: {
        id: '',
        title: '',
        description: '',
        status: '',
        relatedRequirementId: null,
        createdBy: '',
        createdAt: '',
        updatedAt: ''
      },
      relatedRequirementTitle: '',
      loading: true,
      showStatusActionSheet: false,
      statusActions: [
        { name: '草稿', value: 'DRAFT' },
        { name: '已完成', value: 'COMPLETED' },
        { name: '已归档', value: 'ARCHIVED' },
        { name: '已拒绝', value: 'REJECTED' }
      ]
    }
  },
  computed: {
    // 检查当前用户是否有权限操作此结果（管理员或创建者）
    hasPermission() {
      const currentUser = auth.state.user;
      if (!currentUser) return false;

      // 检查是否是管理员
      if (currentUser.role === 'ADMIN') return true;

      // 检查是否是结果创建者
      return currentUser.id === this.result.createdBy;
    }
  },
  created() {
    this.fetchResultDetail()
  },
  methods: {
    async fetchResultDetail() {
      this.loading = true
      try {
        const response = await apiService.results.getById(this.id)
        this.result = response.data
        
        // 如果有关联需求，获取需求标题
        if (this.result.relatedRequirementId) {
          this.fetchRelatedRequirement(this.result.relatedRequirementId)
        }
      } catch (error) {
        console.error('Error fetching result detail:', error)
        showFailToast('获取结果详情失败')
      } finally {
        this.loading = false
      }
    },
    async fetchRelatedRequirement(requirementId) {
      try {
        const response = await apiService.requirements.getById(requirementId)
        this.relatedRequirementTitle = response.data.title
      } catch (error) {
        console.error('Error fetching related requirement:', error)
        this.relatedRequirementTitle = '未能获取需求标题'
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
    },
    async onSelectStatus(action) {
      // 先检查权限
      if (!this.hasPermission) {
        showFailToast('您没有权限执行此操作')
        return
      }

      try {
        await apiService.results.update(this.id, { status: action.value })
        this.result.status = action.value
        showSuccessToast('状态更新成功')
      } catch (error) {
        console.error('Error updating status:', error)
        showFailToast('状态更新失败')
      }
    },
    confirmDelete() {
      // 先检查权限
      if (!this.hasPermission) {
        showFailToast('您没有权限执行此操作')
        return
      }

      showConfirmDialog({
        title: '确认删除',
        message: '确定要删除这个结果吗？此操作不可撤销！',
      }).then(async () => {
        try {
          await apiService.results.delete(this.id)
          showSuccessToast('结果已删除')
          // 返回到结果列表页
          this.$router.push('/results')
        } catch (error) {
          console.error('Error deleting result:', error)
          showFailToast('删除结果失败')
        }
      }).catch(() => {
        // 用户取消了操作，不做任何事
      })
    },
    goToEdit() {
      // 先检查权限
      if (!this.hasPermission) {
        showFailToast('您没有权限执行此操作')
        return
      }
      
      this.$router.push(`/result/edit/${this.id}`)
    },
    goToRelatedRequirement() {
      if (this.result.relatedRequirementId) {
        this.$router.push(`/requirement/${this.result.relatedRequirementId}`)
      }
    }
  }
}
</script>

<style scoped>
.page-content {
  padding-top: 56px;
  padding-bottom: 20px;
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

.status-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.detail-content {
  padding: 16px;
  line-height: 1.6;
}

.detail-content p {
  margin: 0;
  white-space: pre-wrap;  /* 保留空白符和换行符 */
}

.loading-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
}
</style>