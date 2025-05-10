module.exports = {
  // 基本路径，如果要部署到 https://用户名.github.io/仓库名/，则publicPath设为'/仓库名/'
  publicPath: process.env.NODE_ENV === 'production' ? '/lifetree/' : '/',
  
  // 输出文件目录
  outputDir: 'dist',
  
  // 生产环境是否生成 sourceMap 文件
  productionSourceMap: false,
  
  // CSS相关配置
  css: {
    // 是否使用css分离插件 ExtractTextPlugin
    extract: true,
    // 开启 CSS source maps
    sourceMap: false
  },
  
  // webpack-dev-server 相关配置
  devServer: {
    // 设置主机地址
    host: '0.0.0.0', // Change from 'localhost' to '0.0.0.0'
    // 设置默认端口
    port: 8080,
    // 设置代理
    proxy: null,
    https: true
  }
}