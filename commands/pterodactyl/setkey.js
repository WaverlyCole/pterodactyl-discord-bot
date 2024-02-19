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
        const channel = message.channel
        message.delete()

        channel.send("Checking key...")
            .then(async sentMessage => {
                const newkey = args.key
                const isValid = await bot.modules.pterodactyl.checkvalidkey(bot, newkey)

                if (isValid) {
                    await bot.pterodactylkeys.set(message.author.id,args.key)
                    sentMessage.edit("Your key has been set!")
                } else {
                    sentMessage.edit("Your key is invalid!")
                }
            })
    }
}