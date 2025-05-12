<template>
  <div class="page">
    <header-bar :title="'需求列表'" :show-back="false" />

    <div class="page-content">
      <van-empty v-if="!loading && requirementsList.length === 0" description="暂无需求数据" />

      <van-cell-group v-else class="list-container">
        <van-cell v-for="item in limitedRequirementsList" :key="item.id" :title="item.title" is-link
          @click="goToDetail(item.id)" class="list-item" />
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
  name: 'Requirements',
  components: {
    HeaderBar,
    NavBar
  },
  data() {
    return {
      requirementsList: [],
      loading: false,
      initialLoading: true,
    }
  },
  computed: {
    // 只显示最新的三条数据
    limitedRequirementsList() {
      // First filter the list
      const filteredList = this.requirementsList.filter(item =>
        item.status === 'CREATED' || item.status === 'CONFIRMING'
      );

      // Then sort the filtered list by date (newest first)
    const sortedList = [...filteredList].sort((a, b) => {
        // 首先尝试按照updatedAt排序（最新修改的在前面）
        if (a.updatedAt && b.updatedAt) {
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        }
        // 如果updatedAt不存在，则尝试按照createdAt排序
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        // 如果都不存在，则保持原顺序
        return 0;
      });

      // 返回排序后的前三条数据
      return sortedList.slice(0, 3);
    }
  },
  created() {
    this.fetchRequirements();
  },
  mounted() {
    // 添加页面激活时刷新数据的逻辑
    window.addEventListener('focus', this.refreshOnFocus);
  },
  beforeUnmount() {
    // 移除事件监听器
    window.removeEventListener('focus', this.refreshOnFocus);
  },
  methods: {
    async fetchRequirements() {
      try {
        this.initialLoading = true;
        const response = await apiService.requirements.getAll();
        console.log(response)

        // 为了避免数据突变的问题，对接收的数据进行深拷贝
        // 这样可以确保原始数据不会被意外修改
        this.requirementsList = JSON.parse(JSON.stringify(response.data));

        console.log('获取到的需求数据:', this.requirementsList);
      } catch (error) {
        console.error('Error fetching requirements:', error);
        showFailToast('获取需求列表失败');
      } finally {
        this.initialLoading = false;
      }
    },
    refreshOnFocus() {
      // 当页面重新获得焦点时，刷新数据
      // 例如，从其他页面返回时刷新数据
      if (this.$route.path === '/requirements') {
        this.fetchRequirements();
      }
    },
    goToDetail(id) {
      // 导航到详情页时，不修改列表中的数据
      this.$router.push(`/requirement/${id}`);
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