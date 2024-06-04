
import * as dotenv from 'dotenv'
dotenv.config()

import { Connection, Channel, ConsumeMessage, connect } from 'amqplib'
import TermiiSMSProvider from './sms/termii.sms'


const RABBITMQ_USERNAME = process.env.RABBITMQ_USERNAME
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD
const RABBITMQ_HOST_AND_PORT = process.env.RABBITMQ_HOST_AND_PORT

const sendConfirmationCodeConsumer = (channel: Channel) => async (msg: ConsumeMessage | null): Promise<void> => {
    if (msg) {
        let confirmationInfo = JSON.parse(msg.content.toString())
        if (confirmationInfo) {
            confirmationInfo = confirmationInfo.data
            const reply_to_queue = confirmationInfo.reply_to_queue
            const phoneNumber = confirmationInfo.phoneNumber
            const confirmationCode = confirmationInfo.value
            const secondsToExpire = confirmationInfo.secondsToExpire
            const extras = confirmationInfo.extras

            let messageData: { messageID: any; timeSent: Date; messageSent: boolean; extras: object } | undefined;
            if (process.env.SMS_PROVIDER == 'LOCAL') {
                console.log(`Confirmation Code ${confirmationCode}`)
                messageData = {
                    messageID: (Math.random() * 100).toString(),
                    timeSent: new Date(),
                    messageSent: true,
                    extras: extras
                }
            }
            else if (process.env.SMS_PROVIDER == 'TERMII') {
                const smsService = new TermiiSMSProvider()
                messageData = await smsService.sendConfirmationMessage(phoneNumber, confirmationCode, secondsToExpire, extras)
            }

            if (messageData) {
                channel.ack(msg)
            }
            const messageToQueue = {
                // id: messageData?.messageID,
                pattern: "message-sent", data: {
                    ...messageData
                }
            }
            console.log(messageToQueue)
            const replied = channel.sendToQueue(reply_to_queue, Buffer.from(JSON.stringify({
                ...messageToQueue

            })))
            if (!replied) console.log(`Unable to reply back to ${reply_to_queue} `)
        }
    }
}

const start = async () => {

    const connection: Connection = await connect(`amqps://${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST_AND_PORT}`)

    // create a channel
    const channel: Channel = await connection.createChannel()

    // makes the queue available to clients
    await channel.assertQueue("messaging-queue")

    // Start the consumer
    await channel.consume("messaging-queue", sendConfirmationCodeConsumer(channel))

}

start()