const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = [
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
        .setDefaultPermission(false),
    new SlashCommandBuilder().setName("embed")
        .setDescription("Permet de créer un Message Embed via un assistant de configuration")
        .addStringOption(option => option.setName("titre")
            .setDescription("Titre du Message Embed")
            .setRequired(true)
        )
        .setDefaultPermission(false)
]