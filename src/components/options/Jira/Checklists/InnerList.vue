<template>
    <v-card>
        <v-card-title>{{checklist.title}}</v-card-title>
        <v-card-text>
            <v-text-field
                v-model="checklist.title"
                :label="text.name"
                :rules="nameRules"
            ></v-text-field>
            <v-data-table
                :items="checklist.items"
                :headers="header"
                :sort-by="[{key: 'sort', order: 'asc'}]"
                :items-per-page=-1
                :item-class="activeSortClass"
                :hide-default-footer=true
            >
                <template #top>
                    <v-toolbar flat>
                        <v-spacer></v-spacer>
                        <v-btn
                            variant="plain"
                            color="primary"
                            prepend-icon="fas fa-plus"
                            @click="openEntry(defaultEntry)">
                            {{ text.add }}</v-btn>
                        <v-dialog v-model="deleteElement.open" max-width="450">
                            <v-card>
                                <v-card-title class="headline">{{text.delete}}</v-card-title>
                                <v-card-text>
                                    {{ i18n.getMessage('TitleDelete', deleteElement.text) }}
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="secondary" plain @click="closeRemoveEntry">{{ text.cancel }}</v-btn>
                                    <v-btn color="tertiary" plain @click="removeEntry">{{ text.delete }}</v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                        <v-dialog v-model="entry.open" max-width="450">
                            <v-card>
                                <v-card-text>
                                    <v-text-field v-model="entry.text" :label="text.text"></v-text-field>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="grey" plain @click="closeEntry">{{text.cancel}}</v-btn>
                                    <v-btn v-if="entry.id" color="primary" plain @click="saveEntry">{{text.save}}</v-btn>
                                    <v-btn v-else color="primary" plain @click="addEntry">{{text.add}}</v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-toolbar>
                </template>
                <template #item.actions="{item}">
                    <v-btn
                        v-if="!sortItem"
                        variant="plain"
                        icon="fas fa-edit"
                        size="small"
                        @click="openEntry(item)"></v-btn>
                    <v-btn
                        v-if="!sortItem"
                        variant="plain"
                        icon="fas fa-sort"
                        size="small"
                        @click="startSort(item)"></v-btn>
                    <v-btn
                        v-if="!sortItem"
                        variant="plain"
                        icon="fas fa-trash"
                        size="small"
                        color="tertiary"
                        @click="openRemoveEntry(item)"></v-btn>
                    <v-btn
                        v-if="sortItem && sortItem.id !== item.id"
                        variant="plain"
                        icon="fas fa-sort-up"
                        size="small"
                        :disabled="item.sort - 1 === sortItem.sort"
                       @click="insertBefore(item)"></v-btn>
                    <v-btn
                        v-if="sortItem && sortItem.id !== item.id"
                        variant="plain"
                        icon="fas fa-sort-down"
                        size="small"
                       :disabled="item.sort + 1 === sortItem.sort"
                        @click="insertAfter(item)"></v-btn>
                    <v-btn
                        v-if="sortItem && sortItem.id === item.id"
                        variant="plain"
                        icon="fas fa-times"
                        size="small"
                        @click="cancelSort"></v-btn>
                </template>
            </v-data-table>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                variant="plain"
                color="secondary"
                @click="$emit('close')">{{ text.cancel }}</v-btn>
            <v-btn
                v-if="!!checklist.uid"
                variant="plain"
                color="primary"
                :disabled="checklist.title.length <= 0 && 0 === checklist.items.length"
                @click="saveCategory"
            >{{ text.save }}</v-btn>
            <v-btn
                v-else
                variant="plain"
                color="primary"
                :disabled="checklist.title.length <= 0 && 0 === checklist.items.length"
                @click="addCategory"
            >{{ text.add }}</v-btn>
            <v-spacer></v-spacer>
        </v-card-actions>
    </v-card>
</template>

<script>
import Helper from '../../../../mixins/helper'
import _ from 'lodash'
import {Uuid} from '../../../../mixins/uuid'

export default  {
    name: 'ChecklistsInnerList',
    props: {
        uuid: {
            type: String,
            required: true,
        },
        uid: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
    },
    emits: ['close'],
    data() {
        return {
            nameRules: [
                value => !!value || chrome.i18n.getMessage('errNotBlank'),
            ],
            sortItem: null,
            checklist: {
                uid: null,
                title: '',
                sort: -1,
                items: [],
            },
            defaultChecklist: {
                uid: null,
                title: '',
                sort: -1,
                items: [],
            },
            i18n: chrome.i18n,
            deleteElement: {
                id: null,
                text: '',
                open: false,
            },
            entry: {
                id: null,
                text: '',
                open: false,
            },
            defaultEntry: {
                id: null,
                text: '',
                open: false,
            },
        }
    },
    computed: {
        header() {
            return [
                { title: this.text.name, key: 'text', sortable: false },
                { title: '', key: 'actions', align: 'end', sortable: false},
            ]
        },
    },
    watch: {
        uid: function () {
            this.getCategory()
        },
    },
    created() {
        this.getCategory()
    },
    methods: {
        startSort: function (item) {
            this.sortItem = item
        },
        openRemoveEntry: function (item) {
            this.deleteElement = {
                id: item.id,
                text: item.text,
                open: true,
            }
        },
        closeRemoveEntry: function () {
            this.deleteElement = Object.assign({}, this.defaultEntry)
        },
        removeEntry: function () {
            const index = this.checklist.items.findIndex(element => element.id === this.deleteElement.id)

            if (-1 !== index) {
                this.checklist.items.splice(index, 1)
                Helper.resort(this.checklist.items)
            }

            this.closeRemoveEntry()
        },
        insertBefore: function (item) {
            Helper.sortBefore(this.checklist.items, this.sortItem, item, 'id')
        },
        insertAfter: function (item) {
            Helper.sortAfter(this.checklist.items, this.sortItem, item, 'id')
        },
        cancelSort: function () {
            this.sortItem = null
        },
        activeSortClass: function (item) {
            if (null === this.sortItem) {
                return ''
            }

            return item.id === this.sortItem.id ? 'primary' : ''
        },
        saveCategory: function () {
            this.$store.dispatch('jira/updateCategory', {
                uuid: this.uuid,
                category: this.checklist,
            })

            this.$emit('close')
        },
        addCategory: function () {
            this.$store.dispatch('jira/addCategory', {
                uuid: this.uuid,
                category: this.checklist,
            })

            this.checklist = _.cloneDeep(this.defaultChecklist)

            this.$emit('close')
        },
        getCategory: function () {
            if (null === this.uid) {
                this.checklist = _.cloneDeep(this.defaultChecklist)

                return
            }

            this.checklist = _.cloneDeep(this.$store.getters['jira/getCategory'](this.uuid, this.uid))
        },
        openEntry: function (entry) {
            if (Object.prototype.hasOwnProperty.call(entry, 'raw')) {
                entry = entry
            }

            this.entry = {
                id: entry.id,
                text: entry.text,
                open: true,
            }
        },
        closeEntry: function () {
            this.entry = Object.assign({}, this.defaultEntry)
        },
        saveEntry: function () {
            const entry = this.checklist.items.find(element => element.id === this.entry.id)

            entry.text = this.entry.text

            this.closeEntry()
        },
        addEntry: function () {
            this.checklist.items.push({
                id: Uuid.generate(),
                text: this.entry.text,
                sort: Number.MAX_SAFE_INTEGER,
            })

            Helper.resort(this.checklist.items)

            this.closeEntry()
        },
    },
}
</script>
