const five = require('johnny-five');
require('dotenv').config();
const setupClient = require('./discordMonitor');
const ws = require('ws');

//INITIALIZE THE ARDUINO BOARD
const board = new five.Board({
    port: process.env.BOARD_PORT
})


board.on('ready', () => {

    const led = new five.Led(parseInt(process.env.LCD_PIN));
    led.off(); //ENSURE THAT THE LED IS OFF ON STARTUP

    const buzzer = new five.Piezo(parseInt(process.env.PIEZO_PIN));

    let client = new ws('wss://gateway.discord.gg/?encoding=json&v=6&compress=zlib-stream'); //INITIALIZE THE WEBSOCKET CONNECTION TO DISCORD'S SERVER

    //THIS IS REQUIRED BY THE DISCORD API TO AVOID TIMEOUTS. THIS MESSAGE IS SENT EVERY 40 SECONDS AS A HEARTBEAT
    //https://discord.com/developers/docs/topics/gateway#heartbeating
    setInterval(() => {
        client.send('{"op":1,"d":3}');
    }, 40000);

    //SETUP THE SOCKET SERVER WITH THE SPECIFIED CALLBACK FOR WHEN A MESSAGE IS RECEIVED
    setupClient(client, () => {
        led.on(); //TURN LED ON

        //THIS SOMEWHAT RESEMBLES THE STANDARD DISCORD NOTIFICATION SOUND
        const discord_notification_sound = {
            song: 'G4 C5',
            beats: 1 / 4,
            tempo: 100
        }
        buzzer.play(discord_notification_sound);

        setTimeout(() => {
            led.off();
        }, 1000);
    });
});  