import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: './', 
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        second: resolve(__dirname, 'home.html'),
        third: resolve(__dirname, 'interactionTwo.html')
        // add more pages if you have them
      }
    }
  }
})