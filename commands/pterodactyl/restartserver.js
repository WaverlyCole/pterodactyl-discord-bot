const status_lookup = {
    starting: "Starting 🔃",
    running: "Online ✅",
    stopping: "Stopping 🛑",
    offline: "Offline ❌",
    error: "Error ⚠️",
    suspended: "Suspended ⛔",
    rebooting: "Restarting 🔃",
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
        message.reply("Sending command...")
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
                        const status = await pterodactyl.getrunningstate(bot, userAPIKey, allServers[key].identifier,true)

                        if (status.current_state == "running" || status.current_state == "offline" || status.current_state == "error") {
                            await pterodactyl.restart(bot, userAPIKey, allServers[key].identifier)
                            
                            const startTime = Date.now();

                            function round(num) {
                                return Math.round(num * 10) / 10
                            }

                            while (true) {
                                const elapsedTime = Math.round((Date.now() - startTime)/1000);

                                embed = new MessageEmbed()
                                    .setTitle(`Server is restarting (${elapsedTime})`)
                                    .setTimestamp()

                                if (elapsedTime < 20) { //api cache is for 20 seconds, so we need to wait at least that long
                                    embed.setFooter("The server status will not be updated for at least 20 seconds.")
                                    embed.addField(`${key} (${allServers[key].identifier})`, status_lookup["rebooting"], false);
                                } else{
                                    const status = await pterodactyl.getrunningstate(bot, userAPIKey, allServers[key].identifier,true);

                                    embed.addField(`${key} (${allServers[key].identifier})`, status_lookup[status.current_state], false);
    
                                    if (status.current_state != "rebooting" && status.current_state != "starting") {
                                        embed.setTitle(`Finished!`)
                                        if (status.current_state != "running") {
                                            embed.setDescription("There was an error restarting this server.")
                                        }

                                        sentMessage.edit({ content: ' ', embeds: [embed] })
                                        break; // Server is running, exit loop
                                    }
                                }
                                
                                sentMessage.edit({ content: ' ', embeds: [embed] })
                                await new Promise(resolve => setTimeout(resolve, 1000));
                            }
                        } else {
                            sentMessage.edit({content: "This server is in the process of starting/stopping and cannot be restarted at this moment."})
                        }
                    }
            }
            })
    }
}
