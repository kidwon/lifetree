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
          
          <!-- 添加协议编辑器 -->
          <div class="agreement-section">
            <div class="field-label">
              <div class="label-with-tip">
                <span>协议内容</span>
                <van-tag type="primary" size="medium" style="margin-left: 8px;">可选</van-tag>
              </div>
              <span class="field-tip">定义参与者需要同意的协议条款</span>
            </div>
            
            <div v-if="showAgreementEditor">
              <agreement-editor
                @save="saveAgreement"
                @cancel="toggleAgreementEditor"
                ref="agreementEditor"
                title="添加协议"
              />
            </div>
            
            <div v-else-if="agreement" class="agreement-preview">
              <div v-html="agreement" class="agreement-content-preview"></div>
              <div class="agreement-actions">
                <van-button 
                  type="primary" 
                  size="small" 
                  @click="toggleAgreementEditor"
                >
                  编辑协议
                </van-button>
                <van-button 
                  type="danger" 
                  size="small" 
                  @click="clearAgreement"
                >
                  删除协议
                </van-button>
              </div>
            </div>
            
            <div v-else class="agreement-add">
              <van-button 
                plain 
                type="primary" 
                size="small" 
                icon="plus" 
                @click="toggleAgreementEditor"
              >
                添加协议
              </van-button>
              <span class="add-agreement-tip">添加协议可以规范参与者行为和责任</span>
            </div>
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
import AgreementEditor from '../components/AgreementEditor.vue'
import apiService from '../api/api'
import { showSuccessToast, showFailToast } from 'vant'
import E from 'wangeditor'

export default {
  name: 'NewRequirementPage',
  components: {
    HeaderBar,
    AgreementEditor
  },
  data() {
    return {
      title: '',
      description: '',
      agreement: '',
      editor: null,
      submitting: false,
      descriptionError: false,
      showAgreementEditor: false
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
    
    // 切换协议编辑器显示状态
    toggleAgreementEditor() {
      this.showAgreementEditor = !this.showAgreementEditor
    },
    
    // 保存协议内容
    saveAgreement(content) {
      this.agreement = content
      this.showAgreementEditor = false
      
      // 通知协议编辑器保存成功
      if (this.$refs.agreementEditor) {
        this.$refs.agreementEditor.saved(true)
      }
    },
    
    // 清除协议内容
    clearAgreement() {
      this.agreement = ''
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
          description: this.description,
          agreement: this.agreement || null // 添加协议字段
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

.rich-text-editor {
  border: 1px solid #ebedf0;
  border-radius: 4px;
}

.error-message {
  color: #ee0a24;
  font-size: 12px;
  margin-top: 8px;
}

/* 协议相关样式 */
.agreement-section {
  background-color: #fff;
  padding: 10px 16px;
  position: relative;
  margin-top: 8px;
}

.agreement-add {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  margin: 16px 0;
}

.add-agreement-tip {
  font-size: 12px;
  color: #969799;
}

.agreement-preview {
  margin: 12px 0;
  border: 1px dashed #ebedf0;
  border-radius: 4px;
  padding: 12px;
  position: relative;
}

.agreement-content-preview {
  max-height: 200px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.5;
}

.agreement-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
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