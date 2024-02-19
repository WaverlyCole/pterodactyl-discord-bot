const { Client, Intents, Collection } = require('discord.js')

const bot = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.Flags.GUILD_VOICE_STATES
    ] 
});

module.exports = {
    bot: bot
};