import '@fortawesome/fontawesome-free/css/all.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as de from 'vuetify/lib/locale/de.mjs'
import * as en from 'vuetify/lib/locale/en.mjs'
import themes from './themes'
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
        defaultTheme: 'blueLight',
        themes: themes,
    },
    lang: {
        locales: { en, de },
        current: chrome.i18n.getUILanguage(),
    },
})

window.addEventListener('themeChanged', e => {
    let schema = 'Light'

    if (('system' === e.detail.schema && window.matchMedia('(prefers-color-scheme: dark)').matches)
        || 'dark' === e.detail.schema) {
        schema = 'Dark'
    }

    vuetify.theme.global.name.value = e.detail.color + schema
})

export default vuetify
