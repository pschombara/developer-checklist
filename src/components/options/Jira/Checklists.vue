<template>
    <v-card flat class="ml-5">
        <v-card-text>
            <v-tabs
                v-model="tab"
                icons-and-text
                show-arrows
            >
                <v-tab
                    v-for="checklist in checklists"
                    :key="checklist.uuid"
                >
                    {{checklist.name}}
                    <v-icon v-if="!!checklist.icon">fas fa-{{checklist.icon}}</v-icon>
                    <v-icon v-else>fas fa-icons</v-icon>
                </v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab">
                <v-tab-item
                    v-for="checklist in checklists"
                    :key="checklist.uuid"
                >
                    <Checklist :uuid="checklist.uuid"></Checklist>
                </v-tab-item>
            </v-tabs-items>
        </v-card-text>
    </v-card>
</template>

<script>
import Checklist from '@/components/options/Jira/Checklists/Checklist'

export default {
    name: 'JiraChecklists',
    components: {Checklist},
    computed: {
        checklists() {
            return this.$store.getters['jira/getChecklists']
        },
    },
    data() {
        return {
            tab: null,
        }
    },
}
</script>
