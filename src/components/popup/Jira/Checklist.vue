<template>
    <v-card flat>
        <v-card-text>
            <v-list>
                <v-list-group
                    v-for="item in checklist.checklist"
                    :key="item.uid"
                    :value="item"
                >
                    <template v-slot:activator="{props}">
                        <v-list-item v-bind="props">
                            <template v-slot:prepend>
                                <v-icon small color="success" v-if="checkGroupCompleted(item.uid)">fas fa-check</v-icon>
                            </template>
                            <v-list-item-title :class="(checkGroupCompleted(item.uid) ? 'text-decoration-line-through' : '')" :v-text="item.title"></v-list-item-title>
                        </v-list-item>
                    </template>
                    <v-list-item
                        v-for="entry in item.items"
                        :key="entry.id"
                        :value="entry"
                    >
                        <template v-slot:prepend>
                            <v-icon small color="success" v-if="isChecked(entry.id)">fas fa-check</v-icon>
                        </template>
                        <v-list-item-title :class="'cursor-pointer text-wrap' + (isChecked(entry.id) ? ' text-decoration-line-through' : '')" :v-text="entry.text" @click="toggleCheck(entry.id)" ></v-list-item-title>
                    </v-list-item>
                </v-list-group>
            </v-list>
        </v-card-text>
        <v-card-actions>
            <v-btn
                color="primary"
                outlined
                v-if="checklist.buttons.success.enabled"
                @click="addComment(checklist.buttons.success)"
            >
                <v-icon left>fas fa-check</v-icon>
                {{checklist.buttons.success.text}}
            </v-btn>
            <v-btn
                color="error"
                outlined
                v-if="checklist.buttons.failed.enabled"
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

            const checklist = this.checklist.checklist.find(elem => elem.uid === uuid)
            const entries = checklist.items.map(elem => elem.id)

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
    data: () => {
        return {
            activeItem: null,
        }
    },
}
</script>

<style scoped>
    .cursor-pointer {
        cursor: pointer;
    }
</style>
