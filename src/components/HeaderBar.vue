<template>
  <div class="header-bar">
    <van-nav-bar
      :left-text="showBack ? '返回' : ''"
      :left-arrow="showBack"
      @click-left="onClickLeft"
      :right-text="rightText"
      @click-right="onClickRight"
    >
      <!-- 移除小篆字体，使用普通标题 -->
      <template #title>
        <span class="header-title">{{ title }}</span>
      </template>
    </van-nav-bar>
  </div>
</template>

<script>
export default {
  name: 'HeaderBar',
  props: {
    title: {
      type: String,
      default: ''
    },
    showBack: {
      type: Boolean,
      default: true
    },
    rightText: {
      type: String,
      default: ''
    }
  },
  methods: {
    onClickLeft() {
      if (this.showBack) {
        this.$router.back()
      }
    },
    onClickRight() {
      this.$emit('right-click')
    }
  }
}
</script>

<style scoped>
.header-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.header-bar :deep(.van-nav-bar) {
  height: 56px;
}

.header-bar :deep(.van-nav-bar__title) {
  font-size: 20px;
  font-weight: 600;
}

.header-bar :deep(.van-nav-bar__left),
.header-bar :deep(.van-nav-bar__right) {
  font-size: 16px;
}

.header-bar :deep(.van-icon) {
  font-size: 20px;
}

.header-title {
  letter-spacing: 2px;
}
</style>