<script lang="ts" setup>

import {computed} from 'vue'
import {useJiraStorage} from '@/stores/jira.js'
import {useIssueStorage} from '@/stores/issues.js'

const property = defineProps<{
    uuid: string,
    issue: string
}>()

const jiraStorage = useJiraStorage()
const issueStorage = useIssueStorage()

const checklist = computed(() => jiraStorage.getChecklist(property.uuid))
const checked = computed(() => issueStorage.getIssue(property.issue).checklist)

const isChecked = uuid => {
    if (null === checked.value || undefined === checked.value[property.uuid]) {
        return false
    }

    return checked.value[property.uuid].includes(uuid)
}

const checkGroupCompleted = uuid => {
    if (null === checked.value || undefined === checked.value[property.uuid]) {
        return false
    }

    const data = Object.values(checklist.value.checklist).find(item => item.uid === uuid)
    const entries = Object.values(data.items).map(item => item.id)

    return entries.every(val => checked.value[property.uuid].includes(val))
}

const toggleCheck = id => issueStorage.toggleChecklistEntry(property.issue, property.uuid, id)
const addComment = button => jiraStorage.addComment(button.comment, button.autoComment)
const redo = () => issueStorage.clearChecklist(property.issue)
</script>

<template>
    <v-card class="mx-auto" flat>
        <v-card-text>
            <v-list density="compact">
                <v-list-group
                    v-for="item in checklist.checklist"
                    :key="item.uid"
                    :value="item.title"
                >
                    <template #activator="{ props }">
                        <v-list-item
                            v-bind="props"
                        >
                            <template #prepend>
                                <v-icon v-if="checkGroupCompleted(item.uid)" small color="success">fas fa-check</v-icon>
                                <v-icon v-else small color="grey">fas fa-check</v-icon>
                            </template>
                            <template #title>
                                <span :class="(checkGroupCompleted(item.uid) ? 'text-decoration-line-through' : '')">
                                    {{ item.title }}
                                </span>
                            </template>
                        </v-list-item>
                    </template>

                    <v-list-item
                        v-for="entry in item.items"
                        :key="entry.id"
                        :title="entry.text"
                        :value="entry.id"
                        @click="toggleCheck(entry.id)"
                    >
                        <template #prepend>
                            <v-icon v-if="isChecked(entry.id)" small color="success">fas fa-check</v-icon>
                            <v-icon v-else small color="grey">fas fa-check</v-icon>
                        </template>
                        <template #title>
                            <span :class="'cursor-pointer text-wrap' + (isChecked(entry.id) ? ' text-decoration-line-through' : '')">
                                {{ entry.text }}
                            </span>
                        </template>
                    </v-list-item>
                </v-list-group>
            </v-list>
        </v-card-text>
        <v-card-actions>
            <v-btn
                v-if="checklist.buttons.success.enabled"
                color="primary"
                variant="outlined"
                @click="addComment(checklist.buttons.success)"
            >
                <v-icon left>fas fa-check</v-icon>
                {{checklist.buttons.success.text}}
            </v-btn>
            <v-btn
                v-if="checklist.buttons.failed.enabled"
                color="secondary"
                variant="outlined"
                @click="addComment(checklist.buttons.failed)"
            >
                <v-icon left>fas fa-times</v-icon>
                {{checklist.buttons.failed.text}}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="secondary" outlined @click="redo">
                <v-icon left>fas fa-redo</v-icon>
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<style scoped>
    .cursor-pointer {
        cursor: pointer;
    }
</style>
