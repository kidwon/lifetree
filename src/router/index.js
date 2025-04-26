// router/index.js

import { createRouter, createWebHashHistory } from 'vue-router'

// 导入页面组件
import Home from '../views/Home.vue'
import Requirements from '../views/Requirements.vue'
import Results from '../views/Results.vue'
import Profile from '../views/Profile.vue'
import RequirementDetail from '../views/RequirementDetail.vue'
import ResultDetail from '../views/ResultDetail.vue'
import Agreement from '../views/Agreement.vue'
// 导入新增的新建页面组件
import NewRequirement from '../views/NewRequirement.vue'
import NewResult from '../views/NewResult.vue'

// 定义路由
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/requirements',
    name: 'Requirements',
    component: Requirements
  },
  {
    path: '/results',
    name: 'Results',
    component: Results
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/requirement/:id',
    name: 'RequirementDetail',
    component: RequirementDetail,
    props: true
  },
  {
    path: '/result/:id',
    name: 'ResultDetail',
    component: ResultDetail,
    props: true
  },
  {
    path: '/agreement',
    name: 'Agreement',
    component: Agreement
  },
  // 新增的路由
  {
    path: '/requirement/new',
    name: 'NewRequirement',
    component: NewRequirement
  },
  {
    path: '/result/new',
    name: 'NewResult',
    component: NewResult
  },
  // 重定向
  {
    path: '/:pathMatch(.*)*',
    redirect: '/requirements'
  }
]

// 创建路由实例
const router = createRouter({
  // 使用hash模式，更适合GitHub Pages部署
  history: createWebHashHistory(),
  routes
})

export default router