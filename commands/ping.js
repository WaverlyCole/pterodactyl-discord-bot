module.exports = {
    config: {
        name: 'ping',
        description: 'Get ping of the bot',
        rnk: 'Admin',
        cmdargs: [
            {name: 'message', type: 'string', required: false},
        ]
    },
    async run (bot, message, args) {
        if (args.message) {
            message.reply(`${args.message} \`${bot.ws.ping} ms\``);
        } else {
            message.reply("Pong! \`" + bot.ws.ping + " ms\`");
        }
    }
}
