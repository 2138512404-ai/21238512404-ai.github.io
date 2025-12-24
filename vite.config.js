import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  resolve:{
    alias:{
      "~":path.resolve(__dirname,"src")
    }
  },
  plugins: [vue(),WindiCSS()],

  
 // 1. 基础路径：部署到域名根目录填 '/'，部署到子目录（如 /calendar/）填 '/calendar/'
  base: '/', 
  // 2. 打包优化（可选，但建议加）
  build: {
    outDir: 'dist', // 打包输出目录（默认dist，部署时上传该文件夹内的文件）
    assetsDir: 'assets', // 静态资源存放目录
    chunkSizeWarningLimit: 1500, // 解决打包时“chunk体积过大”的警告
    // 压缩优化（Vite默认已压缩，可选）
    minify: 'esbuild',
    rollupOptions: {
      // 解决Vue路由刷新404（部署后生效，配合Nginx/静态托管的404配置）
      output: {
        manualChunks(id) {
          // 拆分依赖包，减小单个文件体积
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    }
  },
  // 开发服务器配置（仅本地开发用，不影响部署）
  server: {
    port: 3000, // 本地运行端口
    open: true // 启动后自动打开浏览器
  }
})

