import App from './App.vue'
import {createApp} from 'vue'
import {createPinia} from 'pinia'
import vuetify from '../plugins/vuetify'

const pinia = createPinia()
const app = createApp(App)

app.config.productionTip = false

app.use(vuetify)
app.use(pinia)
app.mount('#app')
