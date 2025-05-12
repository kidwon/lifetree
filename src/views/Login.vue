<template>
  <div class="page">
    <header-bar :title="'登录'" :show-back="false" />

    <div class="page-content">
      <div class="logo-container">
        <h2 class="small-seal-font">生命树</h2>
      </div>

      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field v-model="email" name="email" label="邮箱" placeholder="请输入邮箱"
            :rules="[{ required: true, message: '请填写邮箱' }, { pattern: emailPattern, message: '请输入有效的邮箱地址' }]" />
          <van-field v-model="password" type="password" name="password" label="密码" placeholder="请输入密码"
            :rules="[{ required: true, message: '请填写密码' }]" />
        </van-cell-group>

        <div style="margin: 16px;">
          <van-button round block type="primary" native-type="submit" :loading="loading" :disabled="loading">
            登录
          </van-button>
        </div>
      </van-form>

      <!-- 生物识别登录按钮 -->
      <div v-if="biometricsAvailable" class="biometric-login">
        <van-button round block type="default" @click="loginWithBiometrics" :loading="biometricLoading"
          :disabled="loading || biometricLoading">
          <template #icon>
            <van-icon name="scan" size="20" />
          </template>
          使用生物识别登录 ({{ biometricType }})
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
import { WebAuthnHelper } from '@/utils/webauthn';

