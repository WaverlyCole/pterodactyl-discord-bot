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
        const value = await bot.pterodactylkeys.get(message.author.id)
        message.channel.send(value)
    }
}
