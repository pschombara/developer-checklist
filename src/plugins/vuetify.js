import '@fortawesome/fontawesome-free/css/all.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as de from 'vuetify/lib/locale/de.mjs'
import * as en from 'vuetify/lib/locale/en.mjs'
import themes from '@/plugins/themes'
import 'vuetify/styles'
import { md3 } from 'vuetify/blueprints'
import { VDataTable } from 'vuetify/lib/labs/VDataTable/VDataTable.mjs'
import { aliases, fa } from 'vuetify/iconsets/fa'
import { components } from 'vuetify/dist/vuetify'

const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches

const vuetify = createVuetify({
    components: {
        ...components,
        VDataTable,
    },
    directives: {},
    icons: {
        defaultSet: 'fa',
        aliases,
        sets: {
            fa,
        },
    },
    blueprint: md3,
    theme: {
        defaultTheme: preferDark ? 'dark' :'light',
        themes: themes.themes,
        dark: preferDark,
    },
    lang: {
        locales: { en, de },
        current: chrome.i18n.getUILanguage(),
    },
})

export default vuetify
