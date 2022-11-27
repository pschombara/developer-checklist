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
                        :items="clients"
                        item-title="client"
                        item-value="client"
                        v-model="client"
                        label="Client"
                    ></v-autocomplete>
                </v-col>
            </v-row>
            <div v-if="validClient">
                <v-row>
                    <v-col cols="12">
                        <v-autocomplete
                            :items="rooms"
                            item-value="id"
                            item-title="name"
                            v-model="room"
                            label="Room"
                        ></v-autocomplete>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="10">
                        <v-autocomplete
                            :items="messages"
                            item-value="id"
                            item-title="name"
                            v-model="message"
                            label="Message"
                        ></v-autocomplete>
                    </v-col>
                    <v-col cols="2" class="align-self-center">
                        <v-btn
                            :disabled="!sendReady"
                            color="success"
                            @click="send"
                            outlined
                            large
                            v-if="'ready' === status || 'progress' === status"
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
                        >
                            <template v-slot:selection="{item, parent}">
                                <v-chip>{{item}} <v-btn class="ml-2" icon x-small @click="parent.selectItem(item)"><v-icon>fas fa-times</v-icon></v-btn></v-chip>
                            </template>
                        </v-combobox>
                    </v-col>
                </v-row>
            </div>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: 'PopupChat',
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
    data: () => {
        return {
            client: '',
            room: null,
            message: null,
            attachedIssues: [],
        }
    },
}
</script>
