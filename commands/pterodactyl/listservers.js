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

        for (let key in obj) {
            //console.log(key + ': ' + obj[key]);
            const newEmbed = new MessageEmbed()
                .setTitle(key)
                .setDescription(obj[key].description)
                .addField("Identifier",obj[key].identifier)
            
            message.channel.send({ newEmbed })
        }
    }
}
