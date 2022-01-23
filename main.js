require("dotenv").config()

/**
 * Init discord bot
 */
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Intents } = require("discord.js")
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] })
bot.login(process.env.DISCORD_TOKEN)
 
/**
 * When bot start
 */
bot.once("ready", async function(){
    console.log(`Démmarage en tant que ${bot.user.tag}`)

    bot.guilds.cache.get(process.env.DISCORD_GUILD)?.commands.fetch().then(function(commands){
        const command = commands.find(c => c.name == "tirage")
        command.permissions.set({ permissions })
    })
})
 
/**
 * Register commands
 */
const createCommands = [
	new SlashCommandBuilder().setName("nemacards").setDescription("Pour avoir le lien du site des NémaCards !"),
	new SlashCommandBuilder().setName("nemacup").setDescription("Pour avoir le lien du site de la NémaCup !"),
	new SlashCommandBuilder().setName("site").setDescription("Pour avoir le lien du site de Némaïdès !"),
    new SlashCommandBuilder().setName("tirage")
        .setDescription("Fait un tirage au sort sur un message donné des réactions 🥚 (seulement utilisable par Némaïdès)")
        .addStringOption(option => option.setName("message")
            .setDescription("ID du message sur lequel faire un tirage au sort")
            .setRequired(true)
        )
        .addIntegerOption(option => option.setName("nb")
            .setDescription("Nombre de gagnants a tirer au sort")
            .setMinValue(1)
            .setRequired(true)
        )
        .setDefaultPermission(false)
].map(command => command.toJSON())
const permissions = [
	{ id: "112632359207108608", type: "USER", permission: true },
	{ id: "264135122754732042", type: "USER", permission: true }
]
const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN)
rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT, process.env.DISCORD_GUILD), { body: createCommands })

/**
 * Answering commands
 */
bot.on("interactionCreate", async function(interaction){
	if(!interaction.isCommand()){ return }

    if(interaction.commandName == "nemacards"){
		await interaction.reply("https://cards.nemaides.fr")
	}else if(interaction.commandName == "nemacup"){
		await interaction.reply("https://cup.nemaides.fr")
    }else if(interaction.commandName == "site"){
		await interaction.reply("https://nemaides.fr")
    }else if(interaction.commandName == "tirage"){
        interaction.deferReply()
        interaction.deleteReply()

        const nbWinners = interaction.options.getInteger("nb") ? interaction.options.getInteger("nb") : 1
        const messageId = interaction.options.getString("message")

        const messageReactions = await bot.channels.cache.get("701153434115637418").messages.fetch(messageId)
        
        let reactions = await messageReactions.reactions.resolve("🥚").users.fetch()
        let totalReactions = reactions
        while(reactions.size >= 100){
            reactions = await messageReactions.reactions.resolve("🥚").users.fetch({
                after: reactions.lastKey()
            })
            totalReactions.concat(reactions)
        }
        
        let winners = new Array()
        for(let i=0 ; i<nbWinners ; i++){
            let winner
            do{
                winner = totalReactions.randomKey()
            }while(winners.includes(winner))
            winners.push(winner)
        }

        let answer = "Bravo à : "
        for(const winner of winners){
            answer += `<@${winner}>, `
        }
        answer = answer.substring(0, answer.length - 2)
        answer += winners.length > 1 ? " vous avez gagné !" : " tu as gagné !"

        interaction.channel.send(answer)
    }
})

/**
 * To avoid crashes
 */
process.on('uncaughtException', (err) => {
    console.log(err)
})