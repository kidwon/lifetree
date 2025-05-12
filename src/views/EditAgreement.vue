<template>
  <div class="page">
    <header-bar :title="'编辑协议'" />
    
    <div class="page-content">
      <van-loading v-if="loading" vertical class="loading-overlay">加载中...</van-loading>
      
      <template v-else>
        <agreement-editor 
          :initialContent="agreement" 
          @save="saveAgreement"
          @cancel="goBack"
          ref="agreementEditor"
        />
      </template>
    </div>
  </div>
</template>

<script>
import HeaderBar from '../components/HeaderBar.vue'
import AgreementEditor from '../components/AgreementEditor.vue'
import apiService from '../api/api'
import { showFailToast } from 'vant'

export default {
  name: 'EditAgreementPage',
  components: {
    HeaderBar,
    AgreementEditor
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      requirement: null,
      agreement: '',
      loading: true
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
        this.agreement = this.requirement.agreement || ''
        
      } catch (error) {
        console.error('Error fetching requirement detail:', error)
        showFailToast('获取需求详情失败')
        this.$router.push(`/requirement/${this.id}`)
      } finally {
        this.loading = false
      }
    },
    
    async saveAgreement(content) {
      try {
        await apiService.requirements.updateAgreement(this.id, content)
        this.$refs.agreementEditor.saved(true, '协议保存成功')
        
        // 成功后短暂延迟返回详情页
        setTimeout(() => {
          this.goBack()
        }, 1000)
      } catch (error) {
        console.error('Error updating agreement:', error)
        this.$refs.agreementEditor.saved(false, '保存协议失败: ' + (error.response?.data?.message || '未知错误'))
      }
    },
    
    goBack() {
      this.$router.push(`/requirement/${this.id}`)
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
</style>