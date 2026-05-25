import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- Este es el truco

export default defineConfig({
  plugins: [react(), tailwindcss()],
})