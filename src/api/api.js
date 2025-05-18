// src/api/api.js - 更新API服务以支持协议功能

import axios from 'axios';

// 创建axios实例
const api = axios.create({
  // baseURL: 'http://192.168.31.123:8081/api', // 根据你的API服务器地址进行修改
  baseURL: 'https://api.u252116.nyat.app:44058/api', // 根据你的API服务器地址进行修改
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 从localStorage中获取token
    const token = localStorage.getItem('token');
    // 如果token存在则在请求头中添加token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401: // 未授权
          // 清除token并跳转到登录页面
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          location.reload();
          break;
        case 403: // 禁止访问
          console.error('没有权限访问该资源');
          break;
        case 404: // 资源不存在
          console.error('请求的资源不存在');
          break;
        case 500: // 服务器错误
          console.error('服务器错误');
          break;
        default:
          console.error('未知错误');
      }
    }
    return Promise.reject(error);
  }
);

// API服务封装
const apiService = {
  // 用户相关API
  auth: {
    // 用户注册
    register: (userData) => {
      return api.post('/auth/register', userData);
    },
    // 用户登录
    login: (credentials) => {
      return api.post('/auth/login', credentials);
    }
  },
  
  // 用户信息相关API
  user: {
    // 获取当前用户信息
    getCurrentUser: () => {
      return api.get('/users/me');
    },
    // 更新用户信息
    updateUser: (userData) => {
      return api.put('/users/me', userData);
    },
    // 获取所有用户（管理员权限）
    getAllUsers: () => {
      return api.get('/admin/users');
    }
  },
  
  // 需求相关API
  requirements: {
    // 获取所有需求
    getAll: () => {
      return api.get('/requirements');
    },
    // 获取单个需求详情
    getById: (id) => {
      return api.get(`/requirements/${id}`);
    },
    // 创建新需求
    create: (requirementData) => {
      return api.post('/requirements', requirementData);
    },
    // 更新需求
    update: (id, requirementData) => {
      return api.put(`/requirements/${id}`, requirementData);
    },
    // 更新需求协议 - 更新以支持按钮文本
    updateAgreement: (id, agreement, agreementButtonText = null) => {
      return api.put(`/requirements/${id}/agreement`, { 
        agreement,
        agreementButtonText
      });
    },
    // 删除需求
    delete: (id) => {
      return api.delete(`/requirements/${id}`);
    },
    // 获取我的需求（作为创建者，带有申请信息）
    getMyRequirementsWithApplications: () => {
      return api.get('/requirements/my-requirements');
    },
    // 获取我申请的需求
    getMyApplications: () => {
      return api.get('/requirements/my-applications');
    },
    // 获取指定需求的所有申请
    getApplicationsByRequirement: (id) => {
      return api.get(`/requirements/${id}/applications`);
    },
    // 接受需求（申请接受）
    acceptRequirement: (id) => {
      return api.post(`/requirements/${id}/accept`);
    },
    // 同意申请
    approveApplication: (id, applicationId) => {
      return api.post(`/requirements/${id}/applications/${applicationId}/approve`);
    },
    // 拒绝申请
    rejectApplication: (id, applicationId) => {
      return api.post(`/requirements/${id}/applications/${applicationId}/reject`);
    }
  },
  
  // 结果相关API (未变更，保留原有代码)
  results: {
    // 获取所有结果
    getAll: () => {
      return api.get('/results');
    },
    // 获取单个结果详情
    getById: (id) => {
      return api.get(`/results/${id}`);
    },
    // 获取用户的所有结果
    getByUser: (userId) => {
      return api.get(`/results/user/${userId}`);
    },
    // 获取与需求相关的所有结果
    getByRequirement: (requirementId) => {
      return api.get(`/results/requirement/${requirementId}`);
    },
    // 创建新结果
    create: (resultData) => {
      return api.post('/results', resultData);
    },
    // 更新结果
    update: (id, resultData) => {
      return api.put(`/results/${id}`, resultData);
    },
    // 删除结果
    delete: (id) => {
      return api.delete(`/results/${id}`);
    }
  }
};

export default apiService;