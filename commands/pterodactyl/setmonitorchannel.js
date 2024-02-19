const status_lookup = {
    starting: "🔃",
    running: "✅",
    stopping: "🛑",
    offline: "❌",
    error: "⚠️",
    suspended: "⛔",
    rebooting: "🔃",
}

const jsoning = require('jsoning')
const monitoringdb = new jsoning('servermonitor.json')
const bot = require('../../bot').bot;

async function startUpdatingMessages() {
    setInterval(async () => {
        console.log("UPDATING MONITORS")
        const allMonitors = monitoringdb.all();

        const userids = Object.keys(allMonitors);

        userids.forEach(async userid => {
            const pterodactyl = bot.modules.pterodactyl
            try {
                const guild = bot.guilds.cache.get(allMonitors[userid].guild);
                if (!guild) {
                    console.log("REMOVED MONITOR CAUSE CANT FIND GUILD");
                    await monitoringdb.delete(message.author.id);
                    return; // Exit the function or handle it appropriately
                }

                const channel = guild.channels.cache.get(allMonitors[userid].channel);
                if (!channel) {
                    console.log("REMOVED MONITOR CAUSE CANT FIND CHANNEL");
                    await monitoringdb.delete(message.author.id);
                    return; // Exit the function or handle it appropriately
                }

                let message = await channel.messages.fetch(allMonitors[userid].message);
                if (!message) {
                    console.log("MONITOR CANT FIND MESSAGE MAKING NEW ONE");
                    const newMessage = await channel.send("Monitoring servers...(message will update shortly)");
                    await monitoringdb.set(userid, { channel: newMessage.channelId, message: newMessage.id, guild: newMessage.guildId });
                    message = newMessage;
                }

                const userAPIKey = await pterodactyl.grabAPIKey(bot, userid)
                if (!userAPIKey) return monitoringdb.delete(message.author.id);

                if (!userAPIKey) {
                    return console.log("No api key!")
                }

                const allServers = await pterodactyl.getallservers(bot, userAPIKey)

                if (!allServers) {
                    return console.log("Failed to load servers!")
                }

                const { MessageEmbed } = require('discord.js');

                const embed = new MessageEmbed()
                    .setTitle('Monitoring')
                    .setTimestamp()

                for (let key in allServers) {
                        function round(num) {
                            return Math.round(number * 10) / 10
                        }

                        const status = await pterodactyl.getrunningstate(bot, userAPIKey, allServers[key].identifier)
                        const maxMem = round(allServers[key].limits.memory / 1024)
                        const currMem = round(status.resources.memory_bytes / 1024 / 1024 / 1024)
                        const maxDisk = round(allServers[key].limits.disk / 1024)
                        const currDisk = round(status.resources.disk_bytes / 1024 / 1024 / 1024)
                        const cpu = round(status.resources.cpu_absolute)

                        embed.addField(`${status_lookup[status.online_status]} ${key} (${allServers[key].identifier})`, `Mem: ${currMem}Gb/${maxMem}Gb Disk: ${currDisk}Gb/${maxDisk}Gb Cpu: ${cpu}`, true);
                }
                
                embed.setFooter("✅=Online ❌=Offline 🔃=Starting 🛑=Stopping")
                message.edit({ content: ' ', embeds: [embed] })
            } catch(error) {
                console.log(error)
            }
        });
    }, 60 * 1000);
}

startUpdatingMessages()

module.exports = {
    config: {
        name: 'setmonitorchannel',
        description: 'Sets a channel to monitor your servers.',
        rnk: 'User',
        cmdargs: []
    },
    async run (bot, message, args) {
        message.channel.send("Monitoring servers...(message will update shortly)").then(async newMessage => {
           await monitoringdb.set(message.author.id,{channel: newMessage.channelId, message: newMessage.id, guild: newMessage.guildId});
           message.delete()
        })
    }
}
