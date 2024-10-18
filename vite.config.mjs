import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import {crx} from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
    plugins: [
        vue(),
        vuetify(),
        crx({manifest}),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    lodash: ['lodash'],
                    vuetify: ['vuetify'],
                    semver: ['semver'],
                    pinia: ['pinia'],
                }
            },
        },
    }
})
