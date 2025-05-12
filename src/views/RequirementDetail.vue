<template>
  <div class="page">
    <header-bar :title="'需求详情'" />

    <div class="page-content">
      <van-loading v-if="loading" vertical class="loading-overlay">加载中...</van-loading>

      <template v-else>
        <div class="detail-header">
          <h2>{{ requirement.title }}</h2>
          <div class="detail-meta">
            <div class="status-row">
              <van-tag :type="getStatusType(requirement.status)" class="custom-tag" round>
                {{ getStatusText(requirement.status) }}
              </van-tag>
              <span v-if="pendingApplicationsCount > 0" class="application-count">
                {{ pendingApplicationsCount }}人申请
              </span>
            </div>
            <span>发布时间: {{ formatDate(requirement.createdAt) }}</span>
          </div>
        </div>

        <van-cell-group inset title="需求描述">
          <div class="detail-content">
            <!-- 使用v-html显示HTML格式的内容 -->
            <p v-html="requirement.description"></p>
          </div>
        </van-cell-group>

        <!-- 协议内容 -->
        <van-cell-group inset title="协议内容" style="margin-top: 16px;">
          <div class="agreement-section">
            <div v-if="requirement.agreement" class="agreement-preview">
              <div v-html="previewAgreement" class="agreement-content"></div>

              <div class="agreement-actions" v-if="hasPermission">
                <van-button type="primary" size="small" @click="goToEditAgreement">
                  编辑协议
                </van-button>
              </div>

              <div v-if="!previewMode" class="agreement-view-more" @click="showFullAgreement">
                <span>查看完整协议</span>
                <van-icon name="arrow-down" />
              </div>
            </div>

            <div v-else class="no-agreement">
              <p>此需求暂无协议内容</p>
              <van-button v-if="hasPermission" type="primary" size="small" @click="goToEditAgreement">
                添加协议
              </van-button>
            </div>
          </div>
        </van-cell-group>
        <!-- 申请人列表 - 仅对需求创建者显示 -->
        <van-cell-group v-if="hasPermission && pendingApplicationsCount > 0" inset title="申请人列表"
          style="margin-top: 16px;">
          <van-loading v-if="applicationsLoading" size="24px">加载中...</van-loading>

          <template v-else>
            <van-cell v-for="app in pendingApplications" :key="app.id" :title="app.applicantName"
              :label="formatDate(app.createdAt)">
              <template #right-icon>
                <div class="application-actions">
                  <van-button size="small" type="success" @click="approveApplication(app.id)"
                    :loading="approvingId === app.id">
                    同意
                  </van-button>
                  <van-button size="small" type="danger" @click="rejectApplication(app.id)"
                    :loading="rejectingId === app.id">
                    拒绝
                  </van-button>
                </div>
              </template>
            </van-cell>
          </template>
        </van-cell-group>

        <!-- 只有管理员或创建者才能看到操作选项 -->
        <van-cell-group v-if="hasPermission" inset title="操作" style="margin-top: 16px;">
          <van-cell title="查看相关结果" is-link @click="goToResults" />
          <van-cell title="更改状态" is-link @click="showStatusActionSheet = true" />
          <van-cell title="删除需求" is-link @click="confirmDelete" />
        </van-cell-group>
        <!-- 普通用户只能查看相关结果 -->
        <van-cell-group v-else inset title="操作" style="margin-top: 16px;">
          <van-cell title="查看相关结果" is-link @click="goToResults" />
        </van-cell-group>
      </template>
    </div>

    <!-- 状态切换动作面板 -->
    <van-action-sheet v-model:show="showStatusActionSheet" :actions="statusActions" cancel-text="取消"
      @select="onSelectStatus" />

    <!-- 协议全屏预览弹窗 -->
    <van-popup v-model:show="showAgreementPopup" position="bottom" :style="{ height: '80%' }" round>
      <div class="agreement-popup">
        <div class="popup-header">
          <div class="popup-title">协议详情</div>
          <van-icon name="cross" @click="showAgreementPopup = false" />
        </div>

        <div class="popup-content">
          <agreement-display :content="requirement.agreement" :title="'需求协议 - ' + requirement.title"
            :showActions="false" />
        </div>
      </div>
    </van-popup>

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
import AgreementDisplay from '../components/AgreementDisplay.vue'
import { showConfirmDialog, showSuccessToast, showFailToast } from 'vant'
import apiService from '../api/api'
import auth from '@/store/auth'

