<template>
  <div class="page">
    <header-bar :title="'新建需求'" />
    
    <div class="page-content">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="title"
            name="title"
            label="需求标题"
            placeholder="请输入需求标题"
            :rules="[{ required: true, message: '请填写需求标题' }]"
          />
          
          <van-field
            v-model="description"
            name="description"
            label="需求描述"
            type="textarea"
            rows="6"
            placeholder="请输入需求详细描述"
            :rules="[{ required: true, message: '请填写需求描述' }]"
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
    </div>
  </div>
</template>

<script>
import HeaderBar from '../components/HeaderBar.vue'
import apiService from '../api/api'
import { showSuccessToast, showFailToast } from 'vant'

export default {
  name: 'NewRequirementPage',
  components: {
    HeaderBar
  },
  data() {
    return {
      title: '',
      description: '',
      submitting: false
    }
  },
  methods: {
    async onSubmit() {
      this.submitting = true
      
      try {
        const requirementData = {
          title: this.title,
          description: this.description
        }
        
        // 调用API保存需求
        await apiService.requirements.create(requirementData)
        
        // 显示提交成功的提示
        showSuccessToast('需求创建成功')
        
        // 跳转回需求列表页面
        setTimeout(() => {
          this.$router.push('/requirements')
        }, 1000)
      } catch (error) {
        console.error('Error creating requirement:', error)
        showFailToast('创建需求失败: ' + (error.response?.data?.error || '未知错误'))
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
</style>