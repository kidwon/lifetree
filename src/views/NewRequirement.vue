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
          
          <div class="rich-text-wrapper">
            <div class="field-label">需求描述</div>
            <!-- 使用div作为富文本编辑器容器 -->
            <div ref="editor" class="rich-text-editor"></div>
            <!-- 错误提示 -->
            <div v-if="descriptionError" class="error-message">请填写需求描述</div>
          </div>
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
import E from 'wangeditor'

export default {
  name: 'NewRequirementPage',
  components: {
    HeaderBar
  },
  data() {
    return {
      title: '',
      description: '',
      editor: null,
      submitting: false,
      descriptionError: false
    }
  },
  mounted() {
    // 初始化富文本编辑器
    this.initEditor()
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
      this.editor.config.placeholder = '请输入需求详细描述'
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
    async onSubmit() {
      // 验证描述字段
      if (!this.validateDescription()) {
        return
      }

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