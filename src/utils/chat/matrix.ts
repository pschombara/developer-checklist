export class Matrix {
    static format (msg: string, issues: string[], jiraUrl: string, name: string) {
        const data = {
            text: '',
        };

        if ('' !== name) {
            data.username = `${name} (Checklist)`
        }

        if (issues.length > 0) {
            msg = `
            ${msg}`

            for (const issue of issues) {
                msg += `  
                - [${issue}](${jiraUrl}/browse/${issue})`
            }
        }

        data.text = msg

        return JSON.stringify(data);
    }
}
