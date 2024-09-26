<script setup>
import {computed, ref} from 'vue'
import {useChatStorage} from '../../../stores/chat.js'

const props = defineProps({
    client: {
        type: String,
        required: true,
    },
})

const text = {
    main: chrome.i18n.getMessage('MainClient'),
    enabled: chrome.i18n.getMessage('ClientEnabled'),
}

const chatStorage = useChatStorage()

const main = computed({
    get() {
        return chatStorage.isMain(props.client)
    },
    set() {
        chatStorage.updateMain(props.client)
    },
})

const enabled = computed({
    get() {
        return chatStorage.isEnabled(props.client)
    },
    set(value) {
        chatStorage.updateEnabled(props.client, value)
    },
})

const name = computed({
    get() {
        return chatStorage.getName(props.client)
    },
    set(value) {
        chatStorage.updateName(props.client, value)
    },
})
</script>

<template>
    <v-card>
        <v-card-text>
            <v-row>
                <v-col cols="12" md="2">
                    <v-switch
                        v-model="main"
                        color="primary"
                        :disabled="main"
                        :label="text.main"
                    ></v-switch>
                </v-col>
                <v-col cols="12" md="2">
                    <v-switch
                        v-model="enabled"
                        color="primary"
                        :label="text.enabled"
                    ></v-switch>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <v-text-field
                        v-model="name"
                        label="Display name"
                    ></v-text-field>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>
