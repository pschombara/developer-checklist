<template>
    <v-card class="mx-auto" flat>
        <v-card-text>
            <v-autocomplete
                v-model="template"
                :items="templates"
                item-title="title"
                return-object
                :label="text.templates"
                dense
            >
            </v-autocomplete>

            <h5 v-if="template">{{text.preview}}</h5>
            <pre
                v-if="template"
                style="max-height: 200px;"
                class="elevation-1 overflow-y-auto overflow-x-hidden py-4 px-2 text-pre-wrap"
            >{{template.content}}</pre>
        </v-card-text>
        <v-card-actions v-if="template">
            <v-spacer></v-spacer>
            <v-btn variant="outlined" color="primary" @click="addComment">{{ text.comment }}</v-btn>
            <v-btn variant="outlined" color="secondary" @click="copyComment"><v-icon>fas fa-copy</v-icon></v-btn>
            <v-spacer></v-spacer>
        </v-card-actions>

        <copied-to-clipboard ref="message"></copied-to-clipboard>
    </v-card>
</template>

<script>
import CopiedToClipboard from '../mixed/CopiedToClipboard.vue'

export default {
    name: 'JiraTemplates',
    components: {CopiedToClipboard},
    data() {
        return {
            text: {
                templates: chrome.i18n.getMessage('Templates'),
                preview: chrome.i18n.getMessage('Preview'),
                comment: chrome.i18n.getMessage('Comment'),
                copy: chrome.i18n.getMessage('Copy'),
            },
            template: null,
        }
    },
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
        copyComment: function () {
            let comment = this.$store.getters['jira/getTemplate'](this.template.id).content

            this.$store.dispatch('jira/commentReplacePlaceholders', comment)
                .then(result => {
                    let blob = new Blob([result], {type: 'text/html'})

                    navigator.clipboard.write(
                        [
                            new ClipboardItem({[blob.type]: blob}),
                        ],
                    ).then(() => {
                        this.$refs.message.show()
                    })
                })
        },
    },
}
</script>
