import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Button, Tabbar, TabbarItem, Cell, CellGroup, NavBar, Icon } from 'vant'
import 'vant/lib/index.css'

// 创建Vue应用实例
const app = createApp(App)

// 使用Vue Router
app.use(router)

// 注册Vant组件
app.use(Button)
app.use(Tabbar)
app.use(TabbarItem)
app.use(Cell)
app.use(CellGroup)
app.use(NavBar)
app.use(Icon)

// 挂载应用
app.mount('#app')