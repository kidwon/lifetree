// router/index.js - 修改版本，添加基本路径配置
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

// 定义基本路径，根据是否在生产环境决定
const basePath = process.env.NODE_ENV === 'production' ? '/lifetree/' : '/'

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
  // 重定向
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

// 创建路由实例
const router = createRouter({
  // 使用hash模式，更适合GitHub Pages部署
  history: createWebHashHistory(basePath), // 添加基本路径到路由器中
  routes
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
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