<template>
  <div class="agreement-editor">
    <div class="editor-header">
      <h3>{{ title }}</h3>
      <p class="editor-tip">请编辑此需求的协议内容，参与者同意此协议后才能参与需求。</p>
    </div>
    
    <div class="rich-text-wrapper">
      <!-- 使用div作为富文本编辑器容器 -->
      <div ref="editor" class="rich-text-editor"></div>
      <!-- 错误提示 -->
      <div v-if="contentError" class="error-message">{{ contentErrorMessage }}</div>
    </div>
    
    <!-- 新增协议按钮文本编辑 -->
    <div class="button-text-editor">
      <div class="field-label">
        <div class="label-with-tip">
          <span>确认按钮文本</span>
          <van-tag type="primary" size="mini" style="margin-left: 8px;">可选</van-tag>
        </div>
        <span class="field-tip">自定义"同意协议"按钮文本，最长20个字符</span>
      </div>
      
      <van-field
        v-model="buttonText"
        placeholder="请输入按钮文本，留空则使用默认文本"
        :maxlength="20"
        show-word-limit
      />
      <div v-if="buttonTextError" class="error-message">{{ buttonTextErrorMessage }}</div>
    </div>
    
    <div class="editor-actions">
      <van-button 
        type="primary" 
        @click="saveAgreement" 
        :loading="saving"
        :disabled="saving"
      >
        保存协议
      </van-button>
      <van-button 
        type="default" 
        @click="cancel"
        :disabled="saving"
      >
        取消
      </van-button>
    </div>
  </div>
</template>

<script>
import E from 'wangeditor'
import { showSuccessToast, showFailToast } from 'vant'

export default {
  name: 'AgreementEditor',
  props: {
    initialContent: {
      type: String,
      default: ''
    },
    initialButtonText: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: '编辑协议'
    }
  },
  data() {
    return {
      editor: null,
      content: '',
      buttonText: this.initialButtonText || '',
      saving: false,
      contentError: false,
      contentErrorMessage: '协议内容不能为空',
      buttonTextError: false,
      buttonTextErrorMessage: '按钮文本最长为20个字符'
    }
  },
  mounted() {
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
      this.editor.config.placeholder = '请输入协议内容...'
      this.editor.config.zIndex = 100
      
      // 设置菜单，移动端减少
      if (window.innerWidth < 768) {
        this.editor.config.menus = [
          'bold',
          'head',
          'fontSize',
          'list',
          'justify',
          'undo',
          'redo'
        ]
      } else {
        this.editor.config.menus = [
          'bold',
          'italic',
          'underline',
          'head',
          'fontSize',
          'fontName',
          'strikeThrough',
          'link',
          'list',
          'justify',
          'quote',
          'undo',
          'redo'
        ]
      }

      // 设置编辑区域高度
      this.editor.config.height = 300

      // 创建并挂载编辑器
      this.editor.create()
      
      // 设置编辑器初始内容
      if (this.initialContent) {
        this.editor.txt.html(this.initialContent)
      } else {
        // 设置默认协议模板
        this.editor.txt.html(this.getDefaultAgreementTemplate())
      }
    },
    
    validateContent() {
      // 获取编辑器HTML内容
      const editorContent = this.editor.txt.html()
      
      // 检查内容是否为空
      if (!editorContent || editorContent === '<p><br></p>') {
        this.contentError = true
        return false
      }
      
      this.contentError = false
      this.content = editorContent
      return true
    },
    
    validateButtonText() {
      // 按钮文本可以为空（使用默认值）
      if (!this.buttonText) {
        this.buttonTextError = false
        return true
      }
      
      // 检查按钮文本长度
      if (this.buttonText.length > 20) {
        this.buttonTextError = true
        return false
      }
      
      this.buttonTextError = false
      return true
    },
    
    saveAgreement() {
      const contentValid = this.validateContent()
      const buttonTextValid = this.validateButtonText()
      
      if (!contentValid || !buttonTextValid) {
        if (!contentValid) {
          showFailToast(this.contentErrorMessage)
        } else {
          showFailToast(this.buttonTextErrorMessage)
        }
        return
      }
      
      this.saving = true
      
      // 发射内容更新事件，包括按钮文本
      this.$emit('save', this.content, this.buttonText)
      
      // 在组件内不处理保存逻辑，由父组件处理
    },
    
    saved(success, message) {
      this.saving = false
      
      if (success) {
        showSuccessToast(message || '协议已保存')
      } else {
        showFailToast(message || '保存失败')
      }
    },
    
    cancel() {
      this.$emit('cancel')
    },
    
    // 获取默认协议模板
    getDefaultAgreementTemplate() {
      return `
      <h3>参与协议</h3>
      <p>欢迎参与本需求工作。在您申请参与之前，请仔细阅读以下协议内容：</p>
      
      <h4>1. 参与条件</h4>
      <p>参与者同意按照需求描述完成相关工作，并遵守项目的时间节点和质量要求。</p>
      
      <h4>2. 权利与责任</h4>
      <p>参与者有权获取与工作相关的必要信息和资源，同时有责任保持信息的保密性。</p>
      
      <h4>3. 成果交付</h4>
      <p>参与者应当按时提交工作成果，并确保成果符合需求描述的要求。</p>
      
      <h4>4. 合作方式</h4>
      <p>参与者需要与需求方保持良好的沟通，及时反馈工作进度和遇到的问题。</p>
      
      <p>申请参与即表示您已阅读并同意本协议的全部内容。</p>
      `
    }
  }
}
</script>

<style scoped>
.agreement-editor {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.editor-header {
  margin-bottom: 16px;
}

.editor-header h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 18px;
  color: #323233;
}

.editor-tip {
  color: #969799;
  font-size: 14px;
  margin: 0;
}

.rich-text-wrapper {
  margin-bottom: 16px;
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

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

/* 按钮文本编辑器样式 */
.button-text-editor {
  margin-top: 20px;
  margin-bottom: 16px;
}

.field-label {
  margin-bottom: 8px;
  color: #646566;
  font-size: 14px;
}

.label-with-tip {
  display: flex;
  align-items: center;
}

.field-tip {
  display: block;
  font-size: 12px;
  color: #969799;
  margin-top: 2px;
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
  min-height: 300px;
}
</style>