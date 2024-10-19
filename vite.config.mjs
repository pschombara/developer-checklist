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
                manualChunks: (id) => {
                    if (id.includes('node_modules/vuetify')) {
                        return 'frontend';
                    }

                    if (id.includes('node_modules/vue') || id.includes('node_modules/@vue')) {
                        return 'backend';
                    }

                    if (id.includes('node_modules/semver') || id.includes('node_modules/lodash') || id.includes('node_modules/pinia')) {
                        return 'helper';
                    }

                    if (id.includes('node_modules/@fortawesome')) {
                        return 'font';
                    }

                    if (id.includes('/src/stores')) {
                        return 'stores';
                    }

                    if (id.includes('src/mixins')) {
                        return 'mixins';
                    }

                    if (id.includes('src/plugins')) {
                        return 'plugins';
                    }

                    if (id.includes('src/components/options')) {
                        return 'options';
                    }

                    if (id.includes('src/components/popup')) {
                        return 'popup';
                    }

                    if (id.includes('src/components/shared')) {
                        return 'shared';
                    }
                }
            },
        },
    }
})
