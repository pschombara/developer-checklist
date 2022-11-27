import '@fortawesome/fontawesome-free/css/all.min.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import {de, en} from 'vuetify/lib/locale'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import themes from '@/plugins/themes'
import { md3 } from 'vuetify/blueprints'

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        iconfont: 'fa',
    },
    blueprint: md3,
    theme: {
        defaultTheme: 'dark',
        themes: themes.themes,
        //dark: window.matchMedia('(prefers-color-scheme: dark)').matches,
    },
    lang: {
        locales: { en, de },
        current: chrome.i18n.getUILanguage(),
    },

})

export default vuetify
