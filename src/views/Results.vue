<template>
    <div class="page">
      <header-bar :title="'结果列表'" :show-back="false" />
      
      <div class="page-content">
        <van-cell-group class="list-container">
          <van-cell 
            v-for="item in resultsList" 
            :key="item.id"
            :title="item.title"
            is-link
            @click="goToDetail(item.id)"
            class="list-item"
          />
        </van-cell-group>
      </div>
      
      <nav-bar />
    </div>
  </template>
  
  <script>
  import HeaderBar from '../components/HeaderBar.vue'
  import NavBar from '../components/NavBar.vue'
  
  export default {
    name: 'Results',
    components: {
      HeaderBar,
      NavBar
    },
    data() {
      return {
        // 测试数据
        resultsList: [
          { id: 1, title: '结果1：应用原型设计' },
          { id: 2, title: '结果2：UI界面优化方案' },
          { id: 3, title: '结果3：API接口文档' }
        ]
      }
    },
    methods: {
      goToDetail(id) {
        this.$router.push(`/result/${id}`)
      }
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
  
  .list-container {
    height: 70%;
    display: flex;
    flex-direction: column;
    margin: 0;
    width: 100%;
  }
  
  .list-item {
    flex: 1;
    display: flex;
    align-items: center;
    font-size: 18px;
    border-bottom: 1px solid #ebedf0;
  }
  
  .list-item :deep(.van-cell__title) {
    font-size: 18px;
    font-weight: 500;
  }
  </style>