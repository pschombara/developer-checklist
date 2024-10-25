import App from './App.vue'
import {createApp} from 'vue'
import vuetify from '../../utils/plugins/vuetify'
import {createPinia} from 'pinia'

const pinia = createPinia()
const app = createApp(App)

app.config.productionTip = false
app.use(vuetify)
app.use(pinia)

app.config.globalProperties.theme = vuetify.theme

app.mount('#app')
