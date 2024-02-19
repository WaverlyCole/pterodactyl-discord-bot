module.exports = {
    config: {
        name: 'listservers',
        description: 'List all your servers',
        rnk: 'User',
        cmdargs: []
    },
    async run (bot, message, args) {
        console.log(bot.modules)
        const pterodactyl = bot.modules.pterodactyl
        const userAPIKey = pterodactyl.grabAPIKey(message.author.id)
        message.reply(userAPIKey)
    }
}
