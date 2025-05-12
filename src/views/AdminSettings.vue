<!-- AdminSettings.vue -->
<template>
  <div class="page">
    <header-bar :title="'系统设置'" />
    
    <div class="page-content">
      <div class="section-header">
        <h2>系统配置</h2>
      </div>
      
      <van-cell-group inset>
        <van-cell title="API服务器" is-link @click="showApiServerDialog">
          <template #value>
            <span>{{ config.apiServer }}</span>
          </template>
        </van-cell>
        
        <van-cell title="日志级别">
          <template #value>
            <van-dropdown-menu>
              <van-dropdown-item v-model="config.logLevel" :options="logLevelOptions" @change="onLogLevelChange" />
            </van-dropdown-menu>
          </template>
        </van-cell>
        
        <van-cell title="会话超时时间（分钟）">
          <template #value>
            <van-stepper v-model="config.sessionTimeout" min="5" max="120" @change="onSessionTimeoutChange" />
          </template>
        </van-cell>
      </van-cell-group>
      
      <div class="section-header">
        <h2>功能开关</h2>
      </div>
      
      <van-cell-group inset>
        <van-cell title="允许用户注册">
          <template #right-icon>
            <van-switch v-model="config.allowRegistration" @change="onToggleRegistration" size="24" />
          </template>
        </van-cell>
        
        <van-cell title="维护模式">
          <template #right-icon>
            <van-switch v-model="config.maintenanceMode" @change="onToggleMaintenanceMode" size="24" />
          </template>
        </van-cell>
        
        <van-cell title="开启调试模式">
          <template #right-icon>
            <van-switch v-model="config.debugMode" @change="onToggleDebugMode" size="24" />
          </template>
        </van-cell>
      </van-cell-group>
      
      <div style="margin: 16px;">
        <van-button 
          round 
          block 
          type="primary" 
          @click="onSaveSettings"
          :loading="saving"
        >
          保存设置
        </van-button>
      </div>
    </div>
    
    <!-- API服务器设置对话框 -->
    <van-dialog
      v-model:show="showApiServerPopup"
      title="设置API服务器"
      show-cancel-button
      @confirm="onConfirmApiServer"
    >
      <van-field
        v-model="apiServerInput"
        label="API服务器地址"
        placeholder="请输入API服务器地址"
      />
    </van-dialog>
    
    <!-- 日志控制台 -->
    <console-logger v-if="config.debugMode" />
    
    <nav-bar />
  </div>
</template>

<script>
import HeaderBar from '../components/HeaderBar.vue'
import NavBar from '../components/NavBar.vue'
import ConsoleLogger from '../components/ConsoleLogger.vue'
import { showSuccessToast, showFailToast } from 'vant'

export default {
  name: 'AdminSettings',
  components: {
    HeaderBar,
    NavBar,
    ConsoleLogger
  },
  data() {
    return {
      saving: false,
      showApiServerPopup: false,
      apiServerInput: '',
      config: {
        apiServer: 'http://45.95.212.18:44058/api',
        logLevel: 'info',
        sessionTimeout: 30,
        allowRegistration: true,
        maintenanceMode: false,
        debugMode: false
      },
      logLevelOptions: [
        { text: '错误', value: 'error' },
        { text: '警告', value: 'warn' },
        { text: '信息', value: 'info' },
        { text: '调试', value: 'debug' }
      ]
    }
  },
  mounted() {
    // 加载存储的配置（如果有）
    this.loadConfig()
    console.log('管理设置页面已加载')
  },
  methods: {
    loadConfig() {
      // 加载存储的配置（从localStorage或API）
      const storedConfig = localStorage.getItem('adminConfig')
      if (storedConfig) {
        try {
          this.config = JSON.parse(storedConfig)
          console.log('已加载系统配置')
        } catch (err) {
          console.error('解析存储的配置失败:', err)
        }
      }
    },
    
    saveConfig() {
      // 保存配置到localStorage或API
      localStorage.setItem('adminConfig', JSON.stringify(this.config))
      console.log('配置已保存')
    },
    
    showApiServerDialog() {
      this.apiServerInput = this.config.apiServer
      this.showApiServerPopup = true
    },
    
    onConfirmApiServer() {
      if (this.apiServerInput) {
        this.config.apiServer = this.apiServerInput
        console.log(`API服务器地址已更改为: ${this.config.apiServer}`)
      }
    },
    
    onLogLevelChange(value) {
      this.config.logLevel = value
      console.log(`日志级别已更改为: ${value}`)
    },
    
    onSessionTimeoutChange(value) {
      this.config.sessionTimeout = value
      console.log(`会话超时时间已更改为: ${value} 分钟`)
    },
    
    onToggleRegistration(value) {
      this.config.allowRegistration = value
      console.log(`用户注册功能已${value ? '开启' : '关闭'}`)
    },
    
    onToggleMaintenanceMode(value) {
      this.config.maintenanceMode = value
      console.log(`维护模式已${value ? '开启' : '关闭'}`)
    },
    
    onToggleDebugMode(value) {
      this.config.debugMode = value
      console.log(`调试模式已${value ? '开启' : '关闭'}`)
      
      if (value) {
        console.log('调试日志已开启')
        console.info('这是一条信息日志')
        console.warn('这是一条警告日志')
        console.error('这是一条错误日志')
      }
    },
    
    async onSaveSettings() {
      this.saving = true
      
      try {
        // 保存配置
        this.saveConfig()
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        showSuccessToast('设置已保存')
        console.log('系统设置已成功保存')
      } catch (error) {
        console.error('保存设置失败:', error)
        showFailToast('保存设置失败')
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.page-content {
  padding-top: 56px;
  padding-bottom: 50px;
}

.section-header {
  padding: 16px;
  color: #323233;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
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

:deep(.van-cell__value) {
  flex: none;
}
</style>