<script setup>

import InnerList from './InnerList.vue'
import {computed, ref} from 'vue'
import {useJiraStorage} from '../../../../stores/jira.ts'
import {useIconStorage} from '../../../../stores/icons.ts'

const i18n = browser.i18n
const text = {
    name: i18n.getMessage('Name'),
    cancel: i18n.getMessage('Cancel'),
    save: i18n.getMessage('Save'),
    enabled: i18n.getMessage('ChecklistEnabled'),
    buttons: i18n.getMessage('Buttons'),
    buttonEnabled: i18n.getMessage('ButtonEnabled'),
    success: i18n.getMessage('Success'),
    failed: i18n.getMessage('Failed'),
    text: i18n.getMessage('Text'),
    comment: i18n.getMessage('comment'),
    sendCommentImmediately: i18n.getMessage('SendCommentImmediately'),
    listCompletelyChecked: i18n.getMessage('ListCompletelyChecked'),
    checklists: i18n.getMessage('Checklists'),
    add: i18n.getMessage('Add'),
    delete: i18n.getMessage('Delete'),
}

const textRules = [
    value => value.length <= 15 || i18n.getMessage('errMaxLength', '15'),
]

const props = defineProps({
    uuid: {
        type: String,
        required: true,
    },
})

const jiraStorage = useJiraStorage()
const iconStorage = useIconStorage()

const sortChecklist = ref(null)
const openChecklistDialog = ref(false)
const categoryId = ref(null)

const dialogBtnSuccess = ref({
    open: false,
    item: {
        enabled: false,
        text: '',
        comment: '',
        autoComment: false,
        successRequiredAll: false,
    },
})

const dialogBtnFailed = ref({
    open: false,
    item: {
        enabled: false,
        text: '',
        comment: '',
        autoComment: false,
    },
})

const defaultDeleteCategory = {
    uid: null,
    title: '',
    open: false,
}

const deleteCategory = ref({...defaultDeleteCategory})

const categoriesHeader = [
    {title: text.name, key: 'title', sortable: false},
    {title: '', key: 'actions', align: 'end', sortable: false},
]

const checklist = computed(() => {
    return jiraStorage.getChecklist(props.uuid)
})

const icons = computed(() => {
    return iconStorage.getIcons
})

const templates = computed(() => {
    return jiraStorage.getTemplates
})

const openButtonSuccessDialog = () => {
    dialogBtnSuccess.value.open = true
    dialogBtnSuccess.value.item = {...checklist.value.buttons.success}
    dialogBtnSuccess.value.item.successRequiredAll = checklist.value.successRequiredAll
}

const closeButtonSuccessDialog = () => {
    dialogBtnSuccess.value.open = false
}

const formBtnSuccess = ref()
const formBtnFailed = ref()

const saveButtonSuccess = () => {
    if (formBtnSuccess.value.validate()) {
        jiraStorage.updateBtnSuccess(
            props.uuid,
            dialogBtnSuccess.value.item.enabled,
            dialogBtnSuccess.value.item.text,
            dialogBtnSuccess.value.item.comment,
            dialogBtnSuccess.value.item.autoComment,
            dialogBtnSuccess.value.item.successRequiredAll,
        )
    }

    closeButtonSuccessDialog()
}

const openButtonFailedDialog = () => {
    dialogBtnFailed.value.open = true
    dialogBtnFailed.value.item = {...checklist.value.buttons.failed}
}

const closeButtonFailedDialog = () => dialogBtnFailed.value.open = false

const saveButtonFailed = () => {
    if (formBtnFailed.value.validate()) {
        jiraStorage.updateBtnFailed(
            props.uuid,
            dialogBtnFailed.value.item.enabled,
            dialogBtnFailed.value.item.text,
            dialogBtnFailed.value.item.comment,
            dialogBtnFailed.value.item.autoComment,
        )
    }

    closeButtonFailedDialog()
}

const openDialogDeleteCategory = category => {
    deleteCategory.value = {
        uid: category.uid,
        title: category.title,
        open: true,
    }
}

const closeDialogDeleteCategory = () => deleteCategory.value = {...defaultDeleteCategory}

const removeCategory = () => {
    jiraStorage.removeCategory(props.uuid, deleteCategory.value.uid)
    closeDialogDeleteCategory()
}

const categoryStartSort = checklist => sortChecklist.value = checklist
const categoryCancelSort = () => sortChecklist.value = null

