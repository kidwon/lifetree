<template>
    <div class="page">
      <header-bar :title="'编辑结果'" />
      
      <div class="page-content">
        <van-loading v-if="loading" vertical class="loading-overlay">加载中...</van-loading>
        
        <van-form v-else @submit="onSubmit">
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
            
            <van-field 
              v-if="requirementOptions.length > 0"
              readonly
              name="relatedRequirement"
              label="关联需求"
              :value="selectedRequirementTitle"
              right-icon="arrow-down"
              @click="showRequirementPicker = true"
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
              保存
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
      </div>
    </div>
  </template>
  
  <script>
  import HeaderBar from '../components/HeaderBar.vue'
  import apiService from '../api/api'
  import { showSuccessToast, showFailToast } from 'vant'
  
  export default {
    name: 'EditResultPage',
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
        relatedRequirementId: null,
        loading: true,
        submitting: false,
        showRequirementPicker: false,
        requirements: [],
        selectedRequirementTitle: '无关联需求',
        statusOptions: [
          { text: '草稿', value: 'DRAFT' },
          { text: '已完成', value: 'COMPLETED' },
          { text: '已归档', value: 'ARCHIVED' },
          { text: '已拒绝', value: 'REJECTED' }
        ]
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
      this.fetchResultDetail()
      this.fetchRequirements()
    },
    methods: {
      async fetchResultDetail() {
        try {
          const response = await apiService.results.getById(this.id)
          const result = response.data
          
          // 填充表单
          this.title = result.title
          this.description = result.description
          this.status = result.status
          this.relatedRequirementId = result.relatedRequirementId
          
          // 如果有关联需求，获取需求标题
          if (this.relatedRequirementId) {
            this.fetchRelatedRequirementTitle()
          }
        } catch (error) {
          console.error('Error fetching result:', error)
          showFailToast('获取结果详情失败')
          // 导航回详情页
          this.$router.push(`/result/${this.id}`)
        } finally {
          this.loading = false
        }
      },
      async fetchRelatedRequirementTitle() {
        if (!this.relatedRequirementId) return
        
        try {
          const response = await apiService.requirements.getById(this.relatedRequirementId)
          this.selectedRequirementTitle = response.data.title
        } catch (error) {
          console.error('Error fetching related requirement title:', error)
          this.selectedRequirementTitle = '未能获取需求标题'
        }
      },
      async fetchRequirements() {
        try {
          const response = await apiService.requirements.getAll()
          this.requirements = response.data
        } catch (error) {
          console.error('Error fetching requirements:', error)
        }
      },
      onRequirementConfirm(option) {
        this.relatedRequirementId = option.value
        this.selectedRequirementTitle = option.value ? option.text : '无关联需求'
        this.showRequirementPicker = false
      },
      async onSubmit() {
        this.submitting = true
        
        try {
          const updateData = {
            title: this.title,
            description: this.description,
            status: this.status,
            relatedRequirementId: this.relatedRequirementId
          }
          
          // 调用API更新结果
          await apiService.results.update(this.id, updateData)
          
          // 显示更新成功的提示
          showSuccessToast('结果更新成功')
          
          // 跳转回结果详情页
          setTimeout(() => {
            this.$router.push(`/result/${this.id}`)
          }, 1000)
        } catch (error) {
          console.error('Error updating result:', error)
          showFailToast('更新结果失败: ' + (error.response?.data?.error || '未知错误'))
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