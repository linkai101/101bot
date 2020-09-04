const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const pool = require('../../lib/dbpool');
const {embedSettings} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class LeaderboardCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'leaderboard',
            group: 'levels',
            memberName: 'leaderboard',
            aliases: ['lb', 'xplb'],
            description: 'Displays the XP leaderboard for the guild',
            guildOnly: true,
            userPermissions: [],
            clientPermissions: [],
            //argsType: 'multiple',
            args: []
        })
    }

    async run (message) {
        pool.query(`SELECT * FROM experience WHERE guildID = '${message.guild.id}'`, function (err, result) {
            if (err) throw err;
            //console.log(result);

            var unorderedLB = [];
            var i;
            for (i=0;i<result.length;i++) {
                unorderedLB.push({"id":i,"xp":result[i].xp})
            }

            var orderedLB = unorderedLB.sort((a, b) => (a.xp < b.xp) ? 1 : -1);
            orderedLB.splice(15,orderedLB.length);

            const leaderboardMessage = new Discord.MessageEmbed()
                .setColor(embedSettings.color)
                .setAuthor(message.guild.name, `https://cdn.discordapp.com/icons/${message.guild.id}/${message.guild.icon}.png`, '')
                .setTitle('XP Leaderboard (Top 15)')
                .setFooter(embedSettings.footer, embedSettings.footer_url);
            var i;
            for (i=0;i<orderedLB.length;i++) {
                var user = message.guild.members.cache.get(result[orderedLB[i].id].userID);
                leaderboardMessage.addField(`${i+1} - ${user.user.tag}`, `Level ${module.exports.calculateLevel(orderedLB[i].xp).level} | ${orderedLB[i].xp} XP`, true);
            }
            message.channel.send(leaderboardMessage);
        });
    }

    static calculateLevel(xp) {
        var level = 0;

        while (true) {
            if (xp >= Math.floor(1.5**(8+level))) {
                level++;
            } else {
                break;
            }
        }

        /*while (true) {
            if (xp >= 2**(6+level)) {
                level++;
            } else {
                break;
            }
        }*/

        var xpProgress = xp - Math.floor(1.5**(8+level-1));
        var xpProgressTotal = Math.floor(1.5**(8+level)) - Math.floor(1.5**(8+(level-1)));
        if (level == 0) {
            xpProgress = xp;
            xpProgressTotal = Math.floor(1.5**(8+level));
        }

        return {
            "level": level,
            "progress": xpProgress,
            "progressTotal": xpProgressTotal
        };
    }
}

