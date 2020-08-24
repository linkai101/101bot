const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const pool = require('../../lib/dbpool');
const {embedSettings, mySQL} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class LevelsCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'level',
            group: 'levels',
            memberName: 'level',
            aliases: ['experience', 'xp'],
            description: 'Displays the XP level of a user',
            guildOnly: true,
            userPermissions: [],
            clientPermissions: [],
            //argsType: 'multiple',
            args: [
                {
					key: 'user',
                    prompt: 'Which user do you want to see the XP level of?',
                    type: 'string' || 'object',
					default: ''
				}
            ]
        })
    }

    async run (message, args) {
        if (!args.user) {
            pool.query(`SELECT * FROM experience WHERE guildID = '${message.guild.id}' AND userID = '${message.author.id}'`, function (err, result) {
                if (err) throw err;

                if (result.length == 0) {
                    const xpMessage = new Discord.MessageEmbed()
                        .setColor(embedSettings.color)
                        .setAuthor(message.guild.name, `https://cdn.discordapp.com/icons/${message.guild.id}/${message.guild.icon}.png`, '')
                        .setTitle(message.author.tag)
                        .setThumbnail(message.author.avatarURL())
                        .addFields(
                            { name: 'Level', value: 0, inline: true },
                            { name: 'Progress', value: `${module.exports.calculateLevel(0).progress}/${module.exports.calculateLevel(0).progressTotal} XP`, inline: true },
                            { name: 'XP', value: 0, inline: true },
                            { name: 'Messages', value: 0, inline: false },
                        )
                        .setFooter(embedSettings.footer, embedSettings.footer_url);
                    return message.channel.send(xpMessage);
                }

                const xpMessage = new Discord.MessageEmbed()
                    .setColor(embedSettings.color)
                    .setAuthor(message.guild.name, `https://cdn.discordapp.com/icons/${message.guild.id}/${message.guild.icon}.png`, '')
                    .setTitle(message.author.tag)
                    .setThumbnail(message.author.avatarURL())
                    .addFields(
                        { name: 'Level', value: module.exports.calculateLevel(result[0].xp).level, inline: true },
                        { name: 'Progress', value: `${module.exports.calculateLevel(result[0].xp).progress}/${module.exports.calculateLevel(result[0].xp).progressTotal} XP`, inline: true },
                        { name: 'XP', value: result[0].xp, inline: true },
                        { name: 'Messages', value: result[0].messages, inline: false },
                    )

                    .setFooter(embedSettings.footer, embedSettings.footer_url);
                message.channel.send(xpMessage);
            });
        } else {
            const userID = args.user.split("<@").join("").split("!").join("").split(">").join("");
            pool.query(`SELECT * FROM experience WHERE guildID = '${message.guild.id}' AND userID = '${userID}'`, function (err, result) {
                if (err) throw err;

                if (!message.guild.members.cache.get(userID)) {
                    const notInGuild = new Discord.MessageEmbed()
                        .setColor(embedSettings.color)
                        .setAuthor("User not found", 'https://images.emojiterra.com/google/android-nougat/512px/26a0.png', '')
                        .setDescription("That user is not in this guild!")

                        //.setTimestamp()
                        .setFooter(embedSettings.footer, embedSettings.footer_url);
                    return message.channel.send(notInGuild);
                }

                if (result.length == 0) {
                    const xpMessage = new Discord.MessageEmbed()
                        .setColor(embedSettings.color)
                        .setAuthor(message.guild.name, `https://cdn.discordapp.com/icons/${message.guild.id}/${message.guild.icon}.png`, '')
                        .setTitle(message.guild.members.cache.get(userID).user.tag)
                        .setThumbnail(message.guild.members.cache.get(userID).user.avatarURL())
                        .addFields(
                            { name: 'Level', value: 0, inline: true },
                            { name: 'Progress', value: `${module.exports.calculateLevel(0).progress}/${module.exports.calculateLevel(0).progressTotal} XP`, inline: true },
                            { name: 'XP', value: 0, inline: true },
                            { name: 'Messages', value: 0, inline: false },
                        )
                        .setFooter(embedSettings.footer, embedSettings.footer_url);
                    return message.channel.send(xpMessage);
                }
                
                const xpMessage = new Discord.MessageEmbed()
                    .setColor(embedSettings.color)
                    .setAuthor(message.guild.name, `https://cdn.discordapp.com/icons/${message.guild.id}/${message.guild.icon}.png`, '')
                    .setTitle(message.guild.members.cache.get(userID).user.tag)
                    .setThumbnail(message.guild.members.cache.get(userID).user.avatarURL())
                    .addFields(
                        { name: 'Level', value: module.exports.calculateLevel(result[0].xp).level, inline: true },
                        { name: 'Progress', value: `${module.exports.calculateLevel(result[0].xp).progress}/${module.exports.calculateLevel(result[0].xp).progressTotal} XP`, inline: true },
                        { name: 'XP', value: result[0].xp, inline: true },
                        { name: 'Messages', value: result[0].messages, inline: false },
                    )

                    .setFooter(embedSettings.footer, embedSettings.footer_url);
                message.channel.send(xpMessage);
            });
        }
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

