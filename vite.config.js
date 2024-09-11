import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { splitVendorChunkPlugin } from 'vite'
import {crx} from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import fs from 'fs'

export default defineConfig({
    plugins: [vue(), vuetify(), splitVendorChunkPlugin(), crx({manifest})],
    server: {
        https: {
            key: fs.readFileSync('./localhost-key.pem'),
            cert: fs.readFileSync('./localhost.pem'),
        },
    },
})
