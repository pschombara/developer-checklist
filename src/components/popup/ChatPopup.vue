<script setup>

import {useChatStorage} from '../../stores/chat.ts'
import {computed, ref, watch} from 'vue'
import ChatStatus from '../../utils/chat/status.ts'
import {useIssueStorage} from '../../stores/issues.ts'
import {usePopupStorage} from '../../stores/popup.ts'
import {useMainStorage} from '../../stores/mainStorage.ts'

const chatStorage = useChatStorage()
const issueStorage = useIssueStorage()
const popUpStorage = usePopupStorage()
const mainStorage = useMainStorage()

const i18n = browser.i18n

const client = ref(null)
const room = ref(null)
const message = ref(null)
const attachedIssues = ref([])

const clients = computed(() => chatStorage.getClients)

const rooms = computed(() => chatStorage.getRooms(client.value))
const messages = computed(() => chatStorage.getMessages(client.value))

const validClient = computed(() => rooms.value.length > 0 && messages.value.length > 0)

const status = computed(() => chatStorage.getStatus)
const sendReady = computed(() => null !== client.value && null !== room.value && null !== message.value && ChatStatus.READY === chatStorage.getStatus)

const issues = computed(() => issueStorage.getIssues.map(issue => issue.key))

watch(client, () => {
    room.value = rooms.value[0]?.id ?? null
    message.value = messages.value[0]?.id ?? null
})

const load = async () => {
    await chatStorage.load()
    await issueStorage.load()

    for (const item of clients.value) {
        if (item.main) {
            client.value = item.client
        }
    }

    if (null !== popUpStorage.getCurrentIssue) {
        attachedIssues.value.push(popUpStorage.getCurrentIssue)
    }

    if (null === client.value) {
        return
    }

    message.value = messages.value[0].id ?? null
    room.value = rooms.value[0].id ?? null
}

const showSendButton = computed(() => {
    return ChatStatus.READY === status.value || ChatStatus.PROGRESS === status.value
})

const openOptions = tab => {
    mainStorage.changeMainTab(tab)
    browser.runtime.openOptionsPage()
}

const send = async () => chatStorage.sendMessage(client.value, room.value, message.value, attachedIssues.value)

load()
</script>

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
        <v-card-text v-if="client">
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
                            v-if="showSendButton"
                            :disabled="!sendReady"
                            color="primary"
                            outlined
                            large
                            @click="send"
                        >
                            <v-icon v-if="ChatStatus.READY === status">fas fa-play</v-icon>
                            <v-icon v-if="ChatStatus.PROGRESS === status">fas fa-circle-notch fa-spin</v-icon>
                        </v-btn>
                        <v-icon v-if="ChatStatus.SUCCESS === status" color="success">fas fa-check</v-icon>
                        <v-icon v-if="ChatStatus.ERROR === status" color="error">fas fa-times</v-icon>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-combobox
                            v-model="attachedIssues"
                            :items="issues"
                            multiple="multiple"
                            small-chips
                            hide-selected
                            label="Issue to attach (optional)"
                            variant="underlined"
                        >
                            <template #selection="{item, parent}">
                                <v-chip
                                    closable="closable"
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
        <v-card-text v-else>
            Missing Options
        </v-card-text>
        <v-card-actions v-if="!client">
            <v-spacer></v-spacer>
            <v-btn color="primary" plain @click="openOptions('chat')">{{i18n.getMessage('openOptions')}}</v-btn>
            <v-spacer></v-spacer>
        </v-card-actions>
    </v-card>
</template>
