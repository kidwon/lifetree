<template>
  <div id="app">
    <!-- 路由视图 -->
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
}

body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

/* 全局样式 */
.page {
  padding: 46px 0 50px;
  box-sizing: border-box;
  min-height: 100vh;
}

.page-content {
  padding: 15px;
}
</style>