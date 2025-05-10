<template>
  <div class="nav-bar">
    <van-tabbar v-model="active" route>
      <van-tabbar-item name="home" to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item name="requirements" to="/requirements" icon="label-o">需求</van-tabbar-item>
      <van-tabbar-item name="results" to="/results" icon="certificate">结果</van-tabbar-item>
      <!-- 管理员显示管理控制台图标 -->
      <van-tabbar-item v-if="isAdmin" name="admin" to="/admin" icon="setting-o">管理</van-tabbar-item>
      <van-tabbar-item name="profile" to="/profile" icon="contact">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
import { ref } from 'vue'
import auth from '@/store/auth'

export default {
  name: 'NavBar',
  setup() {
    const active = ref('home')
    return { active }
  },
  computed: {
    // 检查当前用户是否是管理员
    isAdmin() {
      return auth.state.user?.role === 'ADMIN';
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
  z-index: 999;
}
</style>