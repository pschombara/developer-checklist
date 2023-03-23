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
                    <Checklist :uuid="checklist.uuid"></Checklist>
                </v-window-item>
            </v-window>
        </v-card-text>
    </v-card>
</template>

<script>
import Checklist from '@/components/options/Jira/Checklists/Checklist.vue'

export default {
    name: 'JiraChecklists',
    components: {Checklist},
    data() {
        return {
            tab: null,
        }
    },
    computed: {
        checklists() {
            return this.$store.getters['jira/getChecklists']
        },
    },
}
</script>
