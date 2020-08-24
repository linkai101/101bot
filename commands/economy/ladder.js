const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const pool = require('../../lib/dbpool');
const {embedSettings, mySQL} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class LadderCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'ladder',
            group: 'economy',
            memberName: 'ladder',
            aliases: ['ecoladder','ecoleaderboard','ecolb','moneyleaderboard', 'mlb'],
            description: 'Displays the economy leaderboard for the guild',
            guildOnly: true,
            userPermissions: [],
            clientPermissions: [],
            //argsType: 'multiple',
            args: []
        })
    }

    async run (message) {
        pool.query(`SELECT * FROM economy WHERE guildID = '${message.guild.id}'`, function (err, result) {
            if (err) throw err;
            //console.log(result);

            var unorderedLB = [];
            var i;
            for (i=0;i<result.length;i++) {
                unorderedLB.push({"id":i,"balance":result[i].balance})
            }

            var orderedLB = unorderedLB.sort((a, b) => (a.balance < b.balance) ? 1 : -1);
            orderedLB.splice(15,orderedLB.length);

            const leaderboardMessage = new Discord.MessageEmbed()
                .setColor(embedSettings.color)
                .setAuthor(message.guild.name, `https://cdn.discordapp.com/icons/${message.guild.id}/${message.guild.icon}.png`, '')
                .setTitle('Economy Ladder (Top 15)')
                .setFooter(embedSettings.footer, embedSettings.footer_url);
            var i;
            for (i=0;i<orderedLB.length;i++) {
                var user = message.guild.members.cache.get(result[orderedLB[i].id].userID);
                leaderboardMessage.addField(`${i+1} - ${user.user.tag}`, `$${orderedLB[i].balance}`, true);
            }
            message.channel.send(leaderboardMessage);
        });
    }
}