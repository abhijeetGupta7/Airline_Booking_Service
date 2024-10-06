const amqplib = require('amqplib');

let connection,channel;

async function connectQueue() {
    try {
        connection=await amqplib.connect("amqp://localhost");
        channel=await connection.createChannel();
        await channel.assertQueue("noti-queue");
    } catch (error) {
        console.log(error);
    }
}

async function sendMessage(queue="noti-queue",message) {
    try {
        console.log(message);
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports={
    connectQueue,
    sendMessage
}