const openCategory = uid => {
    categoryId.value = uid
    openChecklistDialog.value = true
}

const closeCategory = () => {
    categoryId.value = null
    openChecklistDialog.value = false
}

const categoryInsertBefore = item => {
    jiraStorage.categorySortBefore(props.uuid, sortChecklist.value.uid, item.uid)
}

const categoryInsertAfter = item => {
    jiraStorage.categorySortAfter(props.uuid, sortChecklist.value.uid, item.uid)
}
</script>

<template>
    <v-card flat>
        <v-card-text>
            <v-row>
                <v-col cols="12" sm="4" md="3">
                    <v-switch
                        v-model="checklist.enabled"
                        :label="text.enabled"
                        color="primary"
                    ></v-switch>
                </v-col>
                <v-col cols="12" sm="4" md="3">
                    <v-text-field
                        ref="name"
                        v-model="checklist.name"
                        :label="text.name"
                        counter="20"
                    ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" md="3">
                    <v-combobox
                        v-model="checklist.icon"
                        :items="icons"
                        label="Icon"
                    >
                        <template #selection="{ item }">
                            <v-icon :icon="'fas fa-' + item.value"></v-icon>
                            <span class="ms-2">{{ item.value }}</span>
                        </template>
                        <template #item="{bindProps, item}">
                            <v-list-item
                                v-bind="bindProps"
                                :prepend-icon="'fas fa-' + item.value"
                                :title="item.value"></v-list-item>
                        </template>
                    </v-combobox>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="4" md="3">
                    <h4>{{ text.buttons }}</h4>
                </v-col>
                <v-col cols="12" sm="4" md="3">
                    <h5>{{ text.success }}</h5>
                    <v-btn
                        :color="checklist.buttons.success.enabled ? 'primary' : 'secondary'"
                        variant="outlined"
                        prepend-icon="fas fa-check"
                        @click="openButtonSuccessDialog">
                        {{ '' !== checklist.buttons.success.text ? checklist.buttons.success.text : '__Text__' }}
                    </v-btn>
                    <v-dialog v-model="dialogBtnSuccess.open" max-width="600">
                        <v-card>
                            <v-card-title>{{ text.success }}</v-card-title>
                            <v-card-text>
                                <v-form ref="formBtnSuccess" v-model="dialogBtnSuccess.valid">
                                    <v-switch
                                        v-model="dialogBtnSuccess.item.enabled"
                                        color="primary"
                                        :label="text.buttonEnabled"
                                    ></v-switch>
                                    <v-text-field
                                        v-model="dialogBtnSuccess.item.text"
                                        :label="text.text"
                                        :rules="textRules"
                                        counter="15"
                                    ></v-text-field>
                                    <v-select
                                        v-model="dialogBtnSuccess.item.comment"
                                        :label="text.comment"
                                        :items="checklist.templates"
                                        item-title="title"
                                        item-value="id"
                                        :menu-props="{closeOnContentClick: true}"
                                    >
                                        <template #prepend-item>
                                            <v-list-item
                                                v-if="null !== dialogBtnSuccess.item.comment"
                                                @click="dialogBtnSuccess.item.comment = null"
                                            >
                                                <v-list-item-title>No Comment (TODO)</v-list-item-title>
                                            </v-list-item>
                                        </template>
                                    </v-select>
                                    <v-switch
                                        v-model="dialogBtnSuccess.item.autoComment"
                                        :label="text.sendCommentImmediately"
                                        color="primary"
                                    ></v-switch>
                                    <v-switch
                                        v-model="dialogBtnSuccess.item.successRequiredAll"
                                        :label="text.listCompletelyChecked"
                                        color="primary"
                                    ></v-switch>
                                </v-form>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                    variant="plain"
                                    color="secondary"
                                    plain
                                    @click="closeButtonSuccessDialog">{{ text.cancel }}
                                </v-btn>
                                <v-btn
                                    variant="plain"
                                    color="primary"
                                    :disabled="!dialogBtnSuccess.valid"
                                    @click="saveButtonSuccess">{{ text.save }}
                                </v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-col>
                <v-col cols="12" sm="4" md="3">
                    <h5>{{ text.failed }}</h5>
                    <v-btn
                        :color="checklist.buttons.failed.enabled ? 'tertiary' : 'grey'"
                        variant="outlined"
                        prepend-icon="fas fa-times"
                        @click="openButtonFailedDialog"
                    >
                        {{ '' !== checklist.buttons.failed.text ? checklist.buttons.failed.text : '__Text__' }}
                    </v-btn>
                    <v-dialog v-model="dialogBtnFailed.open" max-width="600">
                        <v-card>
                            <v-card-title>{{ text.failed }}</v-card-title>
                            <v-card-text>
                                <v-form ref="formBtnFailed" v-model="dialogBtnFailed.valid">
                                    <v-switch
                                        v-model="dialogBtnFailed.item.enabled"
                                        :label="text.buttonEnabled"
                                        color="primary"
                                    ></v-switch>
                                    <v-text-field
                                        v-model="dialogBtnFailed.item.text"
                                        :label="text.text"
                                        :rules="textRules"
                                        counter="15"
                                    ></v-text-field>
                                    <v-select
                                        v-model="dialogBtnFailed.item.comment"
                                        :label="text.comment"
                                        :items="templates"
                                        item-title="title"
                                        item-value="id"
                                    ></v-select>
                                    <v-switch
                                        v-model="dialogBtnFailed.item.autoComment"
                                        :label="text.sendCommentImmediately"
                                        color="primary"
                                    ></v-switch>
                                </v-form>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn variant="plain" color="grey" @click="closeButtonFailedDialog">{{
                                        text.cancel
                                    }}
                                </v-btn>
                                <v-btn
                                    variant="plain"
                                    color="primary"
                                    :disabled="!dialogBtnFailed.valid"
                                    @click="saveButtonFailed">{{ text.save }}
                                </v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <h4>{{ text.checklists }}</h4>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-data-table
                        :items="checklist.checklist"
                        :headers="categoriesHeader"
                        :sort-by="[{key: 'sort', order: 'asc'}]"
                        :items-per-page=-1
                        :hide-default-footer=true
                    >
                        <template #top>
                            <v-toolbar flat>
                                <v-spacer></v-spacer>
                                <v-btn
                                    variant="plain"
                                    prepend-icon="fas fa-plus"
                                    color="primary"
                                    @click="openCategory(null)">
                                    {{ text.add }}
                                </v-btn>
                                <v-dialog
                                    v-model="openChecklistDialog"
                                    fullscreen
                                    hide-overlay
                                >
                                    <InnerList
                                        :uuid="uuid"
                                        :uid="categoryId"
                                        :text="text"
                                        @close="closeCategory"></InnerList>
                                </v-dialog>
                                <v-dialog v-model="deleteCategory.open" max-width="450">
                                    <v-card>
                                        <v-card-title class="headline">
                                            {{ i18n.getMessage('TitleDelete', deleteCategory.title) }}
                                        </v-card-title>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn variant="plain" color="secondary" @click="closeDialogDeleteCategory">
                                                {{ text.cancel }}
                                            </v-btn>
                                            <v-btn variant="plain" color="tertiary" @click="removeCategory">
                                                {{ text.delete }}
                                            </v-btn>
                                            <v-spacer></v-spacer>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>
                            </v-toolbar>
                        </template>
                        <template #item.actions="{item}">
                            <v-btn
                                v-if="!sortChecklist"
                                variant="plain"
                                icon="fas fa-edit"
                                small
                                @click="openCategory(item.uid)"></v-btn>
                            <v-btn
                                v-if="!sortChecklist"
                                variant="plain"
                                icon="fas fa-sort"
                                size="small"
                                @click="categoryStartSort(item)"></v-btn>
                            <v-btn
                                v-if="!sortChecklist"
                                variant="plain"
                                icon="fas fa-trash"
                                size="small"
                                color="tertiary"
                                @click="openDialogDeleteCategory(item)"></v-btn>
                            <v-btn
                                v-if="sortChecklist && sortChecklist.uid !== item.uid"
                                variant="plain"
                                icon="fas fa-sort-up"
                                size="small"
                                :disabled="item.sort - 1 === sortChecklist.sort"
                                @click="categoryInsertBefore(item)"></v-btn>
                            <v-btn
                                v-if="sortChecklist && sortChecklist.uid !== item.uid"
                                variant="plain"
                                icon="fas fa-sort-down"
                                size="small"
                                :disabled="item.sort + 1 === sortChecklist.sort"
                                @click="categoryInsertAfter(item)"></v-btn>
                            <v-btn
                                v-if="sortChecklist && sortChecklist.uid === item.uid"
                                variant="plain"
                                icon="fas fa-times"
                                size="small"
                                @click="categoryCancelSort"></v-btn>
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>
