module.exports = {
    config: {
        name: 'listservers',
        description: 'List all your servers',
        rnk: 'User',
        cmdargs: []
    },
    async run (bot, message, args) {
        const pterodactyl = bot.modules.pterodactyl
        const userAPIKey = await pterodactyl.grabAPIKey(bot, message.author.id)
        const allServers = await pterodactyl.getallservers(bot, userAPIKey)

        const { MessageEmbed } = require('discord.js');

        for (let key in allServers) {
            const newEmbed = new MessageEmbed()
                .setTitle(key)
                .setDescription(allServers[key].description)
                .addField("Identifier",allServers[key].identifier)
            
            message.channel.send({ newEmbed })
        }
    }
}
