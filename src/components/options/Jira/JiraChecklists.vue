<script setup>
import {computed, ref} from 'vue'
import {useJiraStorage} from '../../../stores/jira.ts'
import ChecklistData from './Checklists/ChecklistData.vue'

const tab = ref(null)
const jiraStorage = useJiraStorage()

const checklists = computed(() => {
    return jiraStorage.getChecklists
})
</script>


<template>
    <v-card flat class="ml-5">
        <v-card-text>
            <v-tabs
                v-model="tab"
                stacked
                show-arrows
            >
                <v-tab
                    v-for="checklist in checklists"
                    :key="checklist.uuid"
                >
                    <v-icon v-if="!!checklist.icon" class="mb-2" :icon="'fas fa-' + checklist.icon"/>
                    <v-icon v-else class="mb-2" icon="fas fa-icons" />
                    {{checklist.name}}
                </v-tab>
            </v-tabs>
            <v-window v-model="tab">
                <v-window-item
                    v-for="checklist in checklists"
                    :key="checklist.uuid"
                >
                    <ChecklistData :uuid="checklist.uuid" />
                </v-window-item>
            </v-window>
        </v-card-text>
    </v-card>
</template>
