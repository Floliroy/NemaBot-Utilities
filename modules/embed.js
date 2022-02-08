const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js")
const colors = require("./colors.json")

let channelId
let authorId
let actionEnCours
let prevMessage
let prevConfig
let prevConfigAction

let embed

async function sendConfig(channel, bot){
    const config = new MessageEmbed()
        .setTitle("Configuration du Message Embed")
        .setColor("BLURPLE")
        .setDescription("Choisis l'action que tu souhaites effectuer :")
        .setFooter({ text: bot.user.username, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

    const actionRowButtons = new MessageActionRow().addComponents(
        new MessageButton().setCustomId("nemabot-title").setLabel("Modif Titre").setStyle("PRIMARY"),
        new MessageButton().setCustomId("nemabot-description").setLabel(`${embed.description != "" ? "Ajout": "Modif"} Description`).setStyle("PRIMARY"),
        new MessageButton().setCustomId("nemabot-url").setLabel("Ajout URL").setStyle("SECONDARY"),
        new MessageButton().setCustomId("nemabot-image").setLabel("Ajout Image").setStyle("PRIMARY"),
        new MessageButton().setCustomId("nemabot-icon").setLabel("Ajout Icone").setStyle("SECONDARY")
    )
    const actionRowColors = new MessageActionRow().addComponents(
        new MessageSelectMenu()
            .setCustomId("nemabot-color")
            .setPlaceholder("Choisir la Couleur")
            .addOptions(colors)
    )
    let channels = await channel.guild.channels.fetch()
    channels = channels.filter(chan => chan.isText() )
    channels.sort((a, b) => b.name.startsWith("sutom") - a.name.startsWith("sutom") )
    channels.sort((a, b) => b.name.startsWith("bla-bla") - a.name.startsWith("bla-bla") )
    channels.sort((a, b) => b.name.startsWith("annonce") - a.name.startsWith("annonce") )
    const channelsOptions = new Array()
    for(let i=0 ; i<channels.size ; i++){
        if(i == 25) break;
        channelsOptions.push({label: channels.at(i).name, value: channels.at(i).id})
    }
    
    const actionEnvoyer = new MessageActionRow().addComponents(
        new MessageSelectMenu()
            .setCustomId("nemabot-send")
            .setPlaceholder("Envoyer dans un Salon")
            .addOptions(channelsOptions)
    )

    prevConfig = await channel.send({embeds: [config], components: [actionRowButtons, actionRowColors, actionEnvoyer]})
}

module.exports = class EmbedCreator{

    static getChannelId(){ return channelId }
    static getAuthorId(){ return authorId }
    static getActionEnCours(){ return actionEnCours }
    static setActionEnCours(action){ actionEnCours = action }

    static async sendInitEmbed(interaction, bot){
        await interaction.deferReply()

        embed = new MessageEmbed()
            .setTitle(interaction.options.getString("titre"))
            .setThumbnail("https://nemaides.fr/logo.png")
            .setFooter({ text: interaction.member.nickname || interaction.user.username, iconURL: interaction.member.displayAvatarURL({ dynamic: true }) })
        prevMessage = await interaction.channel.send({embeds: [embed]})

        await sendConfig(interaction.channel, bot)

        channelId = interaction.channelId
        authorId = interaction.user.id
        interaction.deleteReply()
    }

    static async setColor(interaction, bot){
        await interaction.deferReply()

        embed.setColor(interaction.values[0])
        prevMessage.edit({embeds: [embed]})

        interaction.deleteReply()
    }

    static async sendConfigAction(interaction, bot){
        await interaction.deferReply()
        actionEnCours = interaction.customId

        let config
        if(actionEnCours == "nemabot-title"){
            config = new MessageEmbed().setTitle("Configuration du Titre").setColor("BLURPLE").setDescription("Tapes le nouveau titre que tu souhaites !")
                .setFooter({ text: bot.user.username, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })
        }else if(actionEnCours == "nemabot-description"){
            config = new MessageEmbed().setTitle("Configuration de la Description").setColor("BLURPLE").setDescription("Tapes la description que tu souhaites !")
                .setFooter({ text: bot.user.username, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })
        }else if(actionEnCours == "nemabot-url"){
            config = new MessageEmbed().setTitle("Configuration de l'URL").setColor("BLURPLE").setDescription("Tapes le lien vers lequel mènera un clic sur le titre !")
                .setFooter({ text: bot.user.username, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })
        }else if(actionEnCours == "nemabot-image"){
            config = new MessageEmbed().setTitle("Configuration de l'Image").setColor("BLURPLE").setDescription("Tapes le lien de l'image principale du message !\nSi ton image ne s'affiche pas essaye de l'héberger vers imgbb / postimages / ...")
                .setFooter({ text: bot.user.username, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })
        }else if(actionEnCours == "nemabot-icon"){
            config = new MessageEmbed().setTitle("Configuration de l'Icone").setColor("BLURPLE").setDescription("Tapes le lien de la petite icone servant d'icone au message !\nSi ton image ne s'affiche pas essaye de l'héberger vers imgbb / postimages / ...")
                .setFooter({ text: bot.user.username, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })
        }else{
            return interaction.deleteReply()
        }
        prevConfigAction = await interaction.channel.send({embeds: [config]})

        interaction.deleteReply()
    }

    static async execAction(message, bot){
        prevConfigAction.delete()
        message.delete()

        if(actionEnCours == "nemabot-title"){
            embed.setTitle(message.content)
        }else if(actionEnCours == "nemabot-description"){
            embed.setDescription(message.content)
        }else if(actionEnCours == "nemabot-url"){
            embed.setURL(message.content)
        }else if(actionEnCours == "nemabot-image"){
            embed.setImage(message.content)
        }else if(actionEnCours == "nemabot-icon"){
            embed.setThumbnail("https://nemaides.fr/logo.png")
        }
        actionEnCours = undefined

        prevMessage.edit({embeds: [embed]})
    }

    static async sendFinal(interaction, bot){
        await interaction.deferReply()
        await prevMessage.delete()
        await prevConfig.delete()
        channelId = undefined
        authorId = undefined
        actionEnCours = undefined
        prevMessage = undefined
        prevConfig = undefined
        prevConfigAction = undefined

        embed.setTimestamp(new Date())

        const chan = await bot.channels.fetch(interaction.values[0])
        chan.send({embeds: [embed]})

        interaction.deleteReply()
    }
}