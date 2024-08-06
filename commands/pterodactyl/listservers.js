const status_lookup = {
    starting: "🔃",
    running: "✅",
    stopping: "🛑",
    offline: "❌",
    error: "⚠️",
    suspended: "⛔",
    rebooting: "🔃",
}

module.exports = {
    config: {
        name: 'listservers',
        description: 'List all your servers',
        rnk: 0,
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
                    function round(num) {
                        return Math.round(num * 10) / 10
                    }

                    const status = await pterodactyl.getrunningstate(bot, userAPIKey, allServers[key].identifier)
                    const maxMem = allServers[key].limits.memory
                    const currMem = status.resources.memory_bytes / 1024 / 1024
                    const maxDisk = allServers[key].limits.disk
                    const currDisk = status.resources.disk_bytes / 1024 / 1024
                    const cpu = Math.round(status.resources.cpu_absolute)

                    embed.addField(`${status_lookup[status.current_state]} ${key} (${allServers[key].identifier})`, `Mem: ${round(currMem/maxMem*100)}% Cpu: ${cpu}% Disk: ${round(currDisk/maxDisk*100)}%`, false);
            }

            embed.setFooter("✅=Online ❌=Offline 🔃=Starting 🛑=Stopping")
            sentMessage.edit({ content: ' ', embeds: [embed] })
            })
    }
}
