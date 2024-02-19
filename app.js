require('dotenv').config()
const prefix = require("./config.json").prefix;

const { Client, Intents, Collection } = require('discord.js')
const bot = require('./bot').bot;

const fs = require("fs")

const jsoning = require('jsoning')
bot.db = new jsoning('db.json')
bot.pterodactylkeys = new jsoning('pterodactylapis.json');

bot.commands = new Collection()
bot.modules = {}

const moduleFiles = fs.readdirSync('./modules/').filter(f => f.endsWith('.js'))
for (const file of moduleFiles) {
    const props = require(`./modules/${file}`)
    console.log(`${file} loaded`)
    const trimmedFilename = file.replace(/\.js$/, '');
    bot.modules[trimmedFilename] = props
}

const commandFiles = fs.readdirSync('./commands/').filter(f => f.endsWith('.js'))
for (const file of commandFiles) {
    const props = require(`./commands/${file}`)
    console.log(`${file} loaded`)
    bot.commands.set(props.config.name, props)
}

const commandSubFolders = fs.readdirSync('./commands/').filter(f => !f.endsWith('.js'))

commandSubFolders.forEach(folder => {
    const commandFiles = fs.readdirSync(`./commands/${folder}/`).filter(f => f.endsWith('.js'))
    for (const file of commandFiles) {
        const props = require(`./commands/${folder}/${file}`)
        console.log(`${file} loaded from ${folder}`)
        bot.commands.set(props.config.name, props)
    }
});

// Load Event files from events folder
const eventFiles = fs.readdirSync('./events/').filter(f => f.endsWith('.js'))

for (const file of eventFiles) {
    const event = require(`./events/${file}`)
    if(event.once) {
        bot.once(event.name, (...args) => event.execute(...args, bot))
    } else {
        bot.on(event.name, (...args) => event.execute(...args, bot))
    }
}
//Voice handler
bot.on('voiceStateUpdate', async (oldState, newState) => {
    if (newState.member.user.bot) return; // Ignore if it's a bot
    if (!newState.member.user.id == "1176182260731490366") return;

    const voiceChannel = newState.channel;

    // Check if the bot is already in a voice channel
    const botVoiceConnection = bot.voice.connections.find(connection => connection.channel.guild.id === newState.guild.id);

    if (!voiceChannel) { // User left the voice channel
        if (botVoiceConnection && botVoiceConnection.channel.guild.id === oldState.guild.id) {
            // Check if there are no other members left in the voice channel
            if (botVoiceConnection.channel.members.size === 1) {
                botVoiceConnection.channel.leave();
                console.log(`Bot has left ${botVoiceConnection.channel.name}`);
            }
        }
    } else { // User joined a voice channel
        // Join the voice channel the user just entered
        if (!botVoiceConnection) {
            try {
                const connection = await voiceChannel.join();
                console.log(`Bot has joined ${voiceChannel.name}`);
            } catch (error) {
                console.error('Failed to join voice channel:', error);
            }
        }
    }
});

//Command Manager
bot.on("messageCreate", async message => {
    //Check if author is a bot
    if(message.author.bot) return;

    if (!message.author.bot) {
        if (message.author.id == "254765343745114114") { //ty
            message.react("<a:valentinehearts:1209247925977350214>");
        } else if (message.author.id == "1176182260731490366") { //me
            message.react("<a:gay:1209247930704203777>");
        } else if (message.author.id == "195169523823935488") { //chris
            message.react("<a:pepeeat:1209247927080587305>");
        } else if (message.author.id == "692865328916594709") {
            message.react("<a:purpleheart:1209252648130314240>"); //jess
        } else {
            message.react("👀");
        }
       

        setTimeout(async () => {
            try {
                const fetchedMessage = await message.fetch();
                const botId = bot.user.id;
                fetchedMessage.reactions.cache.forEach(async reaction => {
                    if (reaction.users.cache.has(botId)) {
                        await reaction.users.remove(botId);
                    }
                });
            } catch (error) {
                console.error('Failed to remove reaction:', error);
            }
        }, 2 * 1000);
    }

    //get prefix from config and prepare message so it can be read as a command
    let messageArray = message.content.split(" ")
    let cmd = messageArray[0]
    let args = messageArray.slice(1)

    //Check for prefix
    if(!cmd.startsWith(prefix)) return;

    //Get the command from the commands collection and then if the command is found run the command file
    const commandfile = bot.commands.get(cmd.slice(prefix.length));

    if (commandfile) {
        let commandArgs = {}
        for (let i = 0; i < commandfile.config.cmdargs.length; i++) {
            const argumentdata = commandfile.config.cmdargs[i]

            if (!args[i] && argumentdata.required) return message.channel.send(`The argument ${argumentdata.name} (${argumentdata.type}) is required.`);
            
            if (args[i]) {
                if (argumentdata.type == 'string' && typeof args[i] == 'string') {
                    let parsedString = args.slice(i).join(" ")
                    commandArgs[argumentdata.name] = parsedString
                } else if (argumentdata.type == 'integer' && typeof parseInt(args[i]) == 'number' ) {
                    const parsedInt = parseInt(args[i])
                    commandArgs[argumentdata.name] = parsedInt
                } else {
                    commandArgs[argumentdata.name] = args[i]
                }
            }
        }
        commandfile.run(bot, message, commandArgs);
    } else {
        message.channel.send('No command was found.')
    }
});

//Token
bot.login(process.env.TOKEN);