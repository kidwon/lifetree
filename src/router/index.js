// router/index.js - 更新版本，添加管理员路由

import { createRouter, createWebHashHistory } from 'vue-router'
import auth from '@/store/auth'

// 导入页面组件
import Home from '../views/Home.vue'
import Requirements from '../views/Requirements.vue'
import Results from '../views/Results.vue'
import Profile from '../views/Profile.vue'
import RequirementDetail from '../views/RequirementDetail.vue'
import ResultDetail from '../views/ResultDetail.vue'
import Agreement from '../views/Agreement.vue'
import NewRequirement from '../views/NewRequirement.vue'
import EditRequirement from '../views/EditRequirement.vue'
import NewResult from '../views/NewResult.vue'
import EditResult from '../views/EditResult.vue'
import ResultsByRequirement from '../views/ResultsByRequirement.vue'
// 导入认证页面
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
// 导入管理员页面
import AdminDashboard from '../views/AdminDashboard.vue'
import AdminUsers from '../views/AdminUsers.vue'
import AdminSettings from '../views/AdminSettings.vue'

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
    component: Requirements,
    meta: { requiresAuth: true }
  },
  {
    path: '/results',
    name: 'Results',
    component: Results,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/requirement/:id',
    name: 'RequirementDetail',
    component: RequirementDetail,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/requirement/edit/:id',
    name: 'EditRequirement',
    component: EditRequirement,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/result/:id',
    name: 'ResultDetail',
    component: ResultDetail,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/result/edit/:id',
    name: 'EditResult',
    component: EditResult,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/results/requirement/:requirementId',
    name: 'ResultsByRequirement',
    component: ResultsByRequirement,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/agreement',
    name: 'Agreement',
    component: Agreement
  },
  {
    path: '/requirement/new',
    name: 'NewRequirement',
    component: NewRequirement,
    meta: { requiresAuth: true }
  },
  {
    path: '/result/new',
    name: 'NewResult',
    component: NewResult,
    meta: { requiresAuth: true }
  },
  // 认证相关路由
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guest: true }
  },
  // 管理员路由
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/settings',
    name: 'AdminSettings',
    component: AdminSettings,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  // 重定向
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

// 创建路由实例
const router = createRouter({
  // 使用hash模式，更适合GitHub Pages部署
  history: createWebHashHistory(),
  routes
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  // 需要管理员权限的页面
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    // 检查用户是否是管理员
    const user = auth.state.user;
    if (!user || user.role !== 'ADMIN') {
      // 用户不是管理员，重定向到首页
      next({
        path: '/'
      });
      return;
    }
  }

  // 需要认证的页面
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查用户是否已登录
    if (!auth.state.isAuthenticated) {
      // 保存用户想要访问的页面路径
      sessionStorage.setItem('redirectPath', to.fullPath);
      // 重定向到登录页面
      next({
        path: '/login'
      });
    } else {
      next();
    }
  } 
  // 游客专属页面（已登录用户不应访问的页面，如登录、注册页）
  else if (to.matched.some(record => record.meta.guest)) {
    if (auth.state.isAuthenticated) {
      // 已登录用户访问游客页面，重定向到首页
      next({
        path: '/'
      });
    } else {
      next();
    }
  } else {
    // 公共页面，所有用户都可访问
    next();
  }
});

export default router