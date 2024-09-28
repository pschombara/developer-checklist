<script setup>
import {useChatStorage} from '../../stores/chat.js'
import {ref} from 'vue'
import ChatMessages from './Chat/ChatMessages.vue'
import ChatGeneral from './Chat/ChatGeneral.vue'
import ChatRooms from './Chat/ChatRooms.vue'

const chatStorage = useChatStorage()

let init = false

const clients = [
    {
        id: 0,
        name: 'google',
        icon: 'fas fa-comment',
        urlStart: 'https://chat.googleapis.com/v1',
    },
    {
        id: 1,
        name: 'discord',
        icon: 'fab fa-discord',
        urlStart: 'https://discord.com/api/webhooks/',
    },
]

const selectedClient = ref()

const text = {
    rooms: chrome.i18n.getMessage('Rooms'),
    messages: chrome.i18n.getMessage('Messages'),
    general: chrome.i18n.getMessage('General'),
}

chatStorage.$subscribe(() => {
    if (init) {
        chatStorage.save()
    }
})

chatStorage.load().then(() => init = true)
</script>

<template>
    <v-card flat class="mt-5">
        <v-card-title>Chat</v-card-title>
        <v-card-text>
            <v-tabs v-model="selectedClient" vertical>
                <v-tab v-for="client in clients" :key="client.id">
                    <v-row align="center">
                        <v-col class="text-start">
                            <v-icon :icon="client.icon"/>
                        </v-col>
                        <v-col class="text-center">{{client.name}}</v-col>
                    </v-row>
                </v-tab>
            </v-tabs>

            <v-window v-model="selectedClient">
                    <v-window-item v-for="client in clients" :key="client.id">
                        <v-card>
                            <v-card-text>
                                <v-row>
                                    <v-col cols="12">
                                        <v-expansion-panels mandatory>
                                            <v-expansion-panel>
                                                <v-expansion-panel-title>{{ text.general }}</v-expansion-panel-title>
                                                <v-expansion-panel-text>
                                                    <ChatGeneral :client="client.name" />
                                                </v-expansion-panel-text>
                                            </v-expansion-panel>
                                            <v-expansion-panel>
                                                <v-expansion-panel-title>{{ text.rooms }}</v-expansion-panel-title>
                                                <v-expansion-panel-text>
                                                    <ChatRooms :url-start="client.urlStart" :client="client.name" />
                                                </v-expansion-panel-text>
                                            </v-expansion-panel>
                                            <v-expansion-panel>
                                                <v-expansion-panel-title>{{ text.messages }}</v-expansion-panel-title>
                                                <v-expansion-panel-text>
                                                    <ChatMessages :client="client.name" />
                                                </v-expansion-panel-text>
                                            </v-expansion-panel>
                                        </v-expansion-panels>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-window-item>
                </v-window>
        </v-card-text>
    </v-card>
</template>
