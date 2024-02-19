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
        const userAPIKey = await pterodactyl.grabAPIKey(bot, message.author.id)
        const allServers = await pterodactyl.getallservers(bot, userAPIKey)
        console.log(allServers)
    }
}
