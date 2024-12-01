export class Discord {
    static format (msg: string, issues: string[], jiraUrl: string, name: string) {
        const field = {
            name: 'Issues',
            value: '',
        }

        for (let issue of issues) {
            field.value += `[${issue}](${jiraUrl}/browse/${issue})\n`
        }

        const data = {
            content: msg,
            allowed_mentions: {
                parse: ['everyone'],
            },
        }

        if ('' !== name) {
            data['username'] = name + ' (Checklist)'
        }

        if ('' !== field.value) {
            data['embeds'] = [
                {
                    color: 1668818,
                    fields: [field],
                },
            ]
        }

        return JSON.stringify(data)
    }
}
