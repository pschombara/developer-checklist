<script lang="ts" setup>

import {computed, ref} from 'vue'
import {useJiraStorage} from '@/stores/jira'

const jiraStorage = useJiraStorage()

const i18n = browser.i18n
const text = {
    template: i18n.getMessage('Template'),
    templates: i18n.getMessage('Templates'),
    save: i18n.getMessage('Save'),
    cancel: i18n.getMessage('Cancel'),
    delete: i18n.getMessage('Delete'),
    add: i18n.getMessage('Add'),
    newTemplate: i18n.getMessage('NewTemplate'),
    createNewTemplate: i18n.getMessage('CreateNewTemplate'),
}

const defaultTemplate = {
    currentTitle: i18n.getMessage('NewTemplate'),
    text: '',
    id: null,
    title: '',
    subTitle: '',
    content: '',
    position: {
        start: -1,
        end: -1,
    },
    sort: -1,
}

const editTemplate = ref({...defaultTemplate})
const newTemplate = ref({...defaultTemplate})

const templateToRemove = ref({
    title: '',
    id: null,
})

const titleRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
    value => value.length <= 25 || i18n.getMessage('errMaxLength', '25'),
    value => false === checkDuplicated(value) || i18n.getMessage('errDuplicated'),
]

const subTitleRules = [
    value => value.length <= 50 || i18n.getMessage('errMaxLength', '50'),
]

const contentRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
    value => value.length <= 500 || i18n.getMessage('errMaxLength', '500'),
]

const dialogEditTemplate = ref(false)
const deleteTemplate = ref(false)
const sortTemplate = ref(null)

const templates = computed(() => {
    return jiraStorage.getTemplates
})

const templateHeaders = [
    { title: text.template, key: 'template', sortable: false},
    { title: '', key: 'actions', align: 'end', sortable: false},
]

const openTemplate = template => {
    editTemplate.value = {
        currentTitle: null === template.id ? template.currentTitle : template.title,
        text: null === template.id ? text.add : text.save,
        id: template.id,
        title: template.title,
        subTitle: template.subTitle,
        content: template.content,
        position: {
            start: -1,
            end: -1,
        },
        sort: template.sort,
    }

    dialogEditTemplate.value = true
}

const closeTemplate = () => dialogEditTemplate.value = false

const saveTemplate = async event => {
    const result = await event

    if (false === result.valid) {
        return
    }

    if (null === editTemplate.value.id) {
        jiraStorage.addTemplate(
            editTemplate.value.title,
            editTemplate.value.subTitle,
            editTemplate.value.content,
        )
    } else {
        jiraStorage.updateTemplate(
            editTemplate.value.id,
            editTemplate.value.title,
            editTemplate.value.subTitle,
            editTemplate.value.content,
        )
    }

    closeTemplate()
}

const openRemoveTemplate = template => {
    templateToRemove.value = {title: template.title, id: template.id}
    deleteTemplate.value = true
}

const closeRemoveTemplate = () => {
    deleteTemplate.value = false
    templateToRemove.value = {id: null, title: ''}
}

const removeTemplate = () => {
    jiraStorage.removeTemplate(templateToRemove.value.id)
    closeRemoveTemplate()
}

const checkDuplicated = value => {
    const template = jiraStorage.getTemplates.find(template => template.title === value)

    if (undefined === template) {
        return false
    }

    if (null === editTemplate.value.id) {
        return true
    }

    return editTemplate.value.title !== value
}

const keyUpTemplateContent = e => {
    editTemplate.value.position = {
        start: e.target.selectionStart,
        end: e.target.selectionEnd,
    }
}

const addToContent = text => {
    if (-1 === editTemplate.value.content
        && editTemplate.value.position.start === editTemplate.value.position.end
    ) {
        editTemplate.value.content += text
    } else {
        const a = editTemplate.value.content

        editTemplate.value.content = a.substring(0, editTemplate.value.position.start)
            + text
            + a.substring(editTemplate.value.position.end)
    }
}

const startSort = template => sortTemplate.value = template
const cancelSort = () => sortTemplate.value = null

const insertBefore = template => {
    jiraStorage.templateSortBefore(sortTemplate.value.id, template.id)
}
const insertAfter = template => {
    jiraStorage.templateSortAfter(sortTemplate.value.id, template.id)
}
</script>

