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
        message.reply("Working...")
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

                const serverSearch = args.server.toLowerCase()

                for (let key in allServers) {
                    const serverName = key
                    const uuid = allServers[key].identifier

                    if (serverName.toLowerCase().includes(serverSearch) || uuid.toLowerCase().includes(serverSearch)) {
                        const status = await pterodactyl.getrunningstate(bot, userAPIKey, allServers[key].identifier)

                        if (status.current_state == "running" || status.current_state == "offline" || status.current_state == "error") {
                            let embed = new MessageEmbed()
                                .setTitle('Server is restarting...')
                            
                            sentMessage.edit({ content: ' ', embeds: [embed] })

                            await pterodactyl.restart(bot, userAPIKey, allServers[key].identifier)

                            const startTime = Date.now();
                            function round(num) {
                                return Math.round(num * 10) / 10
                            }
                            
                            while (true) {
                                const elapsedTime = Date.now() - startTime;

                                embed = new MessageEmbed()
                                    .setTitle(`Server is restarting... (${elapsedTime})`)

                                const status = await pterodactyl.getrunningstate(bot, userAPIKey, allServers[key].identifier)
                                const maxMem = allServers[key].limits.memory
                                const currMem = status.resources.memory_bytes / 1024 / 1024
                                const maxDisk = allServers[key].limits.disk
                                const currDisk = status.resources.disk_bytes / 1024 / 1024
                                const cpu = Math.round(status.resources.cpu_absolute)

                                embed.addField(`${status_lookup[status.current_state]} ${key} (${allServers[key].identifier})`, `Mem: ${round(currMem/maxMem*100)}% Cpu: ${cpu}% Disk: ${round(currDisk/maxDisk*100)}%`, false);
                                
                                sentMessage.edit({ content: ' ', embeds: [embed] })

                                if (serverInfo.status != "starting") {
                                    embed.setTitle(`Finished (${elapsedTime})`)
                                    break; // Server is running, exit loop
                                }
                                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds
                            }
                        } else {
                            sentMessage.edit({content: "This server is in the process of starting/stopping and cannot be restarted at this moment."})
                        }
                    }
            }
            })
    }
}
