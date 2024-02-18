module.exports = {
    config: {
        name: 'setkey',
        description: 'Set your pterodactyl API key',
        rnk: 'User',
        cmdargs: [
            {name: 'key', type: 'string', required: true},
        ]
    },
    async run (bot, message, args) {
        message.channel.send("My ping is \`" + bot.ws.ping + " ms\`");
    }
}
