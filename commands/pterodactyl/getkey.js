module.exports = {
    config: {
        name: 'getkey',
        description: 'Check your pterodactyl API key',
        rnk: 0,
        cmdargs: []
    },
    async run (bot, message, args) {
        message.reply("Your key will be sent to you in a private message, if I am able to.")
        const key = await bot.pterodactylkeys.get(message.author.id)
        if (key) {
            message.author.send(key)
        } else {
            message.author.send("You do not have a key set. Use setkey")
        }
    }
}
