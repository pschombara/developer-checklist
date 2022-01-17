export class Google {
    static format(msg, issues, jiraUrl){
        let formattedMessage = {
            text: msg,
        }

        if (issues.length > 0) {
            formattedMessage.cards = [
                {
                    header: {
                        title: 'Issues',
                    },
                    sections: [
                        {
                            widgets: [],
                        },
                    ],
                },
            ]
        }

        for (let issue of issues) {
            formattedMessage.cards[0].sections[0].widgets.push({
                buttons: {
                    textButton: {
                        text: issue,
                        onClick: {
                            openLink: {
                                url: `${jiraUrl}/browse/${issue}`,
                            },
                        },
                    },
                },
            })
        }

        return JSON.stringify(formattedMessage)
    }
}
