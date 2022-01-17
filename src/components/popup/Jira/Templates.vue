<template>
    <v-card flat>
        <v-card-text>
            <v-autocomplete
                :items="templates"
                item-text="title"
                return-object
                v-model="template"
                :label="text.templates"
                dense
            >
            </v-autocomplete>
            <v-textarea
                readonly
                :value="template.content"
                :label="text.preview"
                height="200"
                no-resize
                v-if="template"
                class="mt-0"
            ></v-textarea>
        </v-card-text>
        <v-card-actions v-if="template">
            <v-spacer></v-spacer>
            <v-btn @click="addComment" outlined color="success">{{ text.comment }}</v-btn>
            <v-spacer></v-spacer>
        </v-card-actions>
    </v-card>
</template>

<script>
export default {
    name: 'Templates',
    computed: {
        templates: function () {
            return this.$store.getters['jira/templates']
        },
    },
    created() {
        if (this.templates.length > 0) {
            this.template = this.templates[0]
        }
    },
    methods: {
        addComment: function () {
            this.$store.dispatch('jira/addComment', {
                uuid: this.template.id,
                autoComment: false,
            })
        },
    },
    data() {
        return {
            text: {
                templates: chrome.i18n.getMessage('Templates'),
                preview: chrome.i18n.getMessage('Preview'),
                comment: chrome.i18n.getMessage('Comment'),
            },
            template: null,
        }
    },
}
</script>
