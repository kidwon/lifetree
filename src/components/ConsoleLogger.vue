<!-- ConsoleLogger.vue -->
<template>
  <div class="console-logger" :class="{ 'console-logger-expanded': expanded }">
    <div class="console-header" @click="toggleExpanded">
      <div class="console-title">
        <van-icon name="terminal-o" class="console-icon" />
        <span>日志控制台</span>
      </div>
      <div class="console-actions">
        <van-button size="mini" type="primary" @click.stop="clearLogs">清除</van-button>
        <van-button size="mini" type="default" @click.stop="toggleExpanded">
          {{ expanded ? '收起' : '展开' }}
        </van-button>
      </div>
    </div>
    <div class="console-content">
      <div class="console-messages" ref="messagesContainer">
        <div 
          v-for="(log, index) in logs" 
          :key="index" 
          class="log-entry"
          :class="getLogClass(log.type)"
        >
          <div class="log-time">{{ formatTime(log.timestamp) }}</div>
          <div class="log-content">
            <div class="log-type">{{ getLogType(log.type) }}</div>
            <div class="log-message">{{ log.message }}</div>
          </div>
        </div>
        <div v-if="logs.length === 0" class="empty-log">暂无日志</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConsoleLogger',
  data() {
    return {
      logs: [],
      expanded: false,
      maxLogs: 100, // 最大日志数量限制
      originalConsole: {}, // 存储原始的控制台方法
    };
  },
  mounted() {
    this.setupConsoleOverride();
    this.scrollToBottom();
  },
  beforeUnmount() {
    this.restoreConsole();
  },
  methods: {
    // 设置控制台方法重写
    setupConsoleOverride() {
      // 保存原始的控制台方法
      this.originalConsole = {
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error
      };

      // 重写控制台方法
      console.log = this.createConsoleMethod('log');
      console.info = this.createConsoleMethod('info');
      console.warn = this.createConsoleMethod('warn');
      console.error = this.createConsoleMethod('error');
    },

    // 恢复原始控制台方法
    restoreConsole() {
      console.log = this.originalConsole.log;
      console.info = this.originalConsole.info;
      console.warn = this.originalConsole.warn;
      console.error = this.originalConsole.error;
    },

    // 创建控制台方法的工厂函数
    createConsoleMethod(type) {
      const originalMethod = this.originalConsole[type];
      
      return (...args) => {
        // 调用原始方法，保持控制台正常功能
        originalMethod.apply(console, args);
        
        // 将日志信息添加到组件
        this.addLog(type, this.formatArgs(args));
      };
    },

    // 格式化参数
    formatArgs(args) {
      return args.map(arg => {
        try {
          if (arg === undefined) return 'undefined';
          if (arg === null) return 'null';
          if (typeof arg === 'object') return JSON.stringify(arg);
          return String(arg);
        } catch (e) {
          return '[无法显示]';
        }
      }).join(' ');
    },

    // 添加日志
    addLog(type, message) {
      this.logs.push({
        type,
        message,
        timestamp: new Date()
      });
      
      // 限制日志数量
      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },

    // 清除日志
    clearLogs(event) {
      if (event) event.stopPropagation();
      this.logs = [];
    },

    // 切换展开/收起状态
    toggleExpanded(event) {
      if (event) event.stopPropagation();
      this.expanded = !this.expanded;
    },

    // 滚动到底部
    scrollToBottom() {
      if (this.$refs.messagesContainer) {
        this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
      }
    },

    // 格式化时间
    formatTime(date) {
      if (!date) return '';
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`;
    },

    // 获取日志类型的显示文本
    getLogType(type) {
      const typeMap = {
        'log': 'LOG',
        'info': 'INFO',
        'warn': 'WARN',
        'error': 'ERROR'
      };
      return typeMap[type] || 'LOG';
    },

    // 获取日志类型对应的样式类
    getLogClass(type) {
      return `log-${type}`;
    }
  }
};
</script>

<style scoped>
.console-logger {
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  z-index: 9999;
  height: 30px;
  overflow: hidden;
  transition: height 0.3s ease;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 12px;
}

.console-logger-expanded {
  height: 50vh;
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  height: 30px;
  background-color: #222;
  cursor: pointer;
}

.console-title {
  display: flex;
  align-items: center;
}

.console-icon {
  margin-right: 5px;
}

.console-actions {
  display: flex;
  gap: 5px;
}

.console-content {
  height: calc(100% - 30px);
  overflow: hidden;
}

.console-messages {
  height: 100%;
  overflow-y: auto;
  padding: 5px;
}

.log-entry {
  display: flex;
  margin-bottom: 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 5px;
}

.log-time {
  color: #888;
  margin-right: 8px;
  min-width: 120px;
}

.log-content {
  flex: 1;
  display: flex;
  word-break: break-all;
}

.log-type {
  min-width: 50px;
  margin-right: 8px;
  font-weight: bold;
}

.log-log .log-type {
  color: #fff;
}

.log-info .log-type {
  color: #4caf50;
}

.log-warn .log-type {
  color: #ff9800;
}

.log-error .log-type {
  color: #f44336;
}

.empty-log {
  color: #888;
  text-align: center;
  padding: 10px;
}
</style>