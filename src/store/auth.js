// src/store/auth.js - 添加生物识别登录支持

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
  // 检查平台是否支持生物识别
  isPlatformSupported() {
    // 检查是否在原生平台运行（非浏览器环境）
    return typeof window !== 'undefined' && 
           window.Capacitor && 
           window.Capacitor.isNativePlatform();
  },
  
  // 注册用户
  async register(userData) {
    authState.loading = true;
    authState.error = null;
    
    try {
      console.log('开始注册用户...');
      const response = await apiService.auth.register(userData);
      console.log('注册响应:', response ? '成功' : '失败');
      return response.data;
    } catch (error) {
      console.error('注册失败详细错误:', error);
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
      console.log('开始登录...');
      const response = await apiService.auth.login(credentials);
      console.log('登录响应:', response ? '成功' : '失败');
      
      if (!response || !response.data) {
        throw new Error('登录响应无效');
      }
      
      const { user, token } = response.data;
      
      // 保存用户信息和令牌到本地存储
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      // 更新状态
      authState.user = user;
      authState.token = token;
      authState.isAuthenticated = true;
      
      // 保存凭据用于生物识别登录（仅在原生环境中）
      if (this.isPlatformSupported()) {
        try {
          console.log('尝试保存生物识别凭据...');
          const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
          await NativeBiometric.setCredentials({
            username: credentials.email,
            password: credentials.password,
            server: "lifetree-app"
          });
          console.log('生物识别凭据保存成功');
        } catch (error) {
          console.error('保存生物识别凭据失败:', error);
          // 继续处理，不影响登录过程
        }
      }
      
      return user;
    } catch (error) {
      console.error('登录失败详细错误:', error);
      if (error.response) {
        console.error('错误响应:', error.response.data);
      }
      authState.error = error.response?.data?.error || '登录失败，请检查您的凭据';
      throw error;
    } finally {
      authState.loading = false;
    }
  },
  
  // 生物识别登录
  async biometricLogin() {
    authState.loading = true;
    authState.error = null;
    
    try {
      if (!this.isPlatformSupported()) {
        throw new Error('非原生环境，无法使用生物识别');
      }
      
      console.log('开始生物识别登录...');
      const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
      
      // 检查生物识别是否可用
      const availability = await NativeBiometric.isAvailable();
      console.log('生物识别可用性检查:', availability);
      
      if (!availability.isAvailable) {
        throw new Error('设备不支持生物识别');
      }
      
      // 验证用户生物识别
      console.log('开始生物识别验证...');
      await NativeBiometric.verifyIdentity({
        reason: "登录到生命树应用",
        title: "生物识别验证",
        subtitle: "请使用Face ID或Touch ID进行验证",
        description: "这将允许您快速安全地登录"
      });
      console.log('生物识别验证成功');
      
      // 获取存储的凭据
      console.log('尝试获取存储的凭据...');
      const credentials = await NativeBiometric.getCredentials({
        server: "lifetree-app",
      });
      console.log('获取到凭据:', credentials ? '成功' : '失败');
      
      if (!credentials || !credentials.username || !credentials.password) {
        throw new Error('没有找到存储的生物识别凭据');
      }
      
      // 使用获取的凭据通过API登录
      console.log('使用凭据尝试登录...');
      const response = await apiService.auth.login({
        email: credentials.username,
        password: credentials.password
      });
      console.log('登录响应:', response ? '成功' : '失败');
      
      if (!response || !response.data) {
        throw new Error('登录响应无效');
      }
      
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
      console.error('生物识别登录详细错误:', error);
      authState.error = '生物识别登录失败: ' + (error.message || '未知错误');
      throw error;
    } finally {
      authState.loading = false;
    }
  },
  
  // 用户注销
  async logout() {
    console.log('执行注销...');
    
    // 清除本地存储
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // 重置状态
    authState.user = null;
    authState.token = null;
    authState.isAuthenticated = false;
    
    console.log('注销完成');
  },
  
  // 获取当前用户信息
  async getCurrentUser() {
    if (!authState.token) {
      console.log('无访问令牌，无法获取用户信息');
      return null;
    }
    
    authState.loading = true;
    
    try {
      console.log('开始获取当前用户信息...');
      const response = await apiService.user.getCurrentUser();
      console.log('获取用户信息响应:', response ? '成功' : '失败');
      
      const currentUser = response.data;
      
      // 更新存储的用户信息
      localStorage.setItem('user', JSON.stringify(currentUser));
      authState.user = currentUser;
      
      return currentUser;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 如果获取当前用户失败，可能是令牌已过期，则注销
      if (error.response && error.response.status === 401) {
        console.log('令牌已过期，执行注销');
        await this.logout();
      }
      return null;
    } finally {
      authState.loading = false;
    }
  },
  
  // 更新用户信息
  async updateUser(userData) {
    if (!authState.isAuthenticated) {
      console.log('用户未认证，无法更新用户信息');
      return null;
    }
    
    authState.loading = true;
    
    try {
      console.log('开始更新用户信息...');
      const response = await apiService.user.updateUser(userData);
      console.log('更新用户信息响应:', response ? '成功' : '失败');
      
      const updatedUser = response.data;
      
      // 更新存储的用户信息
      localStorage.setItem('user', JSON.stringify(updatedUser));
      authState.user = updatedUser;
      
      return updatedUser;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      authState.error = error.response?.data?.error || '更新用户信息失败';
      throw error;
    } finally {
      authState.loading = false;
    }
  },
  
  // 检查生物识别是否可用
  async isBiometricAvailable() {
    try {
      if (!this.isPlatformSupported()) {
        console.log('非原生环境，生物识别不可用');
        return false;
      }
      
      console.log('检查生物识别可用性...');
      const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
      const result = await NativeBiometric.isAvailable();
      console.log('生物识别可用性检查结果:', result);
      
      // 还需要检查是否有存储的凭据
      if (result.isAvailable) {
        try {
          console.log('检查存储的凭据...');
          const credentials = await NativeBiometric.getCredentials({
            server: "lifetree-app",
          });
          console.log('存储的凭据检查结果:', credentials ? '有凭据' : '无凭据');
          return Boolean(credentials && credentials.username && credentials.password);
        } catch (error) {
          console.error('获取生物识别凭据失败:', error);
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('检查生物识别可用性失败:', error);
      return false;
    }
  },
  
  // 删除生物识别凭据
  async deleteBiometricCredentials() {
    try {
      if (!this.isPlatformSupported()) {
        console.log('非原生环境，无法删除生物识别凭据');
        return false;
      }
      
      console.log('开始删除生物识别凭据...');
      const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
      await NativeBiometric.deleteCredentials({
        server: "lifetree-app",
      });
      console.log('删除生物识别凭据成功');
      return true;
    } catch (error) {
      console.error('删除生物识别凭据失败:', error);
      return false;
    }
  }
};

// 导出认证状态和方法
export default {
  state: authState,
  ...authMethods
};