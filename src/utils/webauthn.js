// WebAuthn 辅助类实现
// 提供浏览器环境中使用 WebAuthn API 的方法

/**
 * 检查浏览器是否支持 WebAuthn
 * @returns {boolean} 是否支持 WebAuthn
 */
function isWebAuthnSupported() {
  return window.PublicKeyCredential !== undefined &&
         typeof window.PublicKeyCredential === 'function';
}

/**
 * 检查设备是否支持生物识别
 * @returns {Promise<boolean>} 是否支持生物识别
 */
async function isBiometricAvailable() {
  if (!isWebAuthnSupported()) {
    console.log('此浏览器不支持 WebAuthn');
    return false;
  }
  
  // 检查是否支持特定的认证器类型（例如生物识别）
  if (window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
    const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    console.log('生物识别认证器可用性:', available);
    return available;
  }
  
  return false;
}

/**
 * 将 Base64 URL 字符串转换为 ArrayBuffer
 * @param {string} base64url Base64 URL 编码的字符串
 * @returns {ArrayBuffer} 转换后的 ArrayBuffer
 */
function base64UrlToArrayBuffer(base64url) {
  // 将 Base64 URL 编码转换为 Base64 编码
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  // 添加可能缺少的填充
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const base64Padded = base64 + padding;
  
  // 将 Base64 转换为二进制字符串
  const binary = atob(base64Padded);
  
  // 将二进制字符串转换为 ArrayBuffer
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  
  return buffer;
}

/**
 * 将 ArrayBuffer 转换为 Base64 URL 字符串
 * @param {ArrayBuffer} buffer 要转换的 ArrayBuffer
 * @returns {string} Base64 URL 编码的字符串
 */
function arrayBufferToBase64Url(buffer) {
  // 将 ArrayBuffer 转换为二进制字符串
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  // 将二进制字符串转换为 Base64
  const base64 = btoa(binary);
  
  // 将 Base64 转换为 Base64 URL
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * 创建凭据（注册）
 * @param {Object} options 注册选项
 * @returns {Promise<Object>} 注册结果
 */
async function register(options) {
  if (!isWebAuthnSupported()) {
    throw new Error('此浏览器不支持 WebAuthn');
  }
  
  try {
    // 转换选项中的二进制数据
    const publicKey = {
      ...options,
      challenge: base64UrlToArrayBuffer(options.challenge),
      user: {
        ...options.user,
        id: new TextEncoder().encode(options.user.id)
      },
      excludeCredentials: options.excludeCredentials ? 
        options.excludeCredentials.map(cred => ({
          ...cred,
          id: base64UrlToArrayBuffer(cred.id)
        })) : 
        []
    };
    
    // 调用浏览器的 WebAuthn API 创建凭据
    const credential = await navigator.credentials.create({ publicKey });
    
    // 处理返回的凭据数据
    return {
      id: credential.id,
      rawId: arrayBufferToBase64Url(credential.rawId),
      type: credential.type,
      response: {
        attestationObject: arrayBufferToBase64Url(credential.response.attestationObject),
        clientDataJSON: arrayBufferToBase64Url(credential.response.clientDataJSON)
      },
      clientExtensionResults: credential.getClientExtensionResults()
    };
  } catch (error) {
    console.error('WebAuthn 注册失败:', error);
    throw error;
  }
}

/**
 * 验证凭据（登录）
 * @param {Object} options 认证选项
 * @returns {Promise<Object>} 认证结果
 */
async function authenticate(options) {
  if (!isWebAuthnSupported()) {
    throw new Error('此浏览器不支持 WebAuthn');
  }
  
  try {
    // 转换选项中的二进制数据
    const publicKey = {
      ...options,
      challenge: base64UrlToArrayBuffer(options.challenge),
      allowCredentials: options.allowCredentials ? 
        options.allowCredentials.map(cred => ({
          ...cred,
          id: base64UrlToArrayBuffer(cred.id)
        })) : 
        []
    };
    
    // 调用浏览器的 WebAuthn API 获取凭据
    const credential = await navigator.credentials.get({ publicKey });
    
    // 处理返回的断言数据
    const authData = {
      id: credential.id,
      rawId: arrayBufferToBase64Url(credential.rawId),
      type: credential.type,
      response: {
        authenticatorData: arrayBufferToBase64Url(credential.response.authenticatorData),
        clientDataJSON: arrayBufferToBase64Url(credential.response.clientDataJSON),
        signature: arrayBufferToBase64Url(credential.response.signature),
        userHandle: credential.response.userHandle ? 
          arrayBufferToBase64Url(credential.response.userHandle) : 
          null
      },
      clientExtensionResults: credential.getClientExtensionResults()
    };
    
    return authData;
  } catch (error) {
    console.error('WebAuthn 认证失败:', error);
    throw error;
  }
}

// 导出的 WebAuthn 接口
export const WebAuthnHelper = {
  isSupported: isWebAuthnSupported,
  isBiometricAvailable,
  register,
  authenticate
};

// 默认导出
export default WebAuthnHelper;