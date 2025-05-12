<!-- AdminUsers.vue -->
<template>
  <div class="page">
    <header-bar :title="'用户管理'" />
    
    <div class="page-content">
      <van-loading v-if="loading" vertical class="loading-overlay">加载中...</van-loading>
      
      <template v-else>
        <div class="search-bar">
          <van-search
            v-model="searchText"
            placeholder="搜索用户"
            @search="onSearch"
            @clear="onClearSearch"
          />
        </div>
        
        <van-empty v-if="filteredUsers.length === 0" description="没有找到用户" />
        
        <van-list
          v-else
          :finished="true"
          finished-text="没有更多用户"
        >
          <van-cell
            v-for="user in filteredUsers"
            :key="user.id"
            :title="user.name"
            :label="`${user.email} | ${getRoleText(user.role)}`"
            @click="showUserActions(user)"
          >
            <template #right-icon>
              <div class="user-status" :class="{'status-active': true}">
                <div class="status-dot"></div>
                <span>活跃</span>
              </div>
            </template>
          </van-cell>
        </van-list>
      </template>
    </div>
    
    <!-- 用户操作弹出菜单 -->
    <van-action-sheet
      v-model:show="showActions"
      :actions="userActions"
      @select="onSelectAction"
      cancel-text="取消"
      @cancel="currentUser = null"
    />
    
    <!-- 日志控制台 -->
    <console-logger v-if="showLogger" />
    
    <nav-bar />
  </div>
</template>

<script>
import HeaderBar from '../components/HeaderBar.vue'
import NavBar from '../components/NavBar.vue'
import ConsoleLogger from '../components/ConsoleLogger.vue'
import apiService from '../api/api'
import { showSuccessToast, showFailToast, showConfirmDialog } from 'vant'
import auth from '@/store/auth'