export default {
  name: 'LoginPage',
  components: {
    HeaderBar
  },
  setup() {
    const email = ref('');
    const password = ref('');
    const loading = ref(false);
    const biometricLoading = ref(false);
    const biometricsAvailable = ref(false);
    const biometricType = ref('');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 检查生物识别是否可用
    const checkBiometricAvailability = async () => {
      try {
        console.log('检查生物识别可用性...');

        // 首先检查传统的 Capacitor 方式（原生环境）
        if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform()) {
          console.log('检测到原生环境，使用 NativeBiometric');
          try {
            const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
            const result = await NativeBiometric.isAvailable();

            if (result.isAvailable) {
              try {
                const credentials = await NativeBiometric.getCredentials({
                  server: "lifetree-app",
                });

                if (credentials && credentials.username && credentials.password) {
                  console.log('Native生物识别可用');
                  biometricsAvailable.value = true;
                  biometricType.value = 'Native';
                  return true;
                }
              } catch (e) {
                console.log('Native生物识别凭据不存在');
              }
            }
          } catch (e) {
            console.log('Native生物识别不可用:', e.message);
          }
        } else {
          console.log('非原生环境，检查WebAuthn');
        }

        // 然后检查 WebAuthn 方式（浏览器环境）
        try {
          const isAvailable = await WebAuthnHelper.isBiometricAvailable();
          console.log('WebAuthn生物识别可用性:', isAvailable);

          if (isAvailable) {
            console.log('WebAuthn生物识别可用');
            biometricsAvailable.value = true;
            biometricType.value = 'WebAuthn';
            return true;
          }
        } catch (e) {
          console.log('WebAuthn生物识别不可用:', e.message);
        }

        console.log('没有可用的生物识别方式');
        return false;
      } catch (error) {
        console.error('检查生物识别可用性失败:', error);
        return false;
      }
    };

    // 使用生物识别登录
    const loginWithBiometrics = async () => {
      biometricLoading.value = true;

      try {
        // 检查环境并选择合适的生物识别方法
        if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform()) {
          // 原生环境使用 Capacitor 插件
          await loginWithNativeBiometrics();
        } else {
          // 浏览器环境使用 WebAuthn
          await loginWithWebAuthn();
        }
      } catch (error) {
        console.error('生物识别登录失败:', error);
        showFailToast('生物识别登录失败: ' + (error.message || '请使用账号密码登录'));
      } finally {
        biometricLoading.value = false;
      }
    };

    // 使用 Capacitor 的原生生物识别登录
    const loginWithNativeBiometrics = async () => {
      const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');

      // 验证用户生物识别
      await NativeBiometric.verifyIdentity({
        reason: "登录到生命树应用",
        title: "生物识别验证",
        subtitle: "请使用Face ID进行验证",
        description: "这将允许您快速安全地登录"
      });

      // 获取存储的凭据
      const credentials = await NativeBiometric.getCredentials({
        server: "lifetree-app",
      });

      if (!credentials || !credentials.username || !credentials.password) {
        throw new Error('未找到有效的生物识别凭据');
      }

      // 使用获取到的凭据进行登录
      await performLogin(credentials.username, credentials.password);
    };
    // 使用 WebAuthn 进行登录 - 增强版
    const loginWithWebAuthn = async () => {
      biometricLoading.value = true;

      try {
        console.log('开始 WebAuthn 登录流程...');
        console.log('当前文档URL:', window.location.href);
        console.log('当前文档域名:', document.domain);

        // 1. 请求认证选项
        try {
          console.log('请求认证选项...');
          const optionsResponse = await apiService.auth.webAuthnAuthOptions({
            username: email.value || null // 可以提供用户名来限制可用的凭据
          });

          if (!optionsResponse || !optionsResponse.data) {
            throw new Error('获取认证选项失败');
          }

          const options = optionsResponse.data;
          console.log('收到认证选项:', JSON.stringify(options));

          // 2. 使用 WebAuthn 进行认证
          console.log('调用 WebAuthnHelper.authenticate...');

          // 不再覆盖服务器返回的 rpId
          const authenticateOptions = {
            challenge: options.challenge,
            rpId: options.rpId, // 使用服务器返回的 rpId
            timeout: options.timeout || 60000,
            userVerification: options.userVerification || 'preferred',
            allowCredentials: options.allowCredentials || []
          };

          console.log('认证选项:', JSON.stringify(authenticateOptions));

          const assertion = await WebAuthnHelper.authenticate(authenticateOptions);
          console.log('生物识别验证成功，提交断言:', JSON.stringify(assertion));

          // 3. 将断言发送到服务器进行验证
          const response = await apiService.auth.webAuthnLogin(assertion);

          if (!response || !response.data) {
            throw new Error('验证断言失败');
          }

          const { user, token } = response.data;

          // 4. 保存用户信息和令牌
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token', token);

          // 5. 更新认证状态
          auth.state.user = user;
          auth.state.token = token;
          auth.state.isAuthenticated = true;

          showToast({
            message: 'WebAuthn登录成功',
            type: 'success'
          });

          // 6. 导航到主页或重定向路径
          const redirectPath = sessionStorage.getItem('redirectPath') || '/';
          sessionStorage.removeItem('redirectPath');
          setTimeout(() => {
            window.location.href = redirectPath;
          }, 1000);
        } catch (apiError) {
          console.error('API请求错误:', apiError);
          throw apiError;
        }
      } catch (error) {
        console.error('WebAuthn登录失败:', error);

        // 提供更友好的错误消息
        let errorMessage = '请使用账号密码登录';

        if (error.message && error.message.includes('domain')) {
          errorMessage = '域名验证失败，请确保使用有效域名访问';
        } else if (error.message && error.message.includes('安全')) {
          errorMessage = '安全错误：请确保使用HTTPS访问';
        } else if (error.message) {
          errorMessage = error.message;
        }

        showFailToast('生物识别登录失败: ' + errorMessage);

        // 如果是特定错误，提供更多指导
        if (error.debugInfo && !error.debugInfo.isSecureContext) {
          console.warn('当前页面不在安全上下文中，WebAuthn需要HTTPS或localhost');
        }
      } finally {
        biometricLoading.value = false;
      }
    };


    // 执行登录流程
    const performLogin = async (email, password) => {
      try {
        const response = await apiService.auth.login({
          email,
          password
        });

        if (response && response.data) {
          const { user, token } = response.data;

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

          return true;
        } else {
          throw new Error('登录响应无效');
        }
      } catch (error) {
        console.error('登录失败:', error);
        throw error;
      }
    };

    // 常规登录
    const onSubmit = async (values) => {
      loading.value = true;

      try {
        // 直接调用API登录
        const response = await apiService.auth.login({
          email: values.email,
          password: values.password
        });

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
          // 检查环境并选择合适的保存方法
          if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform()) {
            // 原生环境使用 Capacitor 插件
            const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
            await NativeBiometric.setCredentials({
              username: values.email,
              password: values.password,
              server: "lifetree-app"
            });
            console.log('Native生物识别凭据保存成功');
          } else if (await WebAuthnHelper.isSupported()) {
            // 浏览器环境尝试注册 WebAuthn
            try {
              await WebAuthnHelper.register(user.id, user.email);
              console.log('WebAuthn生物识别凭据注册成功');
            } catch (e) {
              console.log('WebAuthn注册跳过或失败:', e.message);
            }
          }

          // 更新生物识别可用状态
          biometricsAvailable.value = true;
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

    // 组件挂载时的初始化
    onMounted(async () => {
      console.log('Login组件已挂载');

      // 检查生物识别是否可用
      await checkBiometricAvailability();
    });

    return {
      email,
      password,
      loading,
      biometricLoading,
      emailPattern,
      biometricsAvailable,
      biometricType,
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