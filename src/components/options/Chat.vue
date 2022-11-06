<template>
    <v-card flat class="mt-5">
        <v-card-title>Chat</v-card-title>
        <v-card-text>
            <v-tabs v-model="client" vertical>
                <v-tab v-for="client in clients" :key="client.id">
                    <v-row align="center">
                        <v-col class="text-start">
                            <v-icon>{{client.icon}}</v-icon>
                        </v-col>
                        <v-col class="text-center">{{client.name}}</v-col>
                    </v-row>
                </v-tab>
            </v-tabs>


            <v-window v-model="client">
                    <v-window-item v-for="client in clients" :key="client.id">
                        <v-card>
                            <v-card-text>
                                <v-row>
                                    <v-col cols="12">
                                        <v-expansion-panels mandatory>
                                            <v-expansion-panel>
                                                <v-expansion-panel-title>{{ text.general }}</v-expansion-panel-title>
                                                <v-expansion-panel-text>
                                                    <General :client="client.name"></General>
                                                </v-expansion-panel-text>
                                            </v-expansion-panel>
                                            <v-expansion-panel>
                                                <v-expansion-panel-title>{{ text.rooms }}</v-expansion-panel-title>
                                                <v-expansion-panel-text>
                                                    <Rooms :url-start="client.urlStart" :client="client.name"></Rooms>
                                                </v-expansion-panel-text>
                                            </v-expansion-panel>
                                            <v-expansion-panel>
                                                <v-expansion-panel-title>{{ text.messages }}</v-expansion-panel-title>
                                                <v-expansion-panel-text>
                                                    <Messages :client="client.name"></Messages>
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

<script>

import General from './Chat/General'
import Messages from './Chat/Messages'
import Rooms from './Chat/Rooms'

export default {
    name: 'OptionChat',
    components: {General, Messages, Rooms},
    methods: {
        chooseClient: function (client) {
            this.client = client
        },
    },
    data() {
        return {
            text: {
                rooms: chrome.i18n.getMessage('Rooms'),
                messages: chrome.i18n.getMessage('Messages'),
                general: chrome.i18n.getMessage('General'),
            },
            clients: [
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
            ],
            client: null,
        }
    },
}
</script>
