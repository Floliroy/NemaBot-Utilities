module.exports = async function(interaction, bot){
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