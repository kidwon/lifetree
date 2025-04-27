<template>
  <div class="page">
    <header-bar :title="'首页'" :show-back="false" />
    
    <div class="page-content home-content">
      <div class="welcome-section">
        <h2 class="small-seal-font">生命树</h2>
      </div>
    </div>
    
    <nav-bar />
  </div>
</template>

<script>
import HeaderBar from '../components/HeaderBar.vue'
import NavBar from '../components/NavBar.vue'

export default {
  name: 'HomePage',
  components: {
    HeaderBar,
    NavBar
  }
}
</script>

<style scoped>
.page-content {
  padding-top: 56px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 106px);
}

.welcome-section {
  text-align: center;
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60%;
}

.welcome-section h2 {
  font-size: 36px;
  color: #333;
  letter-spacing: 5px;
}

/* 为小篆字体添加特殊样式 */
.welcome-section .small-seal-font {
  margin-bottom: 30px;
}
</style>