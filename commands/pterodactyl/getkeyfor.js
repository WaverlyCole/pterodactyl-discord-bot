module.exports = {
    config: {
        name: 'getkeyfor',
        description: 'Check userid pterodactyl API key',
        rnk: 0,
        cmdargs: [
            {name: 'userid', type: 'userid', required: true},
        ]
    },
    async run (bot, message, args) {
        message.reply("Your key will be sent to you in a private message, if I am able to.")
        const key = await bot.pterodactylkeys.get(args.userid)
        if (key) {
            message.author.send(key)
        } else {
            message.author.send("You do not have a key set. Use setkey")
        }
    }
}
