import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 載入環境變量
  const env = loadEnv(mode, process.cwd(), '')
  
  // 日誌輸出構建信息
  console.log('=== Build Configuration ===')
  console.log('Mode:', mode)
  console.log('Command:', command)
  console.log('API URL:', env.VITE_API_URL)
  console.log('========================')
  
  return {
    plugins: [react()],
    server: {
      port: 3000
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    publicDir: resolve(__dirname, '../docs'),
    envPrefix: 'VITE_',
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            utils: ['axios', 'date-fns']
          }
        }
      }
    },
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL || (mode === 'production' ? 'https://smart-todo-2.onrender.com' : 'http://localhost:8000')),
      __MODE__: JSON.stringify(mode),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.MODE': JSON.stringify(mode)
    }
  }
})
