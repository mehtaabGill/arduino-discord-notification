require('dotenv').config()

module.exports = (message) => {
    if(!message) return;
    //CHECK MESSAGE TYPE
    //WE WILL CHECK FOR 'MESSAGE_CREATE WHICH IS DISCORD'S NEW MESSAGE SIGNAL
    //ALSO CHECK THAT THE MESSAGE WAS NOT CREATED BY THE USER THEMSELVES
    if(message.t == 'MESSAGE_CREATE' && message.d.author.id != process.env.DISCORD_ID) {
        //DETERMINE IF WE SHOULD SEDND A SIGNAL OR NOT
        const pingsEveryone = message.d.mention_everyone;
        //DEFINE THE CASES OF WHEN THE MESSAGE SHOULD BE IGNORED
        if(pingsEveryone && process.env.SUPRESS_EVERYONE_PINGS == 'yes') {
            return false;
        }

        console.log(`[${new Date(Date.now()).toUTCString()}] New message from: ${message.d.author.username}#${message.d.author.discriminator} | Contents: ${message.d.content} | Server: ${message.d.guild_id || 'Direct Message'}`);
        return true;
    }
}