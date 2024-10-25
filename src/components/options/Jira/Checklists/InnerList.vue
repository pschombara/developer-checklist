<script setup>
import Helper from '../../../../utils/helper'
import {Uuid} from '../../../../utils/uuid'
import {ref, watch} from 'vue'
import {useJiraStorage} from '../../../../stores/jira.ts'

const jiraStorage = useJiraStorage()

const props = defineProps({
    uuid: {
        type: String,
        required: true,
    },
    uid: {
        type: String,
        required: true,
    },
    text: {
        type: Object,
        required: true,
    },
})

const emits = defineEmits(['close'])

const i18n = browser.i18n

const text = props.text
const header = [
    { title: text.name, key: 'text', sortable: false },
    { title: '', key: 'actions', align: 'end', sortable: false},
]

const nameRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
]

const defaultChecklist = {
    uid: null,
    title: '',
    sort: -1,
    items: [],
}

const checklist = ref({...defaultChecklist})

const sortItem = ref(null)

const defaultEntry = {
    id: null,
    text: '',
    open: false,
}

const deleteElement = ref({...defaultEntry})
const entry = ref({...defaultEntry})

const getCategory = () => {
    if (null === props.uid) {
        checklist.value = {...defaultChecklist}

        return
    }

    checklist.value = {...jiraStorage.getCategory(props.uuid, props.uid)}
}

watch({
    uid: () => {
        getCategory()
    },
})

const startSort = item => sortItem.value = item
const openRemoveEntry = item => {
    deleteElement.value = {
        id: item.id,
        text: item.text,
        open: true,
    }
}

const closeRemoveEntry = () => deleteElement.value = {...defaultEntry}

const removeEntry = () => {
    const index = checklist.value.items.findIndex(item => item.id === deleteElement.value.id)

    if (-1 !== index) {
        checklist.value.items.splice(index, 1)
        Helper.resort(checklist.value.items)
    }

    closeRemoveEntry()
}

const insertBefore = item => Helper.sortBefore(checklist.value.items, sortItem.value, item, 'id')
const insertAfter = item => Helper.sortAfter(checklist.value.items, sortItem.value, item, 'id')
const cancelSort = () => sortItem.value = null

const saveCategory = () => {
    jiraStorage.updateCategory(props.uuid, checklist.value)
    emits('close')
}

const addCategory = () => {
    jiraStorage.addCategory(props.uuid, checklist.value)

    checklist.value = {...defaultChecklist}
    emits('close')
}

const openEntry = item => {
    entry.value = {
        id: item.id,
        text: item.text,
        open: true,
    }
}

const closeEntry = () => entry.value = {...defaultEntry}

const saveEntry = () => {
    const element = checklist.value.items.find(item => item.id === entry.value.id)
    element.text = entry.value.text

    closeEntry()
}

const addEntry = () => {
    checklist.value.items.push({
        id: Uuid.generate(),
        text: entry.value.text,
        sort: Number.MAX_SAFE_INTEGER,
    })

    Helper.resort(checklist.value.items)
    closeEntry()
}

getCategory()
</script>

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
