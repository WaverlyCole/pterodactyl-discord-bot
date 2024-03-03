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
        name: 'restartserver',
        description: 'Restart a server by id or name',
        rnk: 'User',
        cmdargs: [
            {name: 'server', type: 'string', required: true},
        ]
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

                const serverSearch = args.server

                for (let key in allServers) {
                    const serverName = key
                    const uuid = allServers[key].identifier

                    if (serverName.includes(serverSearch) || uuid.includes(serverSearch)) {
                        const status = await pterodactyl.getrunningstate(bot, userAPIKey, allServers[key].identifier)

                        if (status == "running" || status == "offline" || status == "error") {
                            await pterodactyl.restart(bot, userAPIKey, allServers[key].identifier)
                        } else {
                            sentMessage.edit({content: "This server is in the process of starting/stopping and cannot be restarted at this moment."})
                        }
                    }
            }
            })
    }
}
