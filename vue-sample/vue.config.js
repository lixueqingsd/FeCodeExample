const isProduction = process.env.NODE_ENV === 'production';
module.exports = {
  runtimeCompiler: true,
  configureWebpack: config => {
    if (isProduction) {
      
      config.externals = {
        'vue': 'Vue',
        'vue-router': 'VueRouter',
        'moment': 'moment'
      }
      
    }
  },
  devServer: {
    /*
    proxy: {
      

      '/api':{
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    },
    */
    proxy: "http://localhost:3000",
    watchContentBase: true,
    compress: true,
    port: 9000
  }
}