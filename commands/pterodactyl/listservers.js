module.exports = {
    config: {
        name: 'listservers',
        description: 'List all your servers',
        rnk: 'User',
        cmdargs: []
    },
    async run (bot, message, args) {
        message.channel.send("Checking servers...")
            .then(async sentMessage => {
                const pterodactyl = bot.modules.pterodactyl
                const userAPIKey = await pterodactyl.grabAPIKey(bot, message.author.id)
                const allServers = await pterodactyl.getallservers(bot, userAPIKey)

                const { MessageEmbed } = require('discord.js');

                const embed = new MessageEmbed()
                    .setTitle('Your Servers')
                    .setDescription("Here is a list of all servers you currently have access to")

                for (let key in allServers) {
                        embed.addField(key,allServers[key].identifier);
                }

                sentMessage.edit({ content: 'Done!', embeds: [embed] })
            })
    }
}
