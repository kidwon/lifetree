// Login.vue - 完整代码，支持生物识别登录
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
      
      <!-- 生物识别登录按钮 -->
      <div v-if="biometricsAvailable" class="biometric-login">
        <van-button
          round
          block
          type="default"
          @click="loginWithBiometrics"
          :disabled="loading"
        >
          <template #icon>
            <van-icon name="scan" size="20" />
          </template>
          使用生物识别登录
        </van-button>
      </div>
      
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
import { ref, onMounted } from 'vue';
import apiService from '@/api/api';

export default {
  name: 'LoginPage',
  components: {
    HeaderBar
  },
  setup() {
    const email = ref('');
    const password = ref('');
    const loading = ref(false);
    const biometricsAvailable = ref(false);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // 检查平台是否支持生物识别
    const isPlatformSupported = () => {
      return typeof window !== 'undefined' && 
             window.Capacitor && 
             window.Capacitor.isNativePlatform();
    };
    
    // 检查生物识别是否可用
    const checkBiometricAvailability = async () => {
      try {
        if (!isPlatformSupported()) {
          console.log('非原生环境，生物识别不可用');
          return false;
        }
        
        const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
        
        // 首先检查设备是否支持生物识别
        const result = await NativeBiometric.isAvailable();
        console.log('生物识别可用性检查结果:', result);
        
        if (!result.isAvailable) {
          console.log('设备不支持生物识别');
          return false;
        }
        
        // 然后检查是否有存储的凭据
        try {
          const credentials = await NativeBiometric.getCredentials({
            server: "lifetree-app",
          });
          console.log('生物识别凭据检查:', credentials ? '找到凭据' : '未找到凭据');
          return Boolean(credentials && credentials.username && credentials.password);
        } catch (credError) {
          console.error('获取生物识别凭据失败:', credError);
          return false;
        }
      } catch (error) {
        console.error('检查生物识别可用性失败:', error);
        return false;
      }
    };
    
    // 使用生物识别登录
    const loginWithBiometrics = async () => {
      loading.value = true;
      try {
        if (!isPlatformSupported()) {
          throw new Error('非原生环境，无法使用生物识别');
        }
        
        // 导入插件
        const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
        
        // 检查生物识别是否可用
        const available = await NativeBiometric.isAvailable();
        console.log('生物识别可用性检查:', available);
        
        if (!available.isAvailable) {
          throw new Error('设备不支持生物识别');
        }
        
        // 验证用户生物识别
        console.log('开始生物识别验证...');
        await NativeBiometric.verifyIdentity({
          reason: "登录到生命树应用",
          title: "生物识别验证",
          subtitle: "请使用Face ID进行验证",
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
          throw new Error('未找到有效的生物识别凭据');
        }
        
        // 使用获取到的凭据进行常规登录
        console.log('使用凭据尝试登录...');
        
        // 直接调用登录API
        const loginResponse = await apiService.auth.login({
          email: credentials.username,
          password: credentials.password
        });
        
        if (loginResponse && loginResponse.data) {
          const { user, token } = loginResponse.data;
          
          // 保存用户信息和令牌
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token', token);
          
          // 更新认证状态
          auth.state.user = user;
          auth.state.token = token;
          auth.state.isAuthenticated = true;
          
          showToast({
            message: '生物识别登录成功',
            type: 'success'
          });
          
          // 导航到主页或重定向路径
          const redirectPath = sessionStorage.getItem('redirectPath') || '/';
          sessionStorage.removeItem('redirectPath');
          setTimeout(() => {
            window.location.href = redirectPath;
          }, 1000);
        } else {
          throw new Error('登录响应无效');
        }
      } catch (error) {
        console.error('生物识别登录详细错误:', error);
        showFailToast('生物识别登录失败: ' + (error.message || '请使用账号密码登录'));
        // 清空密码字段以防止错误登录尝试
        password.value = '';
      } finally {
        loading.value = false;
      }
    };
    
    // 常规登录
    const onSubmit = async (values) => {
      loading.value = true;
      try {
        console.log('开始常规登录...');
        
        // 直接调用API登录
        const response = await apiService.auth.login({
          email: values.email,
          password: values.password
        });
        
        console.log('登录响应:', response ? '成功' : '失败');
        
        if (!response || !response.data) {
          throw new Error('登录响应无效');
        }
        
        const { user, token } = response.data;
        
        // 保存用户信息和令牌
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        
        // 更新认证状态
        auth.state.user = user;
        auth.state.token = token;
        auth.state.isAuthenticated = true;
        
        // 尝试保存生物识别凭据
        try {
          if (isPlatformSupported()) {
            const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
            console.log('尝试保存生物识别凭据...');
            await NativeBiometric.setCredentials({
              username: values.email,
              password: values.password,
              server: "lifetree-app"
            });
            console.log('生物识别凭据保存成功');
            
            // 更新生物识别可用状态
            biometricsAvailable.value = true;
          }
        } catch (error) {
          console.error('保存生物识别凭据失败:', error);
          // 继续处理，不影响登录过程
        }
        
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
        console.error('登录失败详细错误:', error);
        // 登录失败提示
        const errorMsg = error.response?.data?.error || '登录失败，请检查您的凭据';
        showFailToast(errorMsg);
      } finally {
        loading.value = false;
      }
    };
    
    // 测试API连接
    const testApiConnection = async () => {
      try {
        // 调用一个简单的API端点，如健康检查
        const response = await fetch(apiService.baseURL + '/health');
        console.log('API连接测试结果:', response.status);
        if (response.ok) {
          console.log('API连接成功');
        } else {
          console.log('API连接失败');
        }
      } catch (error) {
        console.error('API连接测试错误:', error);
      }
    };
    
    // 组件挂载时的初始化
    onMounted(async () => {
      console.log('Login组件已挂载');
      console.log('检查平台:', isPlatformSupported() ? '原生平台' : '浏览器');
      
      // 测试API连接
      await testApiConnection();
      
      // 检查生物识别是否可用
      const isAvailable = await checkBiometricAvailability();
      console.log('生物识别可用性:', isAvailable);
      biometricsAvailable.value = isAvailable;
    });
    
    return {
      email,
      password,
      loading,
      emailPattern,
      biometricsAvailable,
      onSubmit,
      loginWithBiometrics
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

/* 生物识别登录按钮样式 */
.biometric-login {
  margin: 8px 16px 16px;
}

.biometric-login .van-button {
  background-color: #f5f5f5;
  color: #323233;
  border: none;
}

.biometric-login .van-button:active {
  background-color: #e8e8e8;
}

.biometric-login .van-icon {
  margin-right: 4px;
  vertical-align: middle;
}
</style>