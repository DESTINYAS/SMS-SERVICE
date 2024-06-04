export default abstract class SMSService {

    sendSMSAPIUrl: string | undefined

    constructor() {
    }

    public async sendConfirmationMessage(phoneNumber: string, code: string, secondsToExpire: number, extras: object): Promise<any> { }

    public async checkSMSStatus(messageID: string): Promise<any> { }
}