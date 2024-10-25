<script setup>
import {computed, ref} from 'vue'
import {useJiraStorage} from '../../stores/jira.ts'
import JiraChecklists from './Jira/JiraChecklists.vue'
import JiraGeneral from './Jira/JiraGeneral.vue'
import JiraTemplates from './Jira/JiraTemplates.vue'
import IssueList from './Jira/IssueList.vue'
import Debounce from '../../utils/debounce.ts'

const jiraStorage = useJiraStorage()
const i18n = browser.i18n
const loaded = computed(() => {
    return jiraStorage.isLoaded
})

const text = {
    general: browser.i18n.getMessage('General'),
    checklists: browser.i18n.getMessage('Checklists'),
    templates: browser.i18n.getMessage('Templates'),
    issues: 'Issues',
}

const tab = ref(null)
const debounce = new Debounce()

jiraStorage.$subscribe(() => {
    if (loaded.value) {
        debounce.debounce(jiraStorage.save)
    }
})

jiraStorage.load()
</script>

<template>
    <v-card fluid class="mt-5">
        <div class="d-flex flex-row">
            <v-tabs
                v-model="tab"
                direction="vertical"
            >
                <v-tab class="mt-5" value="general">
                    <v-row align="center">
                        <v-col class="text-start">
                            <v-icon icon="fas fa-sliders-h" />
                        </v-col>
                        <v-col class="text-center">
                            {{ text.general }}
                        </v-col>
                    </v-row>
                </v-tab>
                <v-tab class="mt-5" value="checklists">
                    <v-row align="center">
                        <v-col class="text-start">
                            <v-icon icon="fas fa-tasks" />
                        </v-col>
                        <v-col class="text-center">
                            {{ text.checklists }}
                        </v-col>
                    </v-row>
                </v-tab>
                <v-tab class="mt-5" value="templates">
                    <v-row align="center">
                        <v-col class="text-start">
                            <v-icon icon="fas fa-clipboard" />
                        </v-col>
                        <v-col class="text-center">
                            {{ text.templates }}
                        </v-col>
                    </v-row>
                </v-tab>
                <v-tab class="mt-5" value="issues">
                    <v-row align="center">
                        <v-col class="text-start">
                            <v-icon icon="fas fa-history" />
                        </v-col>
                        <v-col class="text-center">
                            {{ text.issues }}
                        </v-col>
                    </v-row>
                </v-tab>

            </v-tabs>

            <v-window v-model="tab" class="flex-fill">
                <v-window-item value="general">
                    <JiraGeneral />
                </v-window-item>
                <v-window-item value="checklists">
                    <JiraChecklists />
                </v-window-item>
                <v-window-item value="templates">
                    <JiraTemplates />
                </v-window-item>
                <v-window-item value="issues">
                    <IssueList />
                </v-window-item>
            </v-window>
        </div>
    </v-card>
</template>
