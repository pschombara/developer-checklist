import semver from 'semver'

export class V0_6_0 {
    constructor() {
        this.version = '0.6.0'

        this.checklistsUuids = {
            0: '954a37f5-d1f4-459e-a325-cd0c7bbe55ee',
            1: '66a78c0f-0214-4dd5-aa43-ca00bf44b8ed',
            2: 'dda87df8-66ca-4b1c-af6f-b7875d549f97',
            3: '34184b6b-4bed-487e-963e-6b6244022974',
            4: '52da1f46-8114-43c5-84c0-ccef34383df9',
        }
    }


    supports = version => {
        return semver.lt(version, this.version)
    }

    migrate = issue => {
        issue.version = this.version
        issue.pinned = false
        issue.work = false
        issue.mergeRequests = []
        issue.ciBuilds = []

        let checklist = {}

        for (let [key, values] of Object.entries(issue.checklist)) {
            if (values.length > 0) {
                checklist[this.checklistsUuids[key]] = values
            }
        }

        issue.checklist = checklist
    }
}
