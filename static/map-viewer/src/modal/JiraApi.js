import { view, requestJira } from '@forge/bridge';

let fieldId = null
let issueKey = null

const JiraApi = {
    async saveLocationData(data) {
        if (!fieldId || !issueKey) {
            return
        }

        let res = await requestJira(`/rest/api/3/issue/${issueKey}`, {
            method: "PUT",
            body: JSON.stringify({
                fields: {
                    [fieldId]: data
                }
            })
        });

        if (!res.ok) {
            return Promise.reject()
        }
    },

    async getLocationData() {
        const {extension, localId} = await view.getContext();

        issueKey = extension.issue.key;

        const response = await requestJira(`/rest/api/3/issue/${issueKey}/editmeta`);

        const fieldKey = localId.split("/").slice(0, -1).join("/") + "/location-tracker"
        fieldId = Object.keys(response.body.fields).find(v => response.body.fields[v].schema.custom === fieldKey)

        if (!fieldId) {
            return Promise.reject("FIELD_UNAVAILABLE")
        }

        const response2 = await requestJira(`/rest/api/3/issue/${issueKey}`);
        return response2.body.fields[fieldId]
    }
}

export default JiraApi