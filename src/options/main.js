import App from './App.vue'
import store from '../store'
import {createApp} from 'vue'
import vuetify from '../plugins/vuetify'

const app = createApp(App)

app.config.productionTip = false
app.use(vuetify)
app.use(store)

app.config.globalProperties.theme = vuetify.theme

app.mount('#app')
