<template>
    <div class="page">
      <header-bar :title="'协议'" />
      
      <div class="page-content">
        <div class="agreement-header">
          <h2>服务协议</h2>
          <div class="agreement-version">
            <span>版本号: v1.0.0</span>
          </div>
        </div>
        
        <div class="agreement-content">
          <h3>1. 协议介绍</h3>
          <p>本协议是您与我们之间关于使用本应用服务所订立的契约。请您仔细阅读本协议，确保理解各条款内容。</p>
          
          <h3>2. 服务内容</h3>
          <p>本应用提供需求发布、需求管理和结果展示等服务，具体服务内容以实际提供的为准。我们有权对服务内容进行更新或调整。</p>
          
          <h3>3. 用户隐私</h3>
          <p>我们尊重并保护用户隐私。我们会按照隐私政策收集、使用、存储和分享您的个人信息。请您详细阅读我们的隐私政策并理解其内容。</p>
          
          <h3>4. 用户行为</h3>
          <p>用户在使用本应用服务时应遵守相关法律法规，不得利用本应用从事违法活动。用户需对自己在本应用上发布的内容负责。</p>
          
          <h3>5. 免责声明</h3>
          <p>因网络状况、通讯线路等任何技术原因而导致用户不能正常使用本应用，我们不承担任何法律责任。我们对用户使用本应用的结果不做任何保证。</p>
          
          <h3>6. 协议修改</h3>
          <p>我们保留随时修改本协议的权利。协议修改后，将在应用内通知用户。如用户继续使用本应用，则视为接受修改后的协议。</p>
        </div>
        
        <div class="agreement-action">
          <van-button type="primary" block @click="goBack">返回</van-button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import HeaderBar from '../components/HeaderBar.vue'
  
  export default {
    name: 'Agreement',
    components: {
      HeaderBar
    },
    methods: {
      goBack() {
        this.$router.back()
      }
    }
  }
  </script>
  
  <style scoped>
  .page-content {
    padding-top: 56px;
  }
  
  .agreement-header {
    padding: 16px;
    text-align: center;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
  }
  
  .agreement-version {
    color: #999;
    font-size: 14px;
    margin-top: 8px;
  }
  
  .agreement-content {
    padding: 0 16px;
    line-height: 1.6;
  }
  
  .agreement-content h3 {
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 16px;
  }
  
  .agreement-content p {
    margin-bottom: 16px;
    font-size: 14px;
    color: #333;
  }
  
  .agreement-action {
    margin: 30px 16px;
    padding-bottom: 20px;
  }
  </style>