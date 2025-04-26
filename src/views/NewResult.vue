<template>
    <div class="page">
      <header-bar :title="'新建结果'" />
      
      <div class="page-content">
        <van-form @submit="onSubmit">
          <van-cell-group inset>
            <van-field
              v-model="title"
              name="title"
              label="结果标题"
              placeholder="请输入结果标题"
              :rules="[{ required: true, message: '请填写结果标题' }]"
            />
            
            <van-field
              v-model="description"
              name="description"
              label="结果描述"
              type="textarea"
              rows="4"
              placeholder="请输入结果详细描述"
              :rules="[{ required: true, message: '请填写结果描述' }]"
            />
            
            <van-field
              v-model="date"
              name="date"
              label="完成日期"
              readonly
              :value="currentDate"
            />
          </van-cell-group>
          
          <div style="margin: 16px;">
            <van-button round block type="primary" native-type="submit">
              提交
            </van-button>
          </div>
        </van-form>
      </div>
    </div>
  </template>
  
  <script>
  import HeaderBar from '../components/HeaderBar.vue';
  import { Toast } from 'vant';
  
  export default {
    name: 'NewResultPage',
    components: {
      HeaderBar
    },
    data() {
      return {
        title: '',
        description: '',
        currentDate: this.formatDate(new Date())
      };
    },
    methods: {
      formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      },
      onSubmit() {
        // 这里添加保存结果的逻辑
        // 在实际应用中，这里应该调用API保存数据
        console.log('提交的数据：', {
          title: this.title,
          description: this.description,
          date: this.currentDate
        });
        
        // 显示提交成功的提示
        Toast.success('保存成功');
        
        // 跳转回结果列表页面
        setTimeout(() => {
          this.$router.push('/results');
        }, 1500);
      }
    }
  };
  </script>
  
  <style scoped>
  .page-content {
    padding-top: 56px;
  }
  </style>