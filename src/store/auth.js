// src/store/auth.js

import { reactive } from 'vue';
import apiService from '../api/api';

// 从本地存储中获取用户信息和令牌
const getStoredUser = () => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
};

const getStoredToken = () => {
  return localStorage.getItem('token');
};

// 创建可响应式的认证状态
const authState = reactive({
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),
  error: null,
  loading: false
});

// 认证相关方法
const authMethods = {
  // 注册用户
  async register(userData) {
    authState.loading = true;
    authState.error = null;
    
    try {
      const response = await apiService.auth.register(userData);
      return response.data;
    } catch (error) {
      authState.error = error.response?.data?.error || '注册失败，请重试';
      throw error;
    } finally {
      authState.loading = false;
    }
  },
  
  // 用户登录
  async login(credentials) {
    authState.loading = true;
    authState.error = null;
    
    try {
      const response = await apiService.auth.login(credentials);
      const { user, token } = response.data;
      
      // 保存用户信息和令牌到本地存储
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      // 更新状态
      authState.user = user;
      authState.token = token;
      authState.isAuthenticated = true;
      
      return user;
    } catch (error) {
      authState.error = error.response?.data?.error || '登录失败，请检查您的凭据';
      throw error;
    } finally {
      authState.loading = false;
    }
  },
  
  // 用户注销
  logout() {
    // 清除本地存储
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // 重置状态
    authState.user = null;
    authState.token = null;
    authState.isAuthenticated = false;
  },
  
  // 获取当前用户信息
  async getCurrentUser() {
    if (!authState.token) {
      return null;
    }
    
    authState.loading = true;
    
    try {
      const response = await apiService.user.getCurrentUser();
      const currentUser = response.data;
      
      // 更新存储的用户信息
      localStorage.setItem('user', JSON.stringify(currentUser));
      authState.user = currentUser;
      
      return currentUser;
    } catch (error) {
      // 如果获取当前用户失败，可能是令牌已过期，则注销
      if (error.response && error.response.status === 401) {
        authMethods.logout();
      }
      return null;
    } finally {
      authState.loading = false;
    }
  },
  
  // 更新用户信息
  async updateUser(userData) {
    if (!authState.isAuthenticated) {
      return null;
    }
    
    authState.loading = true;
    
    try {
      const response = await apiService.user.updateUser(userData);
      const updatedUser = response.data;
      
      // 更新存储的用户信息
      localStorage.setItem('user', JSON.stringify(updatedUser));
      authState.user = updatedUser;
      
      return updatedUser;
    } catch (error) {
      authState.error = error.response?.data?.error || '更新用户信息失败';
      throw error;
    } finally {
      authState.loading = false;
    }
  }
};

// 导出认证状态和方法
export default {
  state: authState,
  ...authMethods
};