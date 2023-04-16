<template>
    <v-card>
        <v-card-title>
            <v-row>
                <v-col cols="10">Chat Notifications</v-col>
                <v-col cols="2">
                    <v-btn variant="text" @click="openOptions('chat')"><v-icon>fas fa-cog</v-icon></v-btn>
                </v-col>
            </v-row>
        </v-card-title>
        <v-card-text>
            <v-row>
                <v-col cols="12">
                    <v-autocomplete
                        v-model="client"
                        :items="clients"
                        item-title="client"
                        item-value="client"
                        label="Client"
                        variant="underlined"
                    ></v-autocomplete>
                </v-col>
            </v-row>
            <div v-if="validClient">
                <v-row>
                    <v-col cols="12">
                        <v-autocomplete
                            v-model="room"
                            :items="rooms"
                            item-value="id"
                            item-title="name"
                            label="Room"
                            variant="underlined"
                        ></v-autocomplete>
                    </v-col>
                </v-row>
                <v-row class="align-content-center">
                    <v-col cols="10">
                        <v-autocomplete
                            v-model="message"
                            :items="messages"
                            item-value="id"
                            item-title="name"
                            label="Message"
                            variant="underlined"
                        ></v-autocomplete>
                    </v-col>
                    <v-col cols="2">
                        <v-btn
                            v-if="'ready' === status || 'progress' === status"
                            :disabled="!sendReady"
                            color="primary"
                            outlined
                            large
                            @click="send"
                        >
                            <v-icon v-if="'ready' === status">fas fa-play</v-icon>
                            <v-icon v-if="'progress' === status">fas fa-circle-notch fa-spin</v-icon>
                        </v-btn>
                        <v-icon v-if="'success' === status" color="success">fas fa-check</v-icon>
                        <v-icon v-if="'error' === status" color="error">fas fa-times</v-icon>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-combobox
                            v-model="attachedIssues"
                            :items="issues"
                            multiple
                            small-chips
                            hide-selected
                            label="Issue to attach (optional)"
                            variant="underlined"
                        >
                            <template #selection="{item, parent}">
                                <v-chip
                                    closable
                                    @click:close="parent.selectItem(item)"
                                >
                                    {{item.title}}
                                </v-chip>
                            </template>
                        </v-combobox>
                    </v-col>
                </v-row>
            </div>
        </v-card-text>
    </v-card>
</template>

<script>

import {th} from "vuetify/locale";

export default {
    name: 'PopupChat',
    data: () => {
        return {
            client: '',
            room: null,
            message: null,
            attachedIssues: [],
        }
    },
    computed: {
        clients: function () {
            return this.$store.getters['chat/listClients']
        },
        messages: function () {
            return this.$store.getters['chat/listMessages'](this.client)
        },
        rooms: function () {
            return this.$store.getters['chat/listRooms'](this.client)
        },
        validClient: function () {
            return this.$store.getters['chat/listRooms'](this.client).length > 0
                && this.$store.getters['chat/listMessages'](this.client).length > 0
        },
        sendReady: function () {
            return '' !== this.client
                && null !== this.room
                && null !== this.message
                && 'ready' === this.status
        },
        status: function () {
            return this.$store.getters['chat/status']
        },
        issues: function () {
            return this.$store.getters['issues/issueKeys']
        },
    },
    created() {
        for (let client of this.clients) {
            if (client.main) {
                this.client = client.client

                break
            }
        }

        let currentIssue = this.$store.getters['currentIssue']

        if (null !== currentIssue) {
            this.attachedIssues.push(currentIssue)
        }

        let rooms = this.$store.getters['chat/listRooms'](this.client)

        if (0 === rooms.length) {
            return
        }

        for (let room of rooms) {
            if (null === this.room
                || this.room.sort > room.sort) {
                this.room = room
            }
        }

        let messages = this.$store.getters['chat/listMessages'](this.client)

        if (0 === messages.length) {
            return
        }

        for (let message of messages) {
            if (null === this.message
                || this.message.sort > message.sort) {
                this.message = message
            }
        }
    },
    methods: {
        openOptions: function (tab) {
            this.$store.dispatch('changeMainTab', tab)
            chrome.runtime.openOptionsPage()
        },
        send: function () {
            this.$store.dispatch('chat/sendMessage', {
                client: this.client,
                room: this.room,
                message: this.message,
                attachedIssues: this.attachedIssues,
            })
        },
    },
}
</script>
