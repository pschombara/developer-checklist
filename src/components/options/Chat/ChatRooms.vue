<script setup>

import {computed, ref} from 'vue'
import Helper from '../../../utils/helper.ts'
import {useChatStorage} from '../../../stores/chat.ts'

const props = defineProps({
    client: {
        type: String,
        required: true,
    },
    urlStart: {
        type: String,
        required: true,
    },
})

const sortRoom = ref(null)

const i18n = browser.i18n

const text = {
    add: i18n.getMessage('Add'),
    save: i18n.getMessage('Save'),
    cancel: i18n.getMessage('Cancel'),
    delete: i18n.getMessage('Delete'),
    name: i18n.getMessage('Name'),
}

const defaultRoom = {
    open: false,
    id: null,
    name: '',
    url: '',
    title: '',
    saveButton: text.add,
}

const defaultDelete = {
    open: false,
    id: null,
    name: '',
}

const editRoom = ref({...defaultRoom})
const deleteRoom = ref({...defaultDelete})

const nameRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
    value => value.length <= 20 || i18n.getMessage('errMaxLength', '20'),
    value => false === checkDuplicated(value) || i18n.getMessage('errDuplicated'),
]

const urlRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
    value => Helper.isURL(value, props.urlStart) || i18n.getMessage('errUrlInvalid'),
    value => value.length <= 500 || i18n.getMessage('errMaxLength', '500'),
]

const roomsHeader = [
    {title: 'Name', key: 'name', sortable: false, width: '15%'},
    {title: 'URL', key: 'url', sortable: false, width: '75%'},
    {title: '', key: 'actions', align: 'end', sortable: false, width: '10%'},
]

const chatStorage = useChatStorage()

const rooms = computed(() => {
    return chatStorage.getRooms(props.client)
})

const startSort = item => {
    sortRoom.value = item
}

const closeSort = () => {
    sortRoom.value = null
}

const sortBefore = item => {
    chatStorage.roomSortBefore(props.client, item.id, sortRoom.value.id)
}

const sortAfter = item => {
    chatStorage.roomSortAfter(props.client, item.id, sortRoom.value.id)
}

const openRoom = item => {
    editRoom.value = {
        open: true,
        id: item.id,
        name: item.name,
        url: item.url,
        title: i18n.getMessage('TitleUpdate', item.name),
        saveButton: text.save,
    }
}

const closeRoom = () => {
    editRoom.value = {...defaultRoom}
}

const openAddRoom = () => {
    closeRoom()
    editRoom.value.open = true
}

const saveRoom = async event => {
    const result = await event

    if (false === result.valid) {
        return
    }

    if (null === editRoom.value.id) {
        chatStorage.createRoom(props.client, editRoom.value.name, editRoom.value.url)
    } else {
        chatStorage.updateRoom(props.client, editRoom.value.id, editRoom.value.name, editRoom.value.url)
    }

    closeRoom()
}

const openDeleteRoom = item => {
    deleteRoom.value = {
        open: true,
        id: item.id,
        name: item.name,
    }
}

const closeDeleteRoom = () => {
    deleteRoom.value = {...defaultDelete}
}

const removeRoom = () => {
    chatStorage.removeRoom(props.client, deleteRoom.value.id)
}

const checkDuplicated = value => {
    const room = chatStorage.getRooms(props.client).find(room => room.name === value)

    if (undefined === room) {
        return false
    }

    if (null === editRoom.value.id) {
        return true
    }

    return editRoom.value.name !== value
}
</script>

<template>
    <v-card>
        <v-card-text>
            <v-data-table
                :headers="roomsHeader"
                :items="rooms"
                :sort-by="[{key: 'sort', order: 'asc'}]"
                :items-per-page="-1"
                :hide-default-footer="true"
            >
                <template #top>
                    <v-toolbar flat>
                        <v-spacer></v-spacer>
                        <v-btn
                            variant="plain"
                            prepend-icon="fas fa-plus"
                            color="primary"
                            @click="openAddRoom">{{ text.add }}
                        </v-btn>
                    </v-toolbar>

                    <v-dialog v-model="editRoom.open" max-width="600">
                        <v-form validate-on="input" @submit.prevent="saveRoom">
                            <v-card>
                                <v-card-title>{{ editRoom.title }}</v-card-title>
                                <v-card-text>
                                    <v-text-field
                                        v-model="editRoom.name"
                                        :label="text.name"
                                        counter="20"
                                        :rules="nameRules"></v-text-field>
                                    <v-text-field
                                        v-model="editRoom.url"
                                        type="url"
                                        label="URL"
                                        counter="500"
                                        :rules="urlRules"></v-text-field>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                        color="secondary"
                                        variant="plain"
                                        @click="closeRoom">{{ text.cancel }}
                                    </v-btn>
                                    <v-btn
                                        type="submit"
                                        color="primary"
                                        variant="plain">{{ editRoom.saveButton }}
                                    </v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-form>
                    </v-dialog>
                    <v-dialog v-model="deleteRoom.open" max-width="450">
                        <v-card>
                            <v-card-title>
                                {{ i18n.getMessage('TitleDelete', deleteRoom.name) }}
                            </v-card-title>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="secondary" plain @click="closeDeleteRoom">{{ text.cancel }}</v-btn>
                                <v-btn color="tertiary" plain @click="removeRoom">{{ text.delete }}</v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </template>
                <template #item.actions="{item}">
                    <v-btn
                        v-if="!sortRoom"
                        variant="plain"
                        icon="fas fa-edit"
                        size="small"
                        @click="openRoom(item)"></v-btn>
                    <v-btn
                        v-if="!sortRoom"
                        variant="plain"
                        icon="fas fa-sort"
                        size="small"
                        :disabled="rooms.length < 2"
                        @click="startSort(item)"></v-btn>
                    <v-btn
                        v-if="!sortRoom"
                        variant="plain"
                        icon="fas fa-trash"
                        size="small"
                        color="tertiary"
                        @click="openDeleteRoom(item)"></v-btn>
                    <v-btn
                        v-if="sortRoom && sortRoom.id !== item.id"
                        variant="plain"
                        icon="fas fa-sort-up"
                        size="small"
                        :disabled="item.sort - 1 === sortRoom.sort"
                        @click="sortBefore(item)"></v-btn>
                    <v-btn
                        v-if="sortRoom && sortRoom.id !== item.id"
                        variant="plain"
                        icon="fas fa-sort-down"
                        size="small"
                        :disabled="item.sort + 1 === sortRoom.sort"
                        @click="sortAfter(item)"></v-btn>
                    <v-btn
                        v-if="sortRoom && sortRoom.id === item.id"
                        variant="plain"
                        icon="fas fa-times"
                        size="small"
                        @click="closeSort"></v-btn>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>
