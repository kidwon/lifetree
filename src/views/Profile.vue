<template>
    <div class="page">
      <header-bar :title="'个人信息'" />
      
      <div class="page-content">
        <div class="profile-avatar">
          <van-icon name="contact" size="64" />
        </div>
        
        <van-cell-group inset>
          <van-cell title="用户名" value="测试用户" />
          <van-cell title="手机号" value="138****1234" />
          <van-cell title="邮箱" value="test@example.com" />
        </van-cell-group>
        
        <div class="action-buttons">
          <van-button type="primary" block>编辑资料</van-button>
          <van-button type="default" block style="margin-top: 12px;">退出登录</van-button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import HeaderBar from '../components/HeaderBar.vue'
  
  export default {
    name: 'Profile',
    components: {
      HeaderBar
    }
  }
  </script>
  
  <style scoped>
  .page-content {
    padding-top: 56px;
    display: flex;
    flex-direction: column;
  }
  
  .profile-avatar {
    display: flex;
    justify-content: center;
    margin: 30px 0;
  }
  
  .profile-avatar .van-icon {
    background-color: #f2f2f2;
    border-radius: 50%;
    padding: 20px;
  }
  
  .action-buttons {
    margin: 30px 16px;
  }
  </style>