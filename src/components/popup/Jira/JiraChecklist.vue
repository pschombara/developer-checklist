<script setup>

import {computed, ref} from 'vue'
import {useJiraStorage} from '../../../stores/jira.js'
import {useIssueStorage} from '../../../stores/issues.js'

const props = defineProps({
    uuid: {
        type: String,
        required: true,
    },
    issue: {
        type: String,
        required: true,
    },
})

const jiraStorage = useJiraStorage()
const issueStorage = useIssueStorage()

const checklist = computed(() => jiraStorage.getChecklist(props.uuid))
const checked = computed(() => issueStorage.getIssue(props.issue).checklist)

const isChecked = uuid => {
    if (null === checked.value || undefined === checked.value[props.uuid]) {
        return false
    }

    return checked.value[props.uuid].includes(uuid)
}

const checkGroupCompleted = uuid => {
    if (null === checked.value || undefined === checked.value[props.uuid]) {
        return false
    }

    const data = Object.values(checklist.value.checklist).find(item => item.uid === uuid)
    const entries = Object.values(data.items).map(item => item.id)

    return entries.every(val => checked.value[props.uuid].includes(val))
}

// export default {
//     methods: {
//         toggleCheck: function (id) {
//             this.$store.dispatch('issues/toggleChecklistEntry', {
//                 issue: this.issue,
//                 uuid: this.uuid,
//                 id,
//             })
//         },
//         addComment: function (button) {
//             this.$store.dispatch('jira/addComment', {
//                 uuid: button.comment,
//                 autoComment: button.autoComment,
//             })
//         },
//     },
// }
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
                    <template #activator="{ data }">
                        <v-list-item
                            v-bind="data"
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
            <v-btn color="grey" outlined>
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
