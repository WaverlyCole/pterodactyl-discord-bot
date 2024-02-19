const status_lookup = {
    starting: "Starting 🔃",
    running: "Online ✅",
    stopping: "Stopping 🛑",
    offline: "Offline ❌",
    error: "Error ⚠️",
    suspended: "Suspended ⛔",
    rebooting: "Rebooting 🔃",
}

module.exports = {
    config: {
        name: 'listservers',
        description: 'List all your servers',
        rnk: 'User',
        cmdargs: []
    },
    async run (bot, message, args) {
        message.reply("Checking servers...")
            .then(async sentMessage => {
                const pterodactyl = bot.modules.pterodactyl
                const userAPIKey = await pterodactyl.grabAPIKey(bot, message.author.id)

                if (!userAPIKey) {
                    return sentMessage.edit("No pterodactyl API key is set. Use setkey.")
                }

                const allServers = await pterodactyl.getallservers(bot, userAPIKey)

                if (!allServers) {
                    return sentMessage.edit("Failed to load servers. Make sure you have a valid API key.")
                }

                const { MessageEmbed } = require('discord.js');

                const embed = new MessageEmbed()
                    .setTitle('Your Servers')
                    .setDescription("Here is a list of all servers you currently have access to")

                for (let key in allServers) {
                        const onlineStatus = await pterodactyl.getrunningstate(bot, userAPIKey, allServers[key].identifier)
                        embed.addField(`${key} (${allServers[key].identifier})`, status_lookup[onlineStatus]);
                }

                sentMessage.edit({ content: ' ', embeds: [embed] })
            })
    }
}
