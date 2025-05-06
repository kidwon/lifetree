<template>
    <div class="page">
      <header-bar :title="'编辑需求'" />
      
      <div class="page-content">
        <van-loading v-if="loading" vertical class="loading-overlay">加载中...</van-loading>
        
        <van-form v-else @submit="onSubmit">
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
            
            <van-field
              name="status"
              label="状态"
              readonly
            >
              <template #input>
                <van-dropdown-menu>
                  <van-dropdown-item v-model="status" :options="statusOptions" />
                </van-dropdown-menu>
              </template>
            </van-field>
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
              保存
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
    name: 'EditRequirementPage',
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
        title: '',
        description: '',
        status: '',
        loading: true,
        submitting: false,
        statusOptions: [
          { text: '已创建', value: 'CREATED' },
          { text: '进行中', value: 'IN_PROGRESS' },
          { text: '已完成', value: 'COMPLETED' },
          { text: '已取消', value: 'CANCELLED' }
        ]
      }
    },
    created() {
      this.fetchRequirementDetail()
    },
    methods: {
      async fetchRequirementDetail() {
        try {
          const response = await apiService.requirements.getById(this.id)
          const requirement = response.data
          
          // 填充表单
          this.title = requirement.title
          this.description = requirement.description
          this.status = requirement.status
        } catch (error) {
          console.error('Error fetching requirement:', error)
          showFailToast('获取需求详情失败')
          // 导航回详情页
          this.$router.push(`/requirement/${this.id}`)
        } finally {
          this.loading = false
        }
      },
      async onSubmit() {
        this.submitting = true
        
        try {
          const updateData = {
            title: this.title,
            description: this.description,
            status: this.status
          }
          
          // 调用API更新需求
          await apiService.requirements.update(this.id, updateData)
          
          // 显示更新成功的提示
          showSuccessToast('需求更新成功')
          
          // 跳转回需求详情页
          setTimeout(() => {
            this.$router.push(`/requirement/${this.id}`)
          }, 1000)
        } catch (error) {
          console.error('Error updating requirement:', error)
          showFailToast('更新需求失败: ' + (error.response?.data?.error || '未知错误'))
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
  
  :deep(.van-dropdown-menu) {
    box-shadow: none;
    height: auto;
  }
  
  :deep(.van-dropdown-menu__bar) {
    box-shadow: none;
  }
  
  :deep(.van-dropdown-menu__item) {
    justify-content: flex-start;
  }
  </style>