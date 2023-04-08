<template>
    <v-card class="mx-auto" flat>
        <v-card-text>
            <v-list>
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
                color="error"
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

<script>

export default {
    name: 'JiraChecklist',
    props: {
        uuid: {
            type: String,
            required: true,
        },
        issue: {
            type: String,
            required: true,
        },
    },
    data: () => {
        return {
            activeItem: null,
        }
    },
    computed: {
        checklist: function () {
            return this.$store.getters['jira/getChecklist'](this.uuid)
        },
        checked: function () {
            return this.$store.getters['issues/issue'](this.issue).checklist
        },
    },
    methods: {
        isChecked: function (uuid) {
            if (null === this.checked || false === Object.prototype.hasOwnProperty.call(this.checked, this.uuid)) {
                return false
            }

            return this.checked[this.uuid].includes(uuid)
        },
        checkGroupCompleted: function (uuid) {
            if (null === this.checked || false === Object.prototype.hasOwnProperty.call(this.checked, this.uuid)) {
                return false
            }

            const checklist = Object.values(this.checklist.checklist).find(elem => elem.uid === uuid)
            const entries = Object.values(checklist.items).map(elem => elem.id)

            return entries.every(val => this.checked[this.uuid].includes(val))
        },
        toggleCheck: function (id) {
            this.$store.dispatch('issues/toggleChecklistEntry', {
                issue: this.issue,
                uuid: this.uuid,
                id,
            })
        },
        addComment: function (button) {
            this.$store.dispatch('jira/addComment', {
                uuid: button.comment,
                autoComment: button.autoComment,
            })
        },
    },
}
</script>

<style scoped>
    .cursor-pointer {
        cursor: pointer;
    }
</style>
