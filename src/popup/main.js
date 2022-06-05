import App from './App.vue'
import store from '@/store'
import {createVuetify} from 'vuetify/dist/vuetify'
import {createApp} from 'vue'

const app = createApp(App)
const vuetify = createVuetify()

app.config.productionTip = false
app.use(vuetify)
app.use(store)
app.mount('#app')
