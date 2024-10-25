import {defineConfig} from 'wxt'
import vue from "@vitejs/plugin-vue"
import vuetify from "vite-plugin-vuetify";

// See https://wxt.dev/api/config.html

const manifest = {
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'en',
    permissions: [
        'tabs',
        'storage',
        'activeTab',
        'scripting'
    ],
}

if ('production' === import.meta.env.MODE) {
    manifest.content_security_policy = {
        extension_pages: 'default-src \'self\';style-src \'unsafe-inline\'; connect-src https://chat.googleapis.com/ https://discord.com/api/webhooks/ ;'
    }
}

export default defineConfig({
    extensionApi: 'chrome',
    modules: ['@wxt-dev/module-vue'],
    srcDir: './src',
    manifest: manifest,
    vite: () => ({
        plugins: [
            vuetify()
        ],
    }),
    runner: {
        disabled: true
    }
});
