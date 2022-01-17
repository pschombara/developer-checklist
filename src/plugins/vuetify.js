import '@fortawesome/fontawesome-free/css/all.min.css'
import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'
import en from 'vuetify/es5/locale/en'
import de from 'vuetify/es5/locale/de'

Vue.use(Vuetify)

export default new Vuetify({
    icons: {
        iconfont: 'fa',
    },
    theme: {
        dark: window.matchMedia('(prefers-color-scheme: dark)').matches,
    },
    lang: {
        locales: { en, de },
        current: chrome.i18n.getUILanguage(),
    },
})
