<template>
  <div class="page">
    <header-bar :title="'新建结果'" />
    
    <div class="page-content">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="title"
            name="title"
            label="结果标题"
            placeholder="请输入结果标题"
            :rules="[{ required: true, message: '请填写结果标题' }]"
          />
          
          <van-field
            v-model="description"
            name="description"
            label="结果描述"
            type="textarea"
            rows="6"
            placeholder="请输入结果详细描述"
            :rules="[{ required: true, message: '请填写结果描述' }]"
          />
          
          <van-field 
            v-if="!relatedRequirementId && requirementOptions.length > 0"
            readonly
            name="relatedRequirement"
            label="关联需求"
            :value="selectedRequirementTitle"
            right-icon="arrow-down"
            @click="showRequirementPicker = true"
          />
          
          <van-field
            v-if="relatedRequirementId"
            readonly
            name="relatedRequirementFixed"
            label="关联需求"
            :value="selectedRequirementTitle"
          />
        </van-cell-group>
        
        <div style="margin: 16px;">
          <van-button 
            round 
            block 
            type="primary" 
            native-type="submit"
            :loading="submitting"
            :disabled="submitting"
          >
            提交
          </van-button>
        </div>
      </van-form>
      
      <!-- 需求选择器 -->
      <van-popup
        v-model:show="showRequirementPicker"
        position="bottom"
        round
        style="height: 50%"
      >
        <van-picker
          title="选择关联需求"
          :columns="requirementOptions"
          @confirm="onRequirementConfirm"
          @cancel="showRequirementPicker = false"
          show-toolbar
        />
      </van-popup>
      
      <van-loading v-if="loading" vertical class="loading-overlay">加载中...</van-loading>
    </div>
  </div>
</template>

<script>
import HeaderBar from '../components/HeaderBar.vue'
import apiService from '../api/api'
import { showSuccessToast, showFailToast } from 'vant'

export default {
  name: 'NewResultPage',
  components: {
    HeaderBar
  },
  data() {
    return {
      title: '',
      description: '',
      // 从URL参数获取关联的需求ID
      relatedRequirementId: this.$route.query.requirementId || '',
      submitting: false,
      loading: false,
      showRequirementPicker: false,
      requirements: [],
      selectedRequirementId: '',
      selectedRequirementTitle: '无关联需求'
    }
  },
  computed: {
    requirementOptions() {
      // 添加一个"无关联需求"的选项
      const options = [{ text: '无关联需求', value: null }]
      
      // 添加所有需求选项
      return options.concat(this.requirements.map(req => ({
        text: req.title,
        value: req.id
      })))
    }
  },
  created() {
    // 获取所有需求列表，用于选择关联
    this.fetchRequirements()
    
    // 如果从URL获取了需求ID，则获取需求标题
    if (this.relatedRequirementId) {
      this.fetchRequirementDetails(this.relatedRequirementId)
    }
  },
  methods: {
    async fetchRequirementDetails(requirementId) {
      this.loading = true
      try {
        const response = await apiService.requirements.getById(requirementId)
        this.selectedRequirementTitle = response.data.title
        this.selectedRequirementId = requirementId
      } catch (error) {
        console.error('Error fetching requirement details:', error)
        showFailToast('获取需求详情失败')
      } finally {
        this.loading = false
      }
    },
    async fetchRequirements() {
      this.loading = true
      try {
        const response = await apiService.requirements.getAll()
        this.requirements = response.data
      } catch (error) {
        console.error('Error fetching requirements:', error)
        showFailToast('获取需求列表失败')
      } finally {
        this.loading = false
      }
    },
    onRequirementConfirm(option) {
      this.selectedRequirementId = option.value
      this.selectedRequirementTitle = option.value ? option.text : '无关联需求'
      this.showRequirementPicker = false
    },
    async onSubmit() {
      this.submitting = true
      
      try {
        const resultData = {
          title: this.title,
          description: this.description,
          relatedRequirementId: this.relatedRequirementId || this.selectedRequirementId || null
        }
        
        // 调用API保存结果
        await apiService.results.create(resultData)
        
        // 显示提交成功的提示
        showSuccessToast('结果创建成功')
        
        // 如果是从需求详情页跳转来的，返回到相关结果列表
        if (this.relatedRequirementId) {
          setTimeout(() => {
            this.$router.push(`/results/requirement/${this.relatedRequirementId}`)
          }, 1000)
        } else {
          // 否则跳转回结果列表页面
          setTimeout(() => {
            this.$router.push('/results')
          }, 1000)
        }
      } catch (error) {
        console.error('Error creating result:', error)
        showFailToast('创建结果失败: ' + (error.response?.data?.error || '未知错误'))
      } finally {
        this.submitting = false
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
</style>