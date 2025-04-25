<template>
    <div class="page">
      <header-bar :title="'需求列表'" :show-back="false" />
      
      <div class="page-content">
        <van-cell-group class="list-container">
          <van-cell 
            v-for="item in requirementsList" 
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
    name: 'Requirements',
    components: {
      HeaderBar,
      NavBar
    },
    data() {
      return {
        // 测试数据
        requirementsList: [
          { id: 1, title: '需求1：移动应用开发' },
          { id: 2, title: '需求2：网页设计优化' },
          { id: 3, title: '需求3：后端服务开发' }
        ]
      }
    },
    methods: {
      goToDetail(id) {
        this.$router.push(`/requirement/${id}`)
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