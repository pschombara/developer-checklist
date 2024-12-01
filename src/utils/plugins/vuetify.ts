import '@fortawesome/fontawesome-free/css/all.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import {de, en} from 'vuetify/locale'
import themes from './themes'
import { md3 } from 'vuetify/blueprints'
import { aliases, fa } from 'vuetify/iconsets/fa'

const vuetify = createVuetify({
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
    locale: {
        current: browser.i18n.getUILanguage(),
        fallback: 'en',
        messages: { en, de },
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
