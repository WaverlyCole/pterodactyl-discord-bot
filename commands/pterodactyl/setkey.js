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
        message.delete()
        await bot.pterodactylkeys.set(message.author.id,args.key)
        message.channel.send("Your key has been set!")
    }
}
