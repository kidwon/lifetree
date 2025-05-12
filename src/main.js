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
  Notify,
  Tag,
  Loading,
  ActionSheet,
  PullRefresh,
  List,
  Empty,
  Popup,
  Picker,
  DropdownMenu,
  DropdownItem,
  Switch,
  Stepper,
  Search
} from 'vant'
import 'vant/lib/index.css'
// 导入全局标签样式
import './assets/css/tag-styles.css'
import axios from 'axios'
// 导入日志控制台组件
import ConsoleLogger from './components/ConsoleLogger.vue'

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
app.use(Tag)
app.use(Loading)
app.use(ActionSheet)
app.use(PullRefresh)
app.use(List)
app.use(Empty)
app.use(Popup)
app.use(Picker)
app.use(DropdownMenu)
app.use(DropdownItem)
app.use(Switch)
app.use(Stepper)
app.use(Search)

// 注册全局组件
app.component('ConsoleLogger', ConsoleLogger)

// 设置全局变量
app.config.globalProperties.$axios = axios

// 挂载应用
app.mount('#app')