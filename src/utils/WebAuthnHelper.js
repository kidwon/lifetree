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
    console.log('开始验证凭据...');
    console.log('接收到的选项:', options);
    
    // 确保选项中包含必要的字段
    if (!options.challenge) {
      throw new Error('缺少必要的挑战值');
    }
    
    // 计算有效的 rpId
    // 1. 首选服务器返回的非空 rpId
    // 2. 否则使用当前文档的域名 (不含端口)
    // 3. 如果是IP地址，则简单使用 document.domain
    let rpId = options.rpId;
    if (!rpId || rpId.trim() === '') {
      rpId = document.domain;
      console.log('使用文档域名作为 rpId:', rpId);
    }
    
    // 调试信息
    console.log('当前文档URL:', window.location.href);
    console.log('当前文档域名:', document.domain);
    console.log('原始 rpId:', options.rpId);
    console.log('最终使用的 rpId:', rpId);
    
    // 转换选项中的二进制数据
    const publicKey = {
      challenge: base64UrlToArrayBuffer(options.challenge),
      rpId: rpId,
      timeout: options.timeout || 60000,
      userVerification: options.userVerification || 'preferred',
    };
    
    // 添加允许的凭据
    if (options.allowCredentials && options.allowCredentials.length > 0) {
      publicKey.allowCredentials = options.allowCredentials.map(cred => ({
        type: cred.type || 'public-key',
        id: base64UrlToArrayBuffer(cred.id),
        transports: cred.transports || ['internal']
      }));
    }
    
    console.log('准备调用 navigator.credentials.get...');
    console.log('publicKey参数:', JSON.stringify(publicKey, (key, value) => {
      // 处理 ArrayBuffer 以便能够打印
      if (value && value.constructor === ArrayBuffer) {
        return `ArrayBuffer(${value.byteLength})`;
      }
      return value;
    }, 2));
    
    // 调用浏览器的 WebAuthn API 获取凭据
    try {
      const credential = await navigator.credentials.get({ 
        publicKey: publicKey 
      });
      
      console.log('凭据获取成功:', credential);
      
      // 处理返回的断言数据
      const authData = {
        id: credential.id,
        rawId: arrayBufferToBase64Url(credential.rawId),
        type: credential.type,
        response: {
          authenticatorData: arrayBufferToBase64Url(credential.response.authenticatorData),
          clientDataJSON: arrayBufferToBase64Url(credential.response.clientDataJSON),
          signature: arrayBufferToBase64Url(credential.response.signature)
        }
      };
      
      // 添加 userHandle (如果存在)
      if (credential.response.userHandle && credential.response.userHandle.byteLength > 0) {
        authData.response.userHandle = arrayBufferToBase64Url(credential.response.userHandle);
      }
      
      // 添加客户端扩展结果 (如果方法可用)
      try {
        if (credential.getClientExtensionResults && typeof credential.getClientExtensionResults === 'function') {
          authData.clientExtensionResults = credential.getClientExtensionResults();
        } else {
          authData.clientExtensionResults = {};
        }
      } catch (extError) {
        console.warn('获取扩展结果失败:', extError);
        authData.clientExtensionResults = {};
      }
      
      console.log('认证数据处理完成:', authData);
      return authData;
    } catch (credentialError) {
      console.error('navigator.credentials.get 失败:', credentialError);
      
      // 处理特定的错误信息
      if (credentialError.name === 'NotAllowedError') {
        throw new Error('用户拒绝了认证请求或认证超时');
      } else if (credentialError.name === 'SecurityError') {
        throw new Error('安全错误: 可能是由于无效的 rpId 或非安全上下文');
      } else {
        throw credentialError;
      }
    }
  } catch (error) {
    console.error('WebAuthn 认证失败:', error);
    
    // 创建更详细的错误对象
    const enhancedError = new Error(`WebAuthn认证失败: ${error.message || '未知错误'}`);
    enhancedError.originalError = error;
    enhancedError.name = 'WebAuthnAuthenticationError';
    
    // 添加调试信息
    enhancedError.debugInfo = {
      browser: navigator.userAgent,
      isSecureContext: window.isSecureContext,
      domain: document.domain,
      location: window.location.href
    };
    
    throw enhancedError;
  }
}