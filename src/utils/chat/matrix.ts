export class Matrix {
    static format (msg: string, issues: string[], jiraUrl: string, name: string) {
        if ('' !== name) {
            msg = `${name} (Checklist)
            ${msg}`
        }

        if (issues.length > 0) {
            msg = `
            ${msg}`

            for (const issue in issues) {
                msg += `
                - [${issue}](${jiraUrl}/browse/${issue})`
            }
        }

        return JSON.stringify(
            {
                "version": "v2",
                "plain": msg,
                "mentions": {
                    "room": true
                }
            }
        );
    }
}
