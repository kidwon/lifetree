<template>
  <div class="page">
    <header-bar :title="'协议'" />
    
    <div class="page-content">
      <van-loading v-if="loading" vertical class="loading-overlay">加载中...</van-loading>
      
      <template v-else>
        <agreement-display
          :content="requirement.agreement"
          :title="'需求协议 - ' + requirement.title"
          :showActions="true"
          :loading="applying"
          :buttonText="getButtonText()"
          @agree="acceptRequirement"
          @back="goBack"
        />
        
        <!-- 已经申请过的提示 -->
        <van-popup
          v-model:show="showAlreadyAppliedPopup"
          round
          position="bottom"
          :style="{ height: '30%' }"
        >
          <div class="applied-popup">
            <van-icon name="info-o" size="40" class="applied-icon" />
            <h3>您已申请过此需求</h3>
            <p>请等待需求创建者审核您的申请。</p>
            <van-button type="primary" block @click="goBack">返回</van-button>
          </div>
        </van-popup>
      </template>
    </div>
  </div>
</template>

<script>
import HeaderBar from '../components/HeaderBar.vue'
import AgreementDisplay from '../components/AgreementDisplay.vue'
import apiService from '../api/api'
import { showSuccessToast, showFailToast } from 'vant'
import auth from '@/store/auth'

export default {
  name: 'AgreementPage',
  components: {
    HeaderBar,
    AgreementDisplay
  },
  data() {
    return {
      requirementId: null,
      requirement: {
        id: '',
        title: '',
        agreement: '',
        agreementButtonText: null,
        status: ''
      },
      loading: true,
      applying: false,
      alreadyApplied: false,
      showAlreadyAppliedPopup: false
    }
  },
  computed: {
    // 检查当前用户是否是需求的创建者
    isCreator() {
      const currentUserId = auth.state.user?.id;
      return this.requirement.createdBy === currentUserId;
    }
  },
  created() {
    // 从路由查询参数中获取需求ID
    this.requirementId = this.$route.query.requirementId;
    
    if (this.requirementId) {
      this.fetchRequirementDetails();
    } else {
      // 如果没有需求ID，导航回上一页
      this.$router.back();
    }
  },
  methods: {
    async fetchRequirementDetails() {
      this.loading = true;
      
      try {
        // 获取需求详情
        const response = await apiService.requirements.getById(this.requirementId);
        this.requirement = response.data;
        
        // 检查用户是否已申请该需求
        await this.checkUserApplication();
      } catch (error) {
        console.error('Error fetching requirement details:', error);
        showFailToast('获取需求详情失败');
        this.$router.back();
      } finally {
        this.loading = false;
      }
    },
    
    // 获取按钮文本
    getButtonText() {
      return this.requirement.agreementButtonText || '我已阅读并同意此协议';
    },
    
    // 检查当前用户是否已申请此需求
    async checkUserApplication() {
      try {
        // 获取当前用户的所有申请
        const response = await apiService.requirements.getMyApplications();
        
        // 检查是否已申请此需求
        const hasApplied = response.data.some(app => 
          app.id === this.requirementId && 
          (app.applicationStatus === 'PENDING' || app.applicationStatus === 'APPROVED')
        );
        
        this.alreadyApplied = hasApplied;
        
        // 如果已申请，显示提示
        if (this.alreadyApplied) {
          this.showAlreadyAppliedPopup = true;
        }
      } catch (error) {
        console.error('Error checking user applications:', error);
      }
    },
    
    goBack() {
      this.$router.back();
    },
    
    async acceptRequirement() {
      // 如果是创建者，不能申请自己的需求
      if (this.isCreator) {
        showFailToast('不能申请自己的需求');
        return;
      }
      
      // 检查需求状态是否可接受
      if (this.requirement.status !== 'CREATED' && this.requirement.status !== 'IN_PROGRESS') {
        showFailToast('此需求当前状态不可接受');
        return;
      }
      
      // 检查是否已申请过
      if (this.alreadyApplied) {
        this.showAlreadyAppliedPopup = true;
        return;
      }
      
      this.applying = true;
      try {
        // 调用API申请接受需求
        await apiService.requirements.acceptRequirement(this.requirementId);
        showSuccessToast('申请已提交，等待确认');
        
        // 跳转回需求详情页面
        setTimeout(() => {
          this.$router.push(`/requirement/${this.requirementId}`);
        }, 1000);
      } catch (error) {
        console.error('Error accepting requirement:', error);
        showFailToast('接受需求失败: ' + (error.response?.data?.message || '未知错误'));
      } finally {
        this.applying = false;
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

.loading-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
}

.applied-popup {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 16px;
  height: 100%;
}

.applied-icon {
  color: #1989fa;
  margin-bottom: 16px;
}

.applied-popup h3 {
  margin: 0 0 8px;
  color: #323233;
  font-size: 18px;
}

.applied-popup p {
  margin: 0 0 24px;
  color: #969799;
  font-size: 14px;
}
</style>