<template>
  <div class="nav-bar">
    <van-tabbar v-model="active" route>
      <van-tabbar-item to="/results">
        <template #icon>
          <div class="custom-icon" @touchstart="handleTouchStart('results')" @touchend="handleTouchEnd"
            @mousedown="handleMouseDown('results')" @mouseup="handleMouseUp" @mouseleave="handleMouseUp">
            <div class="icon-circle">
              <img src="https://b.yzcdn.cn/vant/light-theme.svg" alt="太阳" class="theme-icon" />
            </div>
          </div>
        </template>
      </van-tabbar-item>
      <van-tabbar-item to="/profile">
        <template #icon>
          <div class="custom-icon">
            <div class="icon-circle">
              <van-icon name="contact" size="24" />
            </div>
          </div>
        </template>
      </van-tabbar-item>
      <van-tabbar-item to="/requirements">
        <template #icon>
          <div class="custom-icon" @touchstart="handleTouchStart('requirements')" @touchend="handleTouchEnd"
            @mousedown="handleMouseDown('requirements')" @mouseup="handleMouseUp" @mouseleave="handleMouseUp">
            <div class="icon-circle">
              <img src="https://b.yzcdn.cn/vant/dark-theme.svg" alt="月亮" class="theme-icon" />
            </div>
          </div>
        </template>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
// 导入Toast
import { showToast } from 'vant';

export default {
  name: 'NavBar',
  data() {
    return {
      active: 0,
      longPressTimer: null,
      longPressDelay: 800, // 长按触发时间，单位毫秒
      currentIcon: null
    }
  },
  watch: {
    $route(to) {
      // 根据当前路由更新激活的标签页
      if (to.path === '/requirements') {
        this.active = 0
      } else if (to.path === '/profile') {
        this.active = 1
      } else if (to.path === '/results') {
        this.active = 2
      }
    }
  },
  created() {
    // 初始化激活的标签页
    const path = this.$route.path
    if (path === '/requirements') {
      this.active = 0
    } else if (path === '/profile') {
      this.active = 1
    } else if (path === '/results') {
      this.active = 2
    } else if (path === '/') {
      // 在首页时默认选中需求列表标签
      this.active = 0
    }
  },
  methods: {
    // 触摸设备的长按处理
    handleTouchStart(icon) {
      this.currentIcon = icon;
      // 清除可能存在的定时器
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
      }

      // 设置长按定时器
      this.longPressTimer = setTimeout(() => {
        this.onLongPress(icon);
      }, this.longPressDelay);
    },

    handleTouchEnd() {
      // 清除定时器
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
      this.currentIcon = null;
    },

    // 鼠标设备的长按处理
    handleMouseDown(icon) {
      // 在PC端使用鼠标事件模拟长按
      this.currentIcon = icon;
      // 清除可能存在的定时器
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
      }

      // 设置长按定时器
      this.longPressTimer = setTimeout(() => {
        this.onLongPress(icon);
      }, this.longPressDelay);
    },

    handleMouseUp() {
      // 清除定时器
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
      this.currentIcon = null;
    },

    onLongPress(icon) {
      if (icon === 'requirements') {
        // 长按月亮图标，跳转到新建需求页面
        this.$router.push('/requirement/new');
      } else if (icon === 'results') {
        // 长按太阳图标，跳转到新建结果页面
        this.$router.push('/result/new');
      }

      // 使用导入的showToast而不是this.$toast
      showToast({
        message: `正在前往${icon === 'requirements' ? '新建需求' : '新建结果'}页面...`,
        type: 'success'
      });
    }
  }
}
</script>

<style scoped>
.nav-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.custom-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  /* 防止长按时出现系统菜单 */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  /* 改变鼠标样式提示可交互 */
  cursor: pointer;
}

.icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  /* 添加悬停效果 */
  transition: background-color 0.3s, border-color 0.3s;
}

.custom-icon:hover .icon-circle {
  background-color: #f5f5f5;
  border-color: #ccc;
}

.theme-icon {
  width: 24px;
  height: 24px;
}

.nav-bar :deep(.van-tabbar) {
  height: 60px;
}

.nav-bar :deep(.van-tabbar-item) {
  font-size: 16px;
}

.nav-bar :deep(.van-icon) {
  font-size: 26px;
}

/* 长按时的视觉反馈 */
.custom-icon:active .icon-circle {
  background-color: #e8e8e8;
  transform: scale(0.95);
}
</style>