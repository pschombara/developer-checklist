<template>
    <v-card>
        <v-card-text>
            <v-data-table
                :headers="roomsHeader"
                :items="rooms"
                :sort-by="[{key: 'sort', order: 'asc'}]"
                :items-per-page="-1"
                :item-class="itemRowSortActiveClass"
                :hide-default-footer="true"
            >
                <template #top>
                    <v-toolbar flat>
                        <v-spacer></v-spacer>
                        <v-btn
                            variant="plain"
                            prepend-icon="fas fa-plus"
                            color="primary"
                            @click="openAddRoom">{{text.add}}</v-btn>
                    </v-toolbar>

                    <v-dialog v-model="editRoom.open" max-width="600">
                        <v-card>
                            <v-card-title>{{editRoom.title}}</v-card-title>
                            <v-card-text>
                                <v-form ref="roomForm" v-model="formValid">
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
                                </v-form>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="secondary" plain @click="closeRoom">{{ text.cancel }}</v-btn>
                                <v-btn v-if="!!editRoom.id" color="primary" plain :disabled="!formValid" @click="saveRoom">{{ text.save }}</v-btn>
                                <v-btn v-else color="primary" plain :disabled="!formValid" @click="addRoom">{{ text.add }}</v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <v-dialog v-model="deleteRoom.open" max-width="450">
                        <v-card>
                            <v-card-title>
                                {{i18n.getMessage('TitleDelete', deleteRoom.name)}}
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
                    <v-btn v-if="!sortRoom" variant="plain" icon="fas fa-edit" size="small" @click="openRoom(item)"></v-btn>
                    <v-btn v-if="!sortRoom" variant="plain" icon="fas fa-sort" size="small" :disabled="rooms.length < 2" @click="startSort(item)"></v-btn>
                    <v-btn v-if="!sortRoom" variant="plain" icon="fas fa-trash" size="small" color="tertiary" @click="openDeleteRoom(item)"></v-btn>
                    <v-btn
                        v-if="sortRoom && sortRoom.value !== item.value"
                        variant="plain"
                        icon="fas fa-sort-up"
                        size="small"
                        :disabled="item.raw.sort - 1 === sortRoom.raw.sort"
                        @click="sortBefore(item)"></v-btn>
                    <v-btn
                        v-if="sortRoom && sortRoom.value !== item.value"
                        variant="plain"
                        icon="fas fa-sort-down"
                        size="small"
                        :disabled="item.raw.sort + 1 === sortRoom.raw.sort"
                        @click="sortAfter(item)"></v-btn>
                    <v-btn
                        v-if="sortRoom && sortRoom.value === item.value"
                        variant="plain"
                        icon="fas fa-times"
                        size="small"
                        @click="closeSort"></v-btn>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>
import Helper from '../../../mixins/helper'

export default {
    name: 'ChatRooms',
    props: {
        client: {
            type: String,
            required: true,
        },
        urlStart: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            sortRoom: null,
            editRoom: {
                open: false,
                id: null,
                name: '',
                url: '',
                title: '',
            },
            deleteRoom: {
                open: false,
                id: null,
                name: '',
            },
            i18n: chrome.i18n,
            text: {
                add: chrome.i18n.getMessage('Add'),
                save: chrome.i18n.getMessage('Save'),
                cancel: chrome.i18n.getMessage('Cancel'),
                delete: chrome.i18n.getMessage('Delete'),
                name: chrome.i18n.getMessage('Name'),
            },
            nameRules: [
                value => !!value || chrome.i18n.getMessage('errNotBlank'),
                value => value.length <= 20 || chrome.i18n.getMessage('errMaxLength', '20'),
                value => false === this.checkDuplicated(value) || chrome.i18n.getMessage('errDuplicated'),
            ],
            urlRules: [
                value => !!value || chrome.i18n.getMessage('errNotBlank'),
                value => Helper.isURL(value, this.urlStart) || chrome.i18n.getMessage('errUrlInvalid'),
                value => value.length <= 500 || chrome.i18n.getMessage('errMaxLength', '500'),
            ],
            formValid: false,
        }
    },
    computed: {
        rooms() {
            return this.$store.getters['chat/listRooms'](this.client)
        },
        roomsHeader() {
            return [
                {title: 'Name', key: 'name', sortable: false, width: '15%'},
                {title: 'URL', key: 'url', sortable: false, width: '75%'},
                {title: '', key: 'actions', align: 'end', sortable: false, width: '10%'},
            ]
        },
    },
    methods: {
        startSort: function (item) {
            this.sortRoom = item
        },
        closeSort: function () {
            this.sortRoom = null
        },
        sortBefore: function (item) {
            this.$store.dispatch('chat/roomSortBefore', {
                client: this.client,
                ref: item.value,
                current: this.sortRoom.value,
            })
        },
        sortAfter: function (item) {
            this.$store.dispatch('chat/roomSortAfter', {
                client: this.client,
                ref: item.value,
                current: this.sortRoom.value,
            })
        },
        itemRowSortActiveClass: function (item) {
            if (null === this.sortRoom) {
                return ''
            }

            return item.value === this.sortRoom.value ? 'primary' : ''
        },
        openRoom: function (item) {
            this.editRoom = {
                open: true,
                id: item.id,
                name: item.name,
                url: item.url,
                title: this.i18n.getMessage('TitleUpdate', item.name),
            }
        },
        openAddRoom: function () {
            this.closeRoom()
            this.editRoom.open = true
        },
        closeRoom: function () {
            this.editRoom = {
                open: false,
                id: null,
                name: '',
                url: '',
                title: '',
            }
        },
        saveRoom: function () {
            if (this.$refs.roomForm.validate()) {
                this.$store.dispatch('chat/updateRoom', {
                    client: this.client,
                    room: {
                        id: this.editRoom.id,
                        name: this.editRoom.name,
                        url: this.editRoom.url,
                    },
                })
            }

            this.closeRoom()
        },
        addRoom: function () {
            if (this.$refs.roomForm.validate()) {
                this.$store.dispatch('chat/addRoom', {
                    client: this.client,
                    room: {
                        name: this.editRoom.name,
                        url: this.editRoom.url,
                    },
                })
            }

            this.closeRoom()
        },
        openDeleteRoom: function (item) {
            this.deleteRoom = {
                open: true,
                id: item.id,
                name: item.name,
            }
        },
        closeDeleteRoom: function () {
            this.deleteRoom = {
                open: false,
                id: null,
                name: '',
            }
        },
        removeRoom: function () {
            this.$store.dispatch('chat/removeRoom', {
                client: this.client,
                id: this.deleteRoom.id,
            })

            this.closeDeleteRoom()
        },
        checkDuplicated: function (value) {
            const room = this.$store.getters['chat/listRooms'](this.client).find(item => item.name === value)

            if (undefined === room) {
                return false
            }

            if (null === this.editRoom.id) {
                return true
            }

            return this.editRoom.name !== value
        },
    },
}
</script>
