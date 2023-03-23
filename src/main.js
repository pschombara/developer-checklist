import App from './popup/App.vue'
import store from '@/store'
import {createApp} from 'vue'
import vuetify from '@/plugins/vuetify'

const app = createApp(App)

app.config.productionTip = false
app.use(vuetify)
app.use(store)
app.mount('#app')
