const zlib = require('zlib-sync');
require('dotenv').config();
const messageHandler = require('./handleMessage');

//CREATE THE INFLATE CONFIG FOR ZLIB DECOMPRESSION
let inflate = new zlib.Inflate({
    chunkSize: 65535,
    flush: zlib.Z_SYNC_FLUSH,
    to: 'json',
});

function setupClient(client, messageCallback) {
    client.on('open', () => {
        // DATA REQUIRED BY THE DISCORD API
        const authJson = {
            "op":2,
            "d":{
                "token":process.env.DISCORD_TOKEN,
                "capabilities":29,
                "properties":{
                    "os":"Windows",
                    "browser":"Chrome",
                    "device":"",
                    "browser_user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Safari/537.36",
                    "browser_version":"83.0.4103.106",
                    "os_version":"10",
                    "referrer":"https://discord.com/",
                    "referring_domain":"discord.com",
                    "referrer_current":"",
                    "referring_domain_current":"",
                    "release_channel":"stable",
                    "client_build_number":61633,
                    "client_event_source":null
                },
                "presence":{
                    "status":"invisible",
                    "since":0,
                    "activities":[
            
                    ],
                    "afk":false
                },
                "compress":false,
                "client_state":{
                    "guild_hashes":{
            
                    },
                    "highest_last_message_id":"0",
                    "read_state_version":0,
                    "user_guild_settings_version":-1
                }
            }
        }

        //THIS DATA IS SENT AS IT IS REQUIRED BY THE DISCORD API TO INITIALIZE NEW SOCKET CONNECTIONS
        client.send(JSON.stringify(authJson))
    });

    client.on('message', (data) => {
        try {
            let message = JSON.parse(decodeData(data)); //DECODE THE BINARY DATA RECEIVED BY THE SOCKET
            
            if(messageHandler(message)) { //messageHandler IS A CALLBACK TO VERIFY THAT THE MESSAGE SHOULD INDEED CAUSE A NOTIFICATION
                messageCallback();
            }

        } catch (err) {
            console.log(err);
        }
    })
}

function decodeData(data) {
    let json = JSON.parse(JSON.stringify(data));

    data = new Uint8Array(json.data);
    
    let raw;
    // ZLIB DECODING ALGORITHM FROM "discord.js" (https://github.com/discordjs/discord.js)
    // https://github.com/discordjs/discord.js/blob/405b487dc3475ea077dcd3f6734a5a01321021dd/src/client/websocket/WebSocketShard.js#L282
    const l = data.length;
    const flush = l >= 4 && data[l - 4] === 0x00 && data[l - 3] === 0x00 && data[l - 2] === 0xff && data[l - 1] === 0xff;

    inflate.push(data, flush && zlib.Z_SYNC_FLUSH);
    if (!flush) return;
    raw = inflate.result;
    return raw;
}

module.exports = setupClient;