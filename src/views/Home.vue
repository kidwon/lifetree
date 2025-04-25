<template>
    <div class="page">
      <header-bar :title="'首页'" :show-back="false" />
      
      <div class="page-content home-content">
        <div class="profile-icon" @click="goToProfile">
          <van-icon name="contact" size="24" />
        </div>
        
        <div class="welcome-section">
          <h2>生命树</h2>
        </div>
      </div>
      
      <nav-bar />
    </div>
  </template>
  
  <script>
  import HeaderBar from '../components/HeaderBar.vue'
  import NavBar from '../components/NavBar.vue'
  
  export default {
    name: 'HomePage',
    components: {
      HeaderBar,
      NavBar
    },
    methods: {
      goToProfile() {
        this.$router.push('/profile')
      }
    }
  }
  </script>
  
  <style scoped>
  .home-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: calc(100vh - 96px);
  }
  
  .profile-icon {
    position: absolute;
    top: 60px;
    right: 20px;
    background-color: #f2f2f2;
    border-radius: 50%;
    padding: 8px;
    cursor: pointer;
  }
  
  .welcome-section {
    text-align: center;
    margin-top: 40px;
  }
  
  .welcome-section h2 {
    font-size: 24px;
    margin-bottom: 12px;
    color: #333;
  }
  
  .welcome-section p {
    font-size: 16px;
    color: #666;
  }
  </style>