export default {
  name: 'AdminUsers',
  components: {
    HeaderBar,
    NavBar,
    ConsoleLogger
  },
  data() {
    return {
      users: [],
      loading: true,
      searchText: '',
      showActions: false,
      currentUser: null,
      showLogger: false,
      userActions: []
    }
  },
  computed: {
    filteredUsers() {
      if (!this.searchText) {
        return this.users
      }
      
      const searchLower = this.searchText.toLowerCase()
      return this.users.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        this.getRoleText(user.role).toLowerCase().includes(searchLower)
      )
    }
  },
  created() {
    this.fetchUsers()
    console.log('管理员用户页面已加载')
  },
  methods: {
    async fetchUsers() {
      this.loading = true
      try {
        const response = await apiService.user.getAllUsers()
        this.users = response.data.sort((a, b) => a.name.localeCompare(b.name))
        console.log(`获取到 ${this.users.length} 个用户`)
      } catch (error) {
        console.error('获取用户列表失败:', error)
        showFailToast('获取用户列表失败')
      } finally {
        this.loading = false
      }
    },
    
    getRoleText(role) {
      const roleMap = {
        'USER': '普通用户',
        'ADMIN': '管理员'
      }
      return roleMap[role] || '未知角色'
    },
    
    onSearch() {
      console.log(`搜索用户: ${this.searchText}`)
    },
    
    onClearSearch() {
      this.searchText = ''
      console.log('清除搜索')
    },
    
    showUserActions(user) {
      this.currentUser = user
      
      // 根据用户类型和当前用户设置可用操作
      this.userActions = []
      
      // 查看操作对所有用户都可用
      this.userActions.push({ name: '查看详情', value: 'view' })
      
      // 不能修改自己的角色
      const currentUserId = auth.state.user?.id
      if (user.id !== currentUserId) {
        // 升级/降级管理员权限
        if (user.role === 'ADMIN') {
          this.userActions.push({ name: '移除管理员权限', value: 'demote' })
        } else {
          this.userActions.push({ name: '授予管理员权限', value: 'promote' })
        }
        
        // 重置密码
        this.userActions.push({ name: '重置密码', value: 'reset-password' })
        
        // 禁用/启用账户
        this.userActions.push({ 
          name: '禁用账户', 
          value: 'disable',
          color: '#ee0a24'
        })
      }
      
      // 显示日志操作
      this.userActions.push({ name: '查看操作日志', value: 'view-logs' })
      
      this.showActions = true
    },
    
    onSelectAction(action) {
      if (!this.currentUser) return
      
      console.log(`选择操作: ${action.value} 用户: ${this.currentUser.name}`)
      
      switch (action.value) {
        case 'view':
          this.viewUserDetail()
          break
        case 'promote':
          this.changeUserRole(true)
          break
        case 'demote':
          this.changeUserRole(false)
          break
        case 'reset-password':
          this.resetUserPassword()
          break
        case 'disable':
          this.disableUser()
          break
        case 'view-logs':
          this.viewUserLogs()
          break
      }
    },
    
    viewUserDetail() {
      showSuccessToast(`查看用户: ${this.currentUser.name}`)
      // 这里可以实现查看用户详情的逻辑，例如导航到用户详情页
    },
    
    async changeUserRole(isPromote) {
      try {
        const confirmMessage = isPromote 
          ? `确定要将 ${this.currentUser.name} 设为管理员吗？` 
          : `确定要移除 ${this.currentUser.name} 的管理员权限吗？`
        
        const result = await showConfirmDialog({
          title: '确认操作',
          message: confirmMessage
        })
        
        if (result) {
          // 这里可以实现修改用户角色的API调用
          // const response = await apiService.admin.changeUserRole(this.currentUser.id, isPromote ? 'ADMIN' : 'USER')
          
          // 模拟API响应
          setTimeout(() => {
            this.users.find(u => u.id === this.currentUser.id).role = isPromote ? 'ADMIN' : 'USER'
            showSuccessToast(`用户角色已${isPromote ? '升级为管理员' : '降级为普通用户'}`)
            console.log(`用户 ${this.currentUser.name} 角色已修改为 ${isPromote ? 'ADMIN' : 'USER'}`)
          }, 500)
        }
      } catch (error) {
        console.error('修改用户角色失败:', error)
      }
    },
    
    async resetUserPassword() {
      try {
        const result = await showConfirmDialog({
          title: '确认操作',
          message: `确定要重置 ${this.currentUser.name} 的密码吗？`
        })
        
        if (result) {
          // 这里可以实现重置密码的API调用
          // const response = await apiService.admin.resetUserPassword(this.currentUser.id)
          
          // 模拟API响应
          setTimeout(() => {
            showSuccessToast('密码已重置并发送到用户邮箱')
            console.log(`用户 ${this.currentUser.name} 的密码已重置`)
          }, 500)
        }
      } catch (error) {
        console.error('重置密码失败:', error)
      }
    },
    
    async disableUser() {
      try {
        const result = await showConfirmDialog({
          title: '确认操作',
          message: `确定要禁用 ${this.currentUser.name} 的账户吗？此操作可能会导致用户无法登录。`
        })
        
        if (result) {
          // 这里可以实现禁用账户的API调用
          // const response = await apiService.admin.disableUser(this.currentUser.id)
          
          // 模拟API响应
          setTimeout(() => {
            showSuccessToast('用户账户已禁用')
            console.log(`用户 ${this.currentUser.name} 的账户已禁用`)
          }, 500)
        }
      } catch (error) {
        console.error('禁用账户失败:', error)
      }
    },
    
    viewUserLogs() {
      this.showLogger = !this.showLogger
      console.log(`${this.showLogger ? '显示' : '隐藏'}用户操作日志`)
      
      if (this.showLogger) {
        console.log(`查看用户 ${this.currentUser.name} 的操作日志`)
        console.log('加载用户操作日志...')
        
        // 模拟加载用户日志
        setTimeout(() => {
          console.info('用户登录 - 2023-05-10 14:30:22')
          console.log('查看需求列表 - 2023-05-10 14:35:10')
          console.log('查看结果列表 - 2023-05-10 14:40:05')
          console.warn('密码修改失败 - 2023-05-10 15:20:45')
          console.info('用户登出 - 2023-05-10 16:15:30')
        }, 1000)
      }
    }
  }
}
</script>

<style scoped>
.page-content {
  padding-top: 56px;
  padding-bottom: 50px;
}

.loading-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
}

.search-bar {
  margin-bottom: 10px;
}

.user-status {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #07c160;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #07c160;
  margin-right: 4px;
}

.status-active .status-dot {
  background-color: #07c160;
}

.status-inactive .status-dot {
  background-color: #ee0a24;
}

.status-active {
  color: #07c160;
}

.status-inactive {
  color: #ee0a24;
}
</style>