import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { 
  Button, 
  Tabbar, 
  TabbarItem, 
  Cell, 
  CellGroup, 
  NavBar, 
  Icon, 
  Form,
  Field,
  Toast,
  Dialog,
  Notify
} from 'vant'
import 'vant/lib/index.css'
import axios from 'axios'

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
app.use(Form)
app.use(Field)
app.use(Toast)
app.use(Dialog)
app.use(Notify)

// 设置全局变量
app.config.globalProperties.$axios = axios

// 挂载应用
app.mount('#app')