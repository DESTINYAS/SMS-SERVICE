import SMSService from './sms';
import axios, { AxiosError } from 'axios'


export default class TermiiSMSProvider extends SMSService {

    sendSMSAPIUrl: string | undefined
    apiKey: string | undefined

    constructor() {
        super();
        this.sendSMSAPIUrl = process.env.SMS_PROVIDER_API_URL_SEND_MESSAGE
        this.apiKey = process.env.SMS_PROVIDER_API_KEY
    }

    public async sendConfirmationMessage(phoneNumber: string, code: string, secondsToExpire: number, extras: object) {
        // * Convert to international format
        phoneNumber = "234" + phoneNumber.slice(1)

        let messageData = {}
        const message = `
        #<--->\nYour Boosta confirmation code is ${code}, active for ${secondsToExpire / 60} minutes. This is one-time use only.`

        var data = {
            "to": phoneNumber,
            "from": "N-Alert", // BOOSTA
            "sms": message,
            "type": "plain",
            "api_key": this.apiKey,
            "channel": "dnd",
        };

        if (this.sendSMSAPIUrl) {
            try {
                const response = await axios.post(this.sendSMSAPIUrl, JSON.stringify(data), {
                    headers: {
                        "Content-Type": 'application/json'
                    }
                })
                console.log(response.status);
                const messageID = response.data.message_id_str
                const code = response.data.code
                const balance = response.data.balance
                console.log(`Balance: ${balance}`)

                // const messageID = (Math.random() * 1000).toString()
                const messageData = {
                    "messageID": messageID,
                    "timeSent": new Date(),
                    "messageSent": true,
                    "extras": extras
                }
                return messageData

            } catch (error: any) {
                console.log(error.response.status)
                console.log(error.response.statusText)
                console.log(error.response.data.message)
            }
        }

        console.log("\n\nERROR!!: Unable to send sms")
    }

    public async checkSMSStatus(messageID: string) { }

}