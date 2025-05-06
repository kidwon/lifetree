<template>
  <div class="page">
    <header-bar :title="'结果列表'" :show-back="false" />
    
    <div class="page-content">
      <van-empty v-if="!loading && resultsList.length === 0" description="暂无结果数据" />
      
      <van-cell-group v-else class="list-container">
        <van-cell 
          v-for="item in limitedResultsList" 
          :key="item.id"
          :title="item.title"
          is-link
          @click="goToDetail(item.id)"
          class="list-item"
        />
      </van-cell-group>
    </div>
    
    <van-loading v-if="initialLoading" vertical class="loading-overlay">加载中...</van-loading>
    
    <nav-bar />
  </div>
</template>

<script>
import HeaderBar from '../components/HeaderBar.vue'
import NavBar from '../components/NavBar.vue'
import apiService from '../api/api'
import { showFailToast } from 'vant'

export default {
  name: 'Results',
  components: {
    HeaderBar,
    NavBar
  },
  data() {
    return {
      resultsList: [],
      loading: false,
      initialLoading: true
    }
  },
  computed: {
    // 只显示最新的三条结果
    limitedResultsList() {
      return this.resultsList.slice(0, 3);
    }
  },
  created() {
    this.fetchResults()
  },
  methods: {
    async fetchResults() {
      try {
        const response = await apiService.results.getAll()
        // 对数据按创建时间倒序排序，显示最新的数据
        this.resultsList = response.data.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt)
        })
        this.initialLoading = false
      } catch (error) {
        console.error('Error fetching results:', error)
        showFailToast('获取结果列表失败')
        this.initialLoading = false
      }
    },
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

.loading-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
}
</style>