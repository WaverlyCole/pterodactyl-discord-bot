module.exports = {
    config: {
        name: 'delkey',
        description: 'Remove your pterodactyl API key',
        rnk: 'User',
        cmdargs: []
    },
    async run (bot, message, args) {
        message.reply("Removing key...")
            .then(async sentMessage => {
                if (await bot.pterodactylkeys.has(message.author.id)) {
                    await bot.pterodactylkeys.delete(message.author.id)
                    sentMessage.edit("Key removed.")
                } else {
                    sentMessage.edit("You have no key set!")
                }
            })
    }
}