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

// 导入生物识别功能（在真实环境中需要安装@capacitor/biometrics包）
// 在开发环境中，我们模拟这个功能
const BiometricsSimulation = {
  isAvailable: async () => {
    // 这里模拟检查设备是否支持生物识别
    // 在真实环境中，这会实际检查设备的硬件支持
    return { has: true, types: ['faceId'] };
  },
  authenticate: async () => {
    // 模拟生物识别验证过程
    // 在真实环境中，这会调用设备的原生生物识别API
    return new Promise((resolve, reject) => {
      // 模拟用户确认对话框
      if (confirm('模拟Face ID验证。要模拟成功验证吗？')) {
        resolve({ verified: true });
      } else {
        reject(new Error('用户取消了生物识别验证'));
      }
    });
  }
};

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
    
    // 检查生物识别可用性
    const checkBiometricAvailability = async () => {
      try {
        // 在真实环境中使用：const { has, types } = await Biometrics.isAvailable();
        const { has, types } = await BiometricsSimulation.isAvailable();
        return { has, types };
      } catch (error) {
        console.error('生物识别验证不可用:', error);
        return { has: false, types: [] };
      }
    };
    
    // 使用生物识别登录
    const loginWithBiometrics = async () => {
      loading.value = true;
      try {
        // 在真实环境中使用：
        // const result = await Biometrics.authenticate({
        //   reason: "登录到生命树应用",
        //   title: "生物识别验证",
        // });
        const result = await BiometricsSimulation.authenticate({
          reason: "登录到生命树应用",
          title: "生物识别验证",
        });
        
        if (result.verified) {
          // 获取存储的用户凭据
          const storedEmail = localStorage.getItem('biometricEmail');
          const storedToken = localStorage.getItem('biometricToken');
          const storedUser = localStorage.getItem('biometricUser');
          
          if (storedEmail && storedToken && storedUser) {
            // 设置用户数据，无需密码
            localStorage.setItem('user', storedUser);
            localStorage.setItem('token', storedToken);
            
            // 更新认证状态
            auth.state.user = JSON.parse(storedUser);
            auth.state.token = storedToken;
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
            // 尚未存储凭据，提示用户需要先登录一次
            showToast({
              message: '请先使用账号密码登录一次以启用生物识别登录',
              type: 'info'
            });
          }
        }
      } catch (error) {
        console.error('生物识别验证错误:', error);
        showFailToast('生物识别验证失败，请使用账号密码登录');
      } finally {
        loading.value = false;
      }
    };
    
    // 组件挂载时检查生物识别是否可用
    onMounted(async () => {
      const { has } = await checkBiometricAvailability();
      // 只有当设备支持生物识别且有存储的令牌时才显示生物识别登录选项
      biometricsAvailable.value = has && localStorage.getItem('biometricToken');
    });
    
    const onSubmit = async (values) => {
      loading.value = true;
      try {
        await auth.login({
          email: values.email,
          password: values.password
        });
        
        // 保存用户凭据用于生物识别登录
        localStorage.setItem('biometricEmail', values.email);
        localStorage.setItem('biometricToken', localStorage.getItem('token'));
        localStorage.setItem('biometricUser', localStorage.getItem('user'));
        
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