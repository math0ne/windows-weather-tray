import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
    plugins: [
        svelte({
            compilerOptions: {
                runes: true
            }
        })
    ],
    root: path.join(__dirname, 'src/renderer'),
    base: './',
    build: {
        outDir: path.join(__dirname, 'out'),
        emptyOutDir: true,
        rollupOptions: {
            input: path.join(__dirname, 'src/renderer/index.html')
        }
    },
    server: {
        port: 5173
    }
})
