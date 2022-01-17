<template>
    <v-card>
        <v-card-text>
            <v-row>
                <v-col cols="12" md="2">
                    <v-switch
                        v-model="main"
                        :disabled="main"
                        :label="text.main"
                    ></v-switch>
                </v-col>
                <v-col cols="12" md="2">
                    <v-switch
                        v-model="enabled"
                        :label="text.enabled"
                    ></v-switch>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: 'General',
    props: {
        client: {
            type: String,
            required: true,
        },
    },
    computed: {
        main: {
            get() {
                return this.$store.getters['chat/main'](this.client)
            },
            set() {
                this.$store.dispatch('chat/updateMain', this.client)
            },
        },
        enabled: {
            get() {
                return this.$store.getters['chat/enabled'](this.client)
            },
            set(value) {
                this.$store.dispatch('chat/updateEnabled', {
                    client: this.client,
                    enabled: value,
                })
            },
        },
    },
    data() {
        return {
            text: {
                main: chrome.i18n.getMessage('MainClient'),
                enabled: chrome.i18n.getMessage('ClientEnabled'),
            },
        }
    },
}
</script>

