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
          
          <div class="rich-text-wrapper">
            <div class="field-label">结果描述</div>
            <!-- 使用div作为富文本编辑器容器 -->
            <div ref="editor" class="rich-text-editor"></div>
            <!-- 错误提示 -->
            <div v-if="descriptionError" class="error-message">请填写结果描述</div>
          </div>
          
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
import E from 'wangeditor'

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
      editor: null,
      descriptionError: false,
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
  mounted() {
    this.fetchResultDetail()
    this.fetchRequirements()
  },
  beforeUnmount() {
    // 销毁编辑器实例
    if (this.editor) {
      this.editor.destroy()
      this.editor = null
    }
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
        
        // 数据加载完成后初始化编辑器
        this.loading = false
        this.$nextTick(() => {
          this.initEditor()
        })
      } catch (error) {
        console.error('Error fetching result:', error)
        showFailToast('获取结果详情失败')
        // 导航回详情页
        this.$router.push(`/result/${this.id}`)
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
    initEditor() {
      // 创建编辑器实例
      this.editor = new E(this.$refs.editor)

      // 编辑器配置
      this.editor.config.placeholder = '请输入结果详细描述'
      this.editor.config.zIndex = 100
      this.editor.config.menus = [
        'bold',
        'italic',
        'underline',
        'head',
        'fontSize',
        'fontName',
        'strikeThrough',
        'foreColor',
        'backColor',
        'link',
        'list',
        'justify',
        'quote',
        'emoticon',
        'undo',
        'redo'
      ]

      // 移动端菜单配置，减少按钮数量
      if (window.innerWidth < 768) {
        this.editor.config.menus = [
          'bold',
          'head',
          'fontSize',
          'list',
          'justify',
          'emoticon',
          'undo',
          'redo'
        ]
      }
      
      // 设置编辑区域高度
      this.editor.config.height = 250

      // 创建并挂载编辑器
      this.editor.create()
      
      // 设置编辑器初始内容
      this.editor.txt.html(this.description)
    },
    validateDescription() {
      // 获取编辑器HTML内容
      const editorContent = this.editor.txt.html()
      
      // 检查内容是否为空
      if (!editorContent || editorContent === '<p><br></p>') {
        this.descriptionError = true
        return false
      }
      
      this.descriptionError = false
      this.description = editorContent
      return true
    },
    onRequirementConfirm(option) {
      this.relatedRequirementId = option.value
      this.selectedRequirementTitle = option.value ? option.text : '无关联需求'
      this.showRequirementPicker = false
    },
    async onSubmit() {
      // 验证描述字段
      if (!this.validateDescription()) {
        return
      }
      
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

.rich-text-wrapper {
  background-color: #fff;
  padding: 10px 16px;
  position: relative;
}

.field-label {
  margin-bottom: 8px;
  color: #646566;
  font-size: 14px;
}

.rich-text-editor {
  border: 1px solid #ebedf0;
  border-radius: 4px;
}

.error-message {
  color: #ee0a24;
  font-size: 12px;
  margin-top: 8px;
}

/* 优化移动端编辑器样式 */
:deep(.w-e-toolbar) {
  flex-wrap: wrap;
  padding: 0 5px;
}

:deep(.w-e-toolbar .w-e-menu) {
  padding: 4px 5px;
}

:deep(.w-e-text-container) {
  min-height: 200px;
}
</style>