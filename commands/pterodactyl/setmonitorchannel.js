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

async function startUpdatingMessages(channel, messageId = null) {
    setInterval(async () => {
        const guild = bot.guilds.cache.get(765647938469888001);
        const allMonitors = monitoringdb.all();

        for (const userid of allMonitors) {
            const pterodactyl = bot.modules.pterodactyl
            try {
                const channel = guild.channels.cache.get(allMonitors[userid].channel)
                const message = channel.messages.fetch(allMonitors[userid].message)
                const userAPIKey = await pterodactyl.grabAPIKey(bot, message.author.id)

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
                        const onlineStatus = await pterodactyl.getrunningstate(bot, userAPIKey, allServers[key].identifier)
                        embed.addField(`${key} (${allServers[key].identifier})`, status_lookup[onlineStatus]);
                }

                message.edit({ content: ' ', embeds: [embed] })
            } catch(error) {
                
            }
        }
    }, 30 * 1000);
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
        let newMessageID = ""
        let channelID = message.channelID
        message.channel.send("Monitoring servers...(message will update shortly)").then(newMessage => {
            newMessageID = newMessage.id

            monitoringdb.set(message.author.id,{channel: channelID, message: newMessageID})
        })
    }
}
