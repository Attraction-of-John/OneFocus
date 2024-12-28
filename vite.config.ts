import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl: 'http://localhost:5173',
    supportFile: false
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite'
    }
  }
  plugins: [react()],
})
