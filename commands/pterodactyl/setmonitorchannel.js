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
                const guild = bot.guilds.cache.get('765647938469888001');
                console.log(bot.guilds.cache)
                console.log(guild)
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
                console.log(error)
            }
        });
    }, 10 * 1000);
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