<template>
    <v-card flat class="ml-5">
        <v-card-text>
            <v-row>
                <v-col>
                    <v-data-table
                        :items="templates"
                        :headers="templateHeaders"
                        :items-per-page="-1"
                        :hide-default-footer="true"
                        :sort-by="[{key: 'sort', order: 'asc'}]"
                    >
                        <template #top>
                            <v-toolbar flat>
                                <v-spacer></v-spacer>
                                <v-btn
                                    variant="plain"
                                    prepend-icon="fas fa-plus"
                                    color="primary" @click="openTemplate(newTemplate)">
                                    {{ text.newTemplate }}
                                </v-btn>
                                <v-dialog v-model="dialogEditTemplate" max-width="800">
                                    <v-form
                                        validate-on="input"
                                        @submit.prevent="saveTemplate">
                                        <v-card>
                                            <v-card-title>{{editTemplate.title}}</v-card-title>
                                            <v-card-text>

                                                    <v-text-field
                                                        v-model="editTemplate.title"
                                                        counter="25"
                                                        :rules="titleRules"></v-text-field>
                                                    <v-text-field
                                                        v-model="editTemplate.subTitle"
                                                        counter="50"
                                                        :rules="subTitleRules"></v-text-field>
                                                    <v-btn
                                                        variant="flat"
                                                        icon="fab fa-jenkins"
                                                        size="small"
                                                        class="me-2 mb-2"
                                                        @click="addToContent('[ciBuilds]')"></v-btn>
                                                    <v-btn
                                                        variant="flat"
                                                        icon="fab fa-gitlab"
                                                        size="small"
                                                        class="mb-2"
                                                        @click="addToContent('[mergeRequests]')"></v-btn>
                                                    <v-textarea
                                                        v-model="editTemplate.content"
                                                        counter="500"
                                                        :rules="contentRules"
                                                        @keyup="keyUpTemplateContent"
                                                        @mouseup="keyUpTemplateContent"
                                                        @select="keyUpTemplateContent"></v-textarea>
                                            </v-card-text>
                                            <v-card-actions>
                                                <v-spacer></v-spacer>
                                                <v-btn
                                                    variant="plain"
                                                    color="secondary"
                                                    @click="closeTemplate">{{ text.cancel }}</v-btn>
                                                <v-btn
                                                    type="submit"
                                                    variant="plain"
                                                    color="success">{{text.save}}</v-btn>
                                                <v-spacer></v-spacer>
                                            </v-card-actions>
                                        </v-card>
                                    </v-form>
                                </v-dialog>
                                <v-dialog v-model="deleteTemplate" max-width="450">
                                    <v-card>
                                        <v-card-title>
                                            {{ i18n.getMessage('TitleDelete', templateToRemove.title) }}
                                        </v-card-title>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn
                                                variant="plain"
                                                color="secondary"
                                                @click="closeRemoveTemplate">
                                                {{ text.cancel }}</v-btn>
                                            <v-btn
                                                variant="plain"
                                                color="tertiary"
                                                @click="removeTemplate">
                                                {{ text.delete }}</v-btn>
                                            <v-spacer></v-spacer>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>
                            </v-toolbar>
                        </template>
                        <template #item.template="{ item }">
                            <div>{{ item.title }}</div>
                            <small class="text--secondary font-weight-light">{{ item.subTitle }}</small>
                        </template>
                        <template #item.actions="{ item }">
                            <v-btn
                                v-if="!sortTemplate"
                                variant="plain"
                                icon="fas fa-edit"
                                size="small"
                                @click="openTemplate(item)"></v-btn>
                            <v-btn
                                v-if="!sortTemplate"
                                variant="plain"
                                icon="fas fa-sort"
                                size="small"
                                @click="startSort(item)"></v-btn>
                            <v-btn
                                v-if="!sortTemplate"
                                variant="plain"
                                icon="fas fa-trash"
                                size="small"
                                color="tertiary"
                                @click="openRemoveTemplate(item)"></v-btn>
                            <v-btn
                                v-if="sortTemplate && sortTemplate.id !== item.id"
                                variant="plain"
                                icon="fas fa-sort-up"
                                size="small"
                                :disabled="item.sort - 1 === sortTemplate.sort"
                                @click="insertBefore(item)"></v-btn>
                            <v-btn
                                v-if="sortTemplate && sortTemplate.id !== item.id"
                                variant="plain"
                                icon="fas fa-sort-down"
                                size="small"
                                :disabled="item.sort + 1 === sortTemplate.sort"
                                @click="insertAfter(item)"> </v-btn>
                            <v-btn
                                v-if="sortTemplate && sortTemplate.id === item.id"
                                variant="plain"
                                icon="fas fa-times"
                                size="small"
                                @click="cancelSort"></v-btn>
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>
