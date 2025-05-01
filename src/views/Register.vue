<template>
    <div class="page">
      <header-bar :title="'注册'" />
      
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
              v-model="name"
              name="name"
              label="用户名"
              placeholder="请输入用户名"
              :rules="[{ required: true, message: '请填写用户名' }]"
            />
            <van-field
              v-model="password"
              type="password"
              name="password"
              label="密码"
              placeholder="请输入密码"
              :rules="[{ required: true, message: '请填写密码' }, { pattern: passwordPattern, message: '密码至少6位，包含字母和数字' }]"
            />
            <van-field
              v-model="confirmPassword"
              type="password"
              name="confirmPassword"
              label="确认密码"
              placeholder="请再次输入密码"
              :rules="[
                { required: true, message: '请再次输入密码' },
                { validator: validatePasswordConfirmation, message: '两次输入的密码不一致' }
              ]"
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
              注册
            </van-button>
          </div>
        </van-form>
        
        <div class="form-footer">
          <p>已有账号？ <router-link to="/login">立即登录</router-link></p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import HeaderBar from '@/components/HeaderBar.vue';
  import { showToast, showFailToast } from 'vant';
  import auth from '@/store/auth';
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  export default {
    name: 'RegisterPage',
    components: {
      HeaderBar
    },
    setup() {
      const router = useRouter();
      const email = ref('');
      const name = ref('');
      const password = ref('');
      const confirmPassword = ref('');
      const loading = ref(false);
      
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
      
      // 验证两次密码输入是否一致
      const validatePasswordConfirmation = (val) => {
        return val === password.value;
      };
      
      const onSubmit = async (values) => {
        loading.value = true;
        try {
          // 调用注册API
          await auth.register({
            email: values.email,
            name: values.name,
            password: values.password
          });
          
          // 注册成功提示
          showToast({
            message: '注册成功，请登录',
            type: 'success'
          });
          
          // 跳转到登录页面
          setTimeout(() => {
            router.push('/login');
          }, 1000);
        } catch (error) {
          // 注册失败提示
          const errorMsg = error.response?.data?.error || '注册失败，请重试';
          showFailToast(errorMsg);
        } finally {
          loading.value = false;
        }
      };
      
      return {
        email,
        name,
        password,
        confirmPassword,
        loading,
        emailPattern,
        passwordPattern,
        validatePasswordConfirmation,
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