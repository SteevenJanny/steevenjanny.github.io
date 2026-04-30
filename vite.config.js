import {defineConfig} from 'vite'
import {resolve} from 'path'

export default defineConfig({
    root: 'src',
    publicDir: 'public',
    base: './',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, '/index.html'),
                iabm: resolve(__dirname, '/slidedecks/iabm.html'),
            }
        }
    }
})
