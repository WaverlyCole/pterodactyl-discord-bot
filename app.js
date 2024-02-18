require('dotenv').config()
const prefix = require("./config.json").prefix;

const { Client, Intents, Collection } = require('discord.js')
const bot = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ] 
});

const fs = require("fs")

const jsoning = require('jsoning')
bot.db = new jsoning('db.json')
bot.pterodactylkeys = new jsoning('pterodactylapis.json');

bot.commands = new Collection()

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

//Command Manager
bot.on("messageCreate", async message => {
    //Check if author is a bot or the message was sent in dms and return
    if(message.author.bot) return;
    //if(message.channel.type === "dm") return message.channel.send('I am not currently listening to my private messages. Sorry!');

    //get prefix from config and prepare message so it can be read as a command
    let messageArray = message.content.split(" ")
    let cmd = messageArray[0]
    let args = messageArray.slice(1)

    console.log(args)

    //Check for prefix
    if(!cmd.startsWith(prefix)) return;

    //Get the command from the commands collection and then if the command is found run the command file
    const commandfile = bot.commands.get(cmd.slice(prefix.length));

    if (commandfile) {
        console.log(commandfile)
        let commandArgs = {}
        for (let i = 0; i < commandfile.config.cmdargs.length; i++) {
            const argumentdata = commandfile.config.cmdargs[i]

            if (!args[i] && argumentdata.required) return message.channel.send(`The argument ${argumentdata.name} (${argumentdata.type}) is required.`);

            console.log(typeof args[i], argumentdata.type)

            if (typeof args[i] == argumentdata.type) {
                if (argumentdata.type == 'string') {
                    commandArgs[argumentdata.name] = args.slice(i)
                } else {
                    commandArgs[argumentdata.name] = args[i]
                }
            } else {
                return message.channel.send(`Expected argument type ${argumentdata.type} and receieved type ${typeof args[i]}.`)
            }
        }

        console.log(commandArgs)
        commandfile.run(bot, message, commandArgs);
    } else {
        message.channel.send('No command was found.')
    }

    //if(commandfile) commandfile.run(bot,message,args);
});

//Token
bot.login(process.env.TOKEN);
