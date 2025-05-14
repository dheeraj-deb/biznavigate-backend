import axios from "axios";

export class Tally {
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
                    console.info(`Tally.NET request for ${this.tallyNetId}: Success`)
                    return {
                        status: 200,
                        response: response.data.xml_response
                    }
                } else if (this.tallyUrl) {
                    response = await axios.post(this.tallyUrl, {
                        headers: this.headers,
                        auth: this.auth,
                        timeout
                    })
                    console.info(`Request to ${this.tallyUrl}: Success (Status ${response.status})`)
                    return { status: 'success', response: response.data };
                }
                throw new Error('No valid connection method configured');
            } catch (error) {
                console.error(`Request ${this.tallyNetId || this.tallyUrl}: Attempt ${attempt + 1} failed - ${error.message}`);
                if (attempt === retries - 1) {
                    return { status: 'error', message: `Failed to connect to Tally: ${error.message}` };
                }
            }
        }
    }

}