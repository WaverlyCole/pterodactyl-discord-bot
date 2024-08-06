module.exports = {
    config: {
        name: 'setkeyfor',
        description: 'Sets userid pterodactyl API key',
        rnk: 3,
        cmdargs: [
            {name: 'userid', type: 'userid', required: true},
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
                    await bot.pterodactylkeys.set(args.userid,args.key)
                    sentMessage.edit(`${args.userid} key has been set!`)
                } else {
                    sentMessage.edit("Your key is invalid!")
                }
            })
    }
}