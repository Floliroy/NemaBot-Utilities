require("dotenv").config()

/**
 * Init discord bot
 */
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { Client, Intents, DMChannel } = require("discord.js")
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] })
bot.login(process.env.DISCORD_TOKEN)

const EmbedCreator = require('./modules/embed')
const tirage = require('./modules/tirage')
const commandsFile = require('./modules/commands')
 
/**
 * When bot start
 */
bot.once("ready", async function(){
    console.log(`Démmarage en tant que ${bot.user.tag}`)

    bot.user.setPresence({activities: [{type: "WATCHING", name: "NemaidesTFT", url: "https://www.twitch.tv/nemaidestft"}]})

    bot.guilds.cache.get(process.env.DISCORD_GUILD)?.commands.fetch().then(async function(commands){
        let command = commands.find(c => c.name == "tirage")
        await command.permissions.set({ permissions: permissions })
        command = commands.find(c => c.name == "embed")
        await command.permissions.set({ permissions: permissions.concat(permissionsWithRole) })
    })
})
 
/**
 * Register commands
 */
const createCommands = commandsFile.map(command => command.toJSON())
const permissions = [
	{ id: "112632359207108608", type: "USER", permission: true }, //Floliroy
	{ id: "264135122754732042", type: "USER", permission: true }  //Némaïdès
]
const permissionsWithRole = [
	{ id: "701101815437197343", type: "ROLE", permission: true }  //Admin
]
const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN)
rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT, process.env.DISCORD_GUILD), { body: createCommands })

/**
 * Answering commands
 */
bot.on("interactionCreate", async function(interaction){
	if(interaction.isCommand()){

        if(interaction.commandName == "nemacards"){
            await interaction.reply("https://cards.nemaides.fr")
        }else if(interaction.commandName == "nemacup"){
            await interaction.reply("https://cup.nemaides.fr")
        }else if(interaction.commandName == "site"){
            await interaction.reply("https://nemaides.fr")
        }else if(interaction.commandName == "tirage"){
            tirage(interaction, bot)
        }else if(interaction.commandName == "embed"){
            EmbedCreator.sendInitEmbed(interaction, bot)
        }

    }else if(interaction.isSelectMenu()){

        if(interaction.customId == "nemabot-color"){
            EmbedCreator.setColor(interaction, bot)
        }else if(interaction.customId == "nemabot-send"){
            EmbedCreator.sendFinal(interaction, bot)
        }

    }else if(interaction.isButton()){

        if(interaction.customId.startsWith("nemabot-") && interaction.channelId == EmbedCreator.getChannelId() && interaction.user.id == EmbedCreator.getAuthorId()){
            EmbedCreator.sendConfigAction(interaction, bot)
        }

    }
})

bot.on("messageCreate", async function(message){
    if(message.author.bot || message.channel instanceof DMChannel) return

    if(EmbedCreator.getActionEnCours() && message.channelId == EmbedCreator.getChannelId() && message.author.id == EmbedCreator.getAuthorId()){
        EmbedCreator.execAction(message, bot)
    }
})

/**
 * To avoid crashes
 */
process.on('uncaughtException', (err) => {
    console.log(err)
})