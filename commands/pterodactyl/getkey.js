module.exports = {
    config: {
        name: 'getkey',
        description: 'Check your pterodactyl API key',
        rnk: 'User',
        cmdargs: []
    },
    async run (bot, message, args) {
        message.delete()
        const key = await bot.pterodactylkeys.get(message.author.id)
        message.channel.send("Your key will be send to you in a private message, if I am able to.")
        message.author.send(key)
    }
}
