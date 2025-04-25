<template>
    <div class="nav-bar">
      <van-tabbar v-model="active" route>
        <van-tabbar-item to="/" icon="home-o"></van-tabbar-item>
        <van-tabbar-item to="/requirements">
          <template #icon>
            <div class="custom-icon">
              <div class="icon-circle">
                <img src="https://b.yzcdn.cn/vant/dark-theme.svg" alt="月亮" class="theme-icon" />
              </div>
            </div>
          </template>
        </van-tabbar-item>
        <van-tabbar-item to="/results">
          <template #icon>
            <div class="custom-icon">
              <div class="icon-circle">
                <img src="https://b.yzcdn.cn/vant/light-theme.svg" alt="太阳" class="theme-icon" />
              </div>
            </div>
          </template>
        </van-tabbar-item>
      </van-tabbar>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NavBar',
    data() {
      return {
        active: 0
      }
    },
    watch: {
      $route(to) {
        // 根据当前路由更新激活的标签页
        if (to.path === '/') {
          this.active = 0
        } else if (to.path === '/requirements') {
          this.active = 1
        } else if (to.path === '/results') {
          this.active = 2
        }
      }
    },
    created() {
      // 初始化激活的标签页
      const path = this.$route.path
      if (path === '/') {
        this.active = 0
      } else if (path === '/requirements') {
        this.active = 1
      } else if (path === '/results') {
        this.active = 2
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
  </style>