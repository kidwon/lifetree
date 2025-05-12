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
          
          <div class="rich-text-wrapper">
            <div class="field-label">结果描述</div>
            <!-- 使用div作为富文本编辑器容器 -->
            <div ref="editor" class="rich-text-editor"></div>
            <!-- 错误提示 -->
            <div v-if="descriptionError" class="error-message">请填写结果描述</div>
          </div>
          
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
import E from 'wangeditor'

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
      selectedRequirementTitle: '无关联需求',
      editor: null,
      descriptionError: false
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
    // 初始化富文本编辑器
    this.initEditor()
    
    // 获取所有需求列表，用于选择关联
    this.fetchRequirements()
    
    // 如果从URL获取了需求ID，则获取需求标题
    if (this.relatedRequirementId) {
      this.fetchRequirementDetails(this.relatedRequirementId)
    }
  },
  beforeUnmount() {
    // 销毁编辑器实例
    if (this.editor) {
      this.editor.destroy()
      this.editor = null
    }
  },
  methods: {
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
      // 验证描述字段
      if (!this.validateDescription()) {
        return
      }
      
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