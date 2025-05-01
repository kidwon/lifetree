<template>
    <div class="page">
      <header-bar :title="'登录'" :show-back="false" />
      
      <div class="page-content">
        <div class="logo-container">
          <h2 class="small-seal-font">生命树</h2>
        </div>
        
        <van-form @submit="onSubmit">
          <van-cell-group inset>
            <van-field
              v-model="email"
              name="email"
              label="邮箱"
              placeholder="请输入邮箱"
              :rules="[{ required: true, message: '请填写邮箱' }, { pattern: emailPattern, message: '请输入有效的邮箱地址' }]"
            />
            <van-field
              v-model="password"
              type="password"
              name="password"
              label="密码"
              placeholder="请输入密码"
              :rules="[{ required: true, message: '请填写密码' }]"
            />
          </van-cell-group>
          
          <div style="margin: 16px;">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              :loading="loading"
              :disabled="loading"
            >
              登录
            </van-button>
          </div>
        </van-form>
        
        <div class="form-footer">
          <p>还没有账号？ <router-link to="/register">立即注册</router-link></p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import HeaderBar from '@/components/HeaderBar.vue';
  import { showToast, showFailToast } from 'vant';
  import auth from '@/store/auth';
  import { ref } from 'vue';
  
  export default {
    name: 'LoginPage',
    components: {
      HeaderBar
    },
    setup() {
      const email = ref('');
      const password = ref('');
      const loading = ref(false);
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      const onSubmit = async (values) => {
        loading.value = true;
        try {
          await auth.login({
            email: values.email,
            password: values.password
          });
          
          // 登录成功提示
          showToast({
            message: '登录成功',
            type: 'success'
          });
          
          // 跳转到首页或之前的页面
          const redirectPath = sessionStorage.getItem('redirectPath') || '/';
          sessionStorage.removeItem('redirectPath');
          setTimeout(() => {
            window.location.href = redirectPath;
          }, 1000);
        } catch (error) {
          // 登录失败提示
          const errorMsg = error.response?.data?.error || '登录失败，请检查您的凭据';
          showFailToast(errorMsg);
        } finally {
          loading.value = false;
        }
      };
      
      return {
        email,
        password,
        loading,
        emailPattern,
        onSubmit
      };
    }
  };
  </script>
  
  <style scoped>
  .page-content {
    padding-top: 56px;
    display: flex;
    flex-direction: column;
  }
  
  .logo-container {
    display: flex;
    justify-content: center;
    margin: 30px 0;
  }
  
  .logo-container .small-seal-font {
    font-size: 32px;
    letter-spacing: 5px;
  }
  
  .form-footer {
    text-align: center;
    margin-top: 16px;
    font-size: 14px;
  }
  
  .form-footer a {
    color: #1989fa;
    text-decoration: none;
  }
  </style>