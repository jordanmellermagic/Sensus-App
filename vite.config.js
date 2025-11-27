import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',   // <== THIS IS THE CORRECT VALUE FOR RENDER STATIC SITE
  plugins: [react()],
})
