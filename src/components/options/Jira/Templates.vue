<template>
    <v-card flat class="ml-5">
        <v-card-text>
            <v-row>
                <v-col>
                    <v-data-table
                        :items="templates"
                        :headers="templateHeaders"
                        :items-per-page="-1"
                        :item-class="activeSortClass"
                        :hide-default-footer="true"
                        :sort-by="['sort']"
                    >
                        <template v-slot:top>
                            <v-toolbar flat>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" @click="openTemplate(newTemplate)">
                                    <v-icon left x-small>fas fa-plus</v-icon>
                                    {{ text.newTemplate }}
                                </v-btn>
                                <v-dialog v-model="dialogEditTemplate" max-width="800">
                                    <v-card>
                                        <v-card-title>{{editTemplate.title}}</v-card-title>
                                        <v-card-text>
                                            <v-form v-model="editTemplate.valid" ref="templateForm">
                                                <v-text-field
                                                    counter="25"
                                                    :rules="titleRules"
                                                    v-model="editTemplate.title"></v-text-field>
                                                <v-text-field
                                                    counter="50"
                                                    :rules="subTitleRules"
                                                    v-model="editTemplate.subTitle"></v-text-field>
                                                <v-btn @click="addToContent('[ciBuilds]')">
                                                    <v-icon>fab fa-jenkins</v-icon>
                                                </v-btn>
                                                <v-btn @click="addToContent('[mergeRequests]')">
                                                    <v-icon>fab fa-gitlab</v-icon>
                                                </v-btn>
                                                <v-textarea
                                                    counter="500"
                                                    :rules="contentRules"
                                                    v-model="editTemplate.content"
                                                    v-on:keyup="keyUpTemplateContent"
                                                    v-on:mouseup="keyUpTemplateContent"
                                                    v-on:select="keyUpTemplateContent"></v-textarea>
                                            </v-form>
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="grey" plain @click="closeTemplate">{{ text.cancel }}</v-btn>
                                            <v-btn color="success" plain @click="updateTemplate" v-if="null !== editTemplate.id" :disabled="!editTemplate.valid">{{text.save}}</v-btn>
                                            <v-btn color="success" plain @click="addTemplate" v-else :disabled="!editTemplate.valid">{{text.add}}</v-btn>
                                            <v-spacer></v-spacer>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>
                                <v-dialog v-model="deleteTemplate" max-width="450">
                                    <v-card>
                                        <v-card-title>
                                            {{ i18n.getMessage('TitleDelete', templateToRemove.title) }}
                                        </v-card-title>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="grey" plain @click="closeRemoveTemplate">
                                                {{ text.cancel }}</v-btn>
                                            <v-btn color="error" plain @click="removeTemplate">
                                                {{ text.delete }}</v-btn>
                                            <v-spacer></v-spacer>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>
                            </v-toolbar>
                        </template>
                        <template v-slot:item.template="{ item }">
                            <div>{{ item.title }}</div>
                            <small class="text--secondary font-weight-light">{{ item.subTitle }}</small>
                        </template>
                        <template v-slot:item.actions="{ item }">
                            <v-btn icon small v-if="!sortTemplate" @click="openTemplate(item)">
                                <v-icon small>fas fa-edit</v-icon>
                            </v-btn>
                            <v-btn icon small v-if="!sortTemplate" @click="startSort(item)">
                                <v-icon small>fas fa-sort</v-icon>
                            </v-btn>
                            <v-btn icon small v-if="!sortTemplate" @click="openRemoveTemplate(item)">
                                <v-icon small color="red darken-2">fas fa-trash</v-icon>
                            </v-btn>
                            <v-btn icon small
                                   @click="insertBefore(item)"
                                   v-if="sortTemplate && sortTemplate.id !== item.id"
                                   :disabled="item.sort - 1 === sortTemplate.sort">
                                <v-icon small>fas fa-sort-up</v-icon>
                            </v-btn>
                            <v-btn icon small
                                   @click="insertAfter(item)"
                                   v-if="sortTemplate && sortTemplate.id !== item.id"
                                   :disabled="item.sort + 1 === sortTemplate.sort">
                                <v-icon small>fas fa-sort-down</v-icon>
                            </v-btn>
                            <v-btn icon small @click="cancelSort" v-if="sortTemplate && sortTemplate.id === item.id">
                                <v-icon small>fas fa-times</v-icon>
                            </v-btn>
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: 'JiraTemplates',
    methods: {
        openTemplate: function (template) {
            this.editTemplate = {
                currentTitle: null === template.id ? template.currentTitle : template.title,
                valid: null !== template.id,
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

            this.dialogEditTemplate = true
        },
        updateTemplate: function () {
            if (this.$refs.templateForm.validate()) {
                this.$store.dispatch('jira/updateTemplate', {
                    id: this.editTemplate.id,
                    title: this.editTemplate.title,
                    subTitle: this.editTemplate.subTitle,
                    content: this.editTemplate.content,
                })
            }

            this.closeTemplate()
        },
        addTemplate: function () {
            if (this.$refs.templateForm.validate()) {
                this.$store.dispatch('jira/addTemplate', {
                    title: this.editTemplate.title,
                    subTitle: this.editTemplate.subTitle,
                    content: this.editTemplate.content,
                })
            }

            this.closeTemplate()
        },
        closeTemplate: function () {
            this.dialogEditTemplate = false
        },
        openRemoveTemplate: function (template) {
            this.templateToRemove = {
                title: template.title,
                id: template.id,
            }
            this.deleteTemplate = true
        },
        closeRemoveTemplate: function () {
            this.deleteTemplate = false
            this.templateToRemove = {
                id: null,
                title: '',
            }
        },
        removeTemplate: function () {
            this.$store.dispatch('jira/removeTemplate', this.templateToRemove.id)
            this.closeRemoveTemplate()
        },
        checkDuplicated: function (value) {
            let templates = this.$store.getters['jira/templates']
            let result = templates.find(template => template.title === value)

            if (undefined === result) {
                return false
            }

            if (null === this.editTemplate.id) {
                return true
            }

            return this.editTemplate.title !== value
        },
        keyUpTemplateContent: function (e) {
            this.editTemplate.position = {
                start: e.target.selectionStart,
                end: e.target.selectionEnd,
            }
        },
        addToContent: function (text) {
            if (-1 === this.editTemplate.content
                && this.editTemplate.position.start === this.editTemplate.position.end) {
                this.editTemplate.content += text
            } else {
                let a = this.editTemplate.content

                this.editTemplate.content = a.substring(0, this.editTemplate.position.start)
                    + text
                    + a.substring(this.editTemplate.position.end)
            }
        },
        startSort: function (template) {
            this.sortTemplate = template
        },
        insertBefore: function (template) {
            this.$store.dispatch('jira/templateSortBefore', {
                current: this.sortTemplate.id,
                ref: template.id,
            })
        },
        insertAfter: function (template) {
            this.$store.dispatch('jira/templateSortAfter', {
                current: this.sortTemplate.id,
                ref: template.id,
            })
        },
        cancelSort: function () {
            this.sortTemplate = null
        },
        activeSortClass: function (template) {
            if (null === this.sortTemplate) {
                return ''
            }

            return template.id === this.sortTemplate.id ? 'primary' : ''
        },
    },
    computed: {
        templates: function () {
            return this.$store.getters['jira/templates']
        },
        templateHeaders: function () {
            return [
                { title: this.text.template, value: 'template', sortable: false},
                { title: '', value: 'actions', align: 'end', sortable: false},
            ]
        },
    },
    data() {
        return {
            text: {
                template: chrome.i18n.getMessage('Template'),
                templates: chrome.i18n.getMessage('Templates'),
                save: chrome.i18n.getMessage('Save'),
                cancel: chrome.i18n.getMessage('Cancel'),
                delete: chrome.i18n.getMessage('Delete'),
                add: chrome.i18n.getMessage('Add'),
                newTemplate: chrome.i18n.getMessage('NewTemplate'),
                createNewTemplate: chrome.i18n.getMessage('CreateNewTemplate'),
            },
            i18n: chrome.i18n,
            editTemplate: {
                currentTitle: chrome.i18n.getMessage('NewTemplate'),
                valid: false,
                id: null,
                title: '',
                subTitle: '',
                content: '',
                position: {
                    start: -1,
                    end: -1,
                },
                sort: -1,
            },
            newTemplate: {
                currentTitle: chrome.i18n.getMessage('NewTemplate'),
                valid: false,
                id: null,
                title: '',
                subTitle: '',
                content: '',
                position: {
                    start: -1,
                    end: -1,
                },
                sort: -1,
            },
            templateToRemove: {
                title: '',
                id: null,
            },
            titleRules: [
                value => !!value || chrome.i18n.getMessage('errNotBlank'),
                value => value.length <= 25 || chrome.i18n.getMessage('errMaxLength', '25'),
                value => false === this.checkDuplicated(value) || chrome.i18n.getMessage('errDuplicated'),
            ],
            subTitleRules: [
                value => value.length <= 50 || chrome.i18n.getMessage('errMaxLength', '50'),
            ],
            contentRules: [
                value => !!value || chrome.i18n.getMessage('errNotBlank'),
                value => value.length <= 500 || chrome.i18n.getMessage('errMaxLength', '500'),
            ],
            dialogEditTemplate: false,
            deleteTemplate: false,
            sortTemplate: null,
        }
    },
}
</script>
