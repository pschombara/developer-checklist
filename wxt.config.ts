import {defineConfig, UserManifest} from 'wxt'
import vuetify from "vite-plugin-vuetify";

// See https://wxt.dev/api/config.html

// script-src has to be listed: in dev mode wxt adds the address of the dev server to it, and if the directive is
// missing it creates it with that address only, which blocks the scripts of the extension itself.

const manifest:UserManifest = {
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'en',
    permissions: [
        'tabs',
        'storage',
        'activeTab',
        'scripting'
    ],
    optional_host_permissions: [
        'https://*/*'
    ]
}

if ('production' === import.meta.env.NODE_ENV) {
    manifest.content_security_policy = {
        extension_pages: 'default-src \'self\';script-src \'self\';style-src \'unsafe-inline\'; connect-src https:;'
    }
} else {
    manifest.content_security_policy = {
        extension_pages: 'default-src \'self\';script-src \'self\';style-src \'unsafe-inline\'; connect-src https: ws:;'
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
    webExt: {
        disabled: true
    }
});