export default {
  name: 'RequirementDetailPage',
  components: {
    HeaderBar,
    AgreementDisplay
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
        agreement: '',
        createdBy: '',
        createdAt: '',
        updatedAt: ''
      },
      loading: true,
      pendingApplicationsCount: 0,
      pendingApplications: [],
      applicationsLoading: false,
      showStatusActionSheet: false,
      showAgreementPopup: false,
      previewMode: false,  // 是否为协议预览模式
      statusActions: [
        { name: '已创建', value: 'CREATED' },
        { name: '进行中', value: 'IN_PROGRESS' },
        { name: '已完成', value: 'COMPLETED' },
        { name: '已取消', value: 'CANCELLED' }
      ],
      approvingId: null,
      rejectingId: null
    }
  },
  computed: {
    // 检查当前用户是否有权限操作此需求（管理员或创建者）
    hasPermission() {
      const currentUser = auth.state.user;
      if (!currentUser) return false;

      // 检查是否是管理员
      if (currentUser.role === 'ADMIN') return true;

      // 检查是否是需求创建者
      return currentUser.id === this.requirement.createdBy;
    },

    // 获取协议预览内容（截取前300个字符）
    previewAgreement() {
      if (!this.requirement.agreement) return '';

      // 如果不是预览模式，显示完整内容
      if (!this.previewMode) return this.requirement.agreement;

      // 创建一个临时元素，解析HTML内容
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.requirement.agreement;

      // 获取纯文本内容
      const textContent = tempDiv.textContent || tempDiv.innerText;

      // 如果文本内容少于300个字符，直接显示原始HTML
      if (textContent.length <= 300) {
        return this.requirement.agreement;
      }

      // 否则截取HTML内容
      // 注意：这种方法可能会截断HTML标签，导致显示问题
      // 这里简单处理，实际应用中可能需要更复杂的HTML截取逻辑
      return this.requirement.agreement.substring(0, 300) + '...';
    }
  },
  created() {
    this.fetchRequirementDetail();

    // 默认开启预览模式
    this.previewMode = true;
  },
  methods: {
    async fetchRequirementDetail() {
      this.loading = true;
      try {
        const response = await apiService.requirements.getById(this.id);
        this.requirement = response.data;

        // 如果是需求创建者，获取申请列表
        if (this.hasPermission) {
          this.fetchApplications();
        }
      } catch (error) {
        console.error('Error fetching requirement detail:', error);
        showFailToast('获取需求详情失败');
      } finally {
        this.loading = false;
      }
    },

    // 获取申请列表
    async fetchApplications() {
      this.applicationsLoading = true;
      try {
        const response = await apiService.requirements.getApplicationsByRequirement(this.id);

        // 只保留待处理的申请
        this.pendingApplications = response.data.filter(app => app.status === 'PENDING');
        this.pendingApplicationsCount = this.pendingApplications.length;
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        this.applicationsLoading = false;
      }
    },

    // 同意申请
    async approveApplication(applicationId) {
      this.approvingId = applicationId;

      try {
        await apiService.requirements.approveApplication(this.id, applicationId);
        showSuccessToast('已同意申请');

        // 刷新数据
        this.fetchRequirementDetail();
      } catch (error) {
        console.error('Error approving application:', error);
        showFailToast('操作失败: ' + (error.response?.data?.message || '未知错误'));
      } finally {
        this.approvingId = null;
      }
    },

    // 拒绝申请
    async rejectApplication(applicationId) {
      this.rejectingId = applicationId;

      try {
        await apiService.requirements.rejectApplication(this.id, applicationId);
        showSuccessToast('已拒绝申请');

        // 刷新数据
        this.fetchRequirementDetail();
      } catch (error) {
        console.error('Error rejecting application:', error);
        showFailToast('操作失败: ' + (error.response?.data?.message || '未知错误'));
      } finally {
        this.rejectingId = null;
      }
    },

    formatDate(dateString) {
      if (!dateString) return '未知';

      // 格式化日期
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    getStatusText(status) {
      const statusMap = {
        'CREATED': '已创建',
        'CONFIRMING': '确认中',
        'IN_PROGRESS': '进行中',
        'COMPLETED': '已完成',
        'CANCELLED': '已取消'
      };
      return statusMap[status] || '未知状态';
    },
    getStatusType(status) {
      const typeMap = {
        'CREATED': 'primary',
        'CONFIRMING': 'warning',
        'IN_PROGRESS': 'success',
        'COMPLETED': 'success',
        'CANCELLED': 'danger'
      };
      return typeMap[status] || 'default';
    },
    async onSelectStatus(action) {
      // 先检查权限
      if (!this.hasPermission) {
        showFailToast('您没有权限执行此操作');
        return;
      }

      try {
        await apiService.requirements.update(this.id, { status: action.value });
        this.requirement.status = action.value;
        showSuccessToast('状态更新成功');
      } catch (error) {
        console.error('Error updating status:', error);
        showFailToast('状态更新失败');
      }
    },
    confirmDelete() {
      // 先检查权限
      if (!this.hasPermission) {
        showFailToast('您没有权限执行此操作');
        return;
      }

      showConfirmDialog({
        title: '确认删除',
        message: '确定要删除这个需求吗？此操作不可撤销！',
      }).then(async () => {
        try {
          await apiService.requirements.delete(this.id);
          showSuccessToast('需求已删除');
          // 返回到需求列表页
          this.$router.push('/requirements');
        } catch (error) {
          console.error('Error deleting requirement:', error);
          showFailToast('删除需求失败');
        }
      }).catch(() => {
        // 用户取消了操作，不做任何事
      });
    },

    // 前往协议编辑页面
    goToEditAgreement() {
      this.$router.push(`/requirement/${this.id}/agreement/edit`);
    },

    // 显示完整协议
    showFullAgreement() {
      this.showAgreementPopup = true;
    },

    // 前往协议页面（用于申请接受需求）
    goToAgreement() {
      // 将需求ID和状态作为查询参数传递给协议页面
      this.$router.push({
        path: '/agreement',
        query: {
          requirementId: this.id,
          status: this.requirement.status
        }
      });
    },

    goToResults() {
      this.$router.push(`/results/requirement/${this.id}`);
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

.status-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.application-count {
  margin-left: 10px;
  color: #ff976a;
  font-weight: bold;
}

.detail-content {
  padding: 16px;
  line-height: 1.6;
}

.detail-content p {
  margin: 0;
  white-space: pre-wrap;
  /* 保留空白符和换行符 */
}

/* 协议相关样式 */
.agreement-section {
  padding: 16px;
}

.agreement-preview {
  position: relative;
}

.agreement-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.agreement-content :deep(h3) {
  font-size: 16px;
  margin-top: 20px;
  margin-bottom: 12px;
}

.agreement-content :deep(h4) {
  font-size: 15px;
  margin-top: 16px;
  margin-bottom: A8px;
}

.agreement-content :deep(p) {
  margin-bottom: 10px;
}

.agreement-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.agreement-view-more {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  color: #1989fa;
  font-size: 14px;
  cursor: pointer;
}

.agreement-view-more span {
  margin-right: 4px;
}

.no-agreement {
  color: #969799;
  text-align: center;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
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

.application-actions {
  display: flex;
  gap: 8px;
}

.loading-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
}

/* 协议弹窗样式 */
.agreement-popup {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f2f2f2;
}

.popup-title {
  font-weight: 600;
  font-size: 16px;
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
</style>