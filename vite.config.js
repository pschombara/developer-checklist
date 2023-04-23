import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { splitVendorChunkPlugin } from 'vite'
import {crx} from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
    plugins: [vue(), vuetify(), splitVendorChunkPlugin(), crx({manifest})],
    server: {
        host: '0.0.0.0', // <==
    },
})
