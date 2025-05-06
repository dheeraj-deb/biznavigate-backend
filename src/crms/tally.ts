import axios from "axios";

class Tally {
    private tallyUrl: string;
    private tallyNetId: string;
    private tallyNetApiKey: string;
    private username: string;
    private password: string;
    private auth: { username: string; password: string } | null;
    private headers: Record<string, string>;
    private tallyNetApiUrl: string;

    constructor({ tallyUrl, tallyNetId, tallyNetApiKey, username, password }) {
        this.tallyUrl = tallyUrl;
        this.tallyNetId = tallyNetId;
        this.tallyNetApiKey = tallyNetApiKey;
        this.username = username;
        this.password = password;
        this.auth = username & password ? { username, password } : null;
        this.headers = {
            'Content-Type': 'text/xml; charset=utf-8',
        }
        this.tallyNetApiUrl = ''
    }

    async sendRequest(xmlRequest, retries = 3, timeout = 10000) {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                let response;
                if (this.tallyNetId && this.tallyNetApiKey) {
                    response = await axios.post(`${this.tallyNetApiUrl}/execute`, { tally_net_id: this.tallyNetId, api_key: this.tallyNetApiKey, xml_request: xmlRequest }, {
                        headers: {
                            'Content-Type': 'application/json',
                        }, timeout
                    })
                    return {
                        status: 200,
                        response: response.data.xml_response
                    }
                }
            } catch (error) {

            }
        }
    }
}