<template>
  <div id="app">
    <router-view></router-view>
    
    <!-- 悬浮日志开关按钮，仅管理员可见 -->
    <div v-if="isAdmin" class="logger-toggle" @click="toggleLogger">
      <van-icon :name="loggerVisible ? 'close' : 'description'" size="20" />
    </div>
    
    <!-- 全局日志控制台，仅在开启时显示 -->
    <console-logger v-if="loggerVisible" />
  </div>
</template>

<script>
import ConsoleLogger from './components/ConsoleLogger.vue'
import auth from './store/auth'

export default {
  name: 'App',
  components: {
    ConsoleLogger
  },
  data() {
    return {
      loggerVisible: false
    }
  },
  computed: {
    isAdmin() {
      return auth.state.user?.role === 'ADMIN';
    }
  },
  created() {
    console.log('应用初始化完成');
  },
  methods: {
    toggleLogger() {
      this.loggerVisible = !this.loggerVisible;
      console.log(`全局日志控制台已${this.loggerVisible ? '开启' : '关闭'}`);
      
      if (this.loggerVisible) {
        // 触发一些示例日志
        console.log('日志控制台已激活');
        console.info('这是一条信息日志');
        setTimeout(() => {
          console.warn('这是一条警告日志');
        }, 500);
        setTimeout(() => {
          console.error('这是一条错误日志');
        }, 1000);
      }
    }
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica,
    Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f7f8fa;
}

/* 全局样式 */
.page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

/* 仿书法字体样式 */
.small-seal-font {
  font-family: 'SimSun', serif;
  font-weight: bold;
}

/* 悬浮日志开关按钮样式 */
.logger-toggle {
  position: fixed;
  right: 16px;
  bottom: 70px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(25, 137, 250, 0.8);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 999;
}
</style>