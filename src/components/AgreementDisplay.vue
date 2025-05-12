<template>
  <div class="agreement-display">
    <div class="display-header">
      <h3>{{ title }}</h3>
    </div>
    
    <div class="display-content">
      <!-- 使用v-html显示HTML格式的内容 -->
      <div v-if="content" v-html="content" class="agreement-content"></div>
      <div v-else class="no-agreement">暂无协议内容</div>
    </div>
    
    <div v-if="showActions" class="display-actions">
      <van-button 
        type="primary" 
        block 
        @click="agree"
        :loading="loading"
        :disabled="loading"
      >
        我已阅读并同意此协议
      </van-button>
      
      <van-button 
        type="default" 
        block 
        @click="goBack"
        class="back-button"
      >
        返回
      </van-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AgreementDisplay',
  props: {
    content: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: '协议内容'
    },
    showActions: {
      type: Boolean,
      default: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    agree() {
      this.$emit('agree')
    },
    goBack() {
      this.$emit('back')
    }
  }
}
</script>

<style scoped>
.agreement-display {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.display-header {
  margin-bottom: 16px;
  border-bottom: 1px solid #f2f2f2;
  padding-bottom: 8px;
}

.display-header h3 {
  margin: 0;
  font-size: 18px;
  color: #323233;
}

.display-content {
  margin-bottom: 24px;
}

.agreement-content {
  font-size: 14px;
  line-height: 1.6;
  color: #323233;
}

.agreement-content :deep(h3) {
  font-size: 16px;
  margin-top: 24px;
  margin-bottom: 16px;
}

.agreement-content :deep(h4) {
  font-size: 15px;
  margin-top: 20px;
  margin-bottom: 10px;
}

.agreement-content :deep(p) {
  margin-bottom: 12px;
}

.agreement-content :deep(ul), 
.agreement-content :deep(ol) {
  padding-left: 20px;
  margin-bottom: 16px;
}

.agreement-content :deep(li) {
  margin-bottom: 8px;
}

.no-agreement {
  color: #969799;
  font-size: 14px;
  text-align: center;
  padding: 30px 0;
}

.display-actions {
  margin-top: 20px;
}

.back-button {
  margin-top: 12px;
}
</style>