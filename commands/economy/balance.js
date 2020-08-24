const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const pool = require('../../lib/dbpool');
const {embedSettings, mySQL} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class BalanceCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'balance',
            group: 'economy',
            memberName: 'balance',
            aliases: ['bal'],
            description: 'Displays the balance of a user',
            guildOnly: true,
            userPermissions: [],
            clientPermissions: [],
            //argsType: 'multiple',
            args: [
                {
					key: 'user',
                    prompt: 'Which user do you want to see the balance of?',
                    type: 'string',
					default: ''
				}
            ]
        })
    }

    async run (message, args) {
        if (!args.user) {
            pool.query(`SELECT * FROM economy WHERE guildID = '${message.guild.id}' AND userID = '${message.author.id}'`, function (err, result) {
                if (err) throw err;

                if (result.length == 0) {
                    const balanceMessage = new Discord.MessageEmbed()
                        .setColor(embedSettings.color)
                        .setAuthor(message.guild.name, `https://cdn.discordapp.com/icons/${message.guild.id}/${message.guild.icon}.png`, '')
                        .setTitle(message.author.tag)
                        .setThumbnail(message.author.avatarURL())
                        .addFields(
                            { name: 'Balance', value: '$0', inline: true },
                        )
                        .setFooter(embedSettings.footer, embedSettings.footer_url);
                    return message.channel.send(balanceMessage);
                }

                const balanceMessage = new Discord.MessageEmbed()
                    .setColor(embedSettings.color)
                    .setAuthor(message.guild.name, `https://cdn.discordapp.com/icons/${message.guild.id}/${message.guild.icon}.png`, '')
                    .setTitle(message.author.tag)
                    .setThumbnail(message.author.avatarURL())
                    .addFields(
                        { name: 'Balance', value: `$${result[0].balance}`, inline: true },
                    )

                    .setFooter(embedSettings.footer, embedSettings.footer_url);
                message.channel.send(balanceMessage);
            });
        } else {
            const userID = args.user.split("<@").join("").split("!").join("").split(">").join("");
            pool.query(`SELECT * FROM economy WHERE guildID = '${message.guild.id}' AND userID = '${userID}'`, function (err, result) {
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
                    const balanceMessage = new Discord.MessageEmbed()
                        .setColor(embedSettings.color)
                        .setAuthor(message.guild.name, `https://cdn.discordapp.com/icons/${message.guild.id}/${message.guild.icon}.png`, '')
                        .setTitle(message.guild.members.cache.get(userID).user.tag)
                        .setThumbnail(message.guild.members.cache.get(userID).user.avatarURL())
                        .addFields(
                            { name: 'Balance', value: '$0', inline: true },
                        )
                        .setFooter(embedSettings.footer, embedSettings.footer_url);
                    return message.channel.send(balanceMessage);
                }
                
                const balanceMessage = new Discord.MessageEmbed()
                    .setColor(embedSettings.color)
                    .setAuthor(message.guild.name, `https://cdn.discordapp.com/icons/${message.guild.id}/${message.guild.icon}.png`, '')
                    .setTitle(message.guild.members.cache.get(userID).user.tag)
                    .setThumbnail(message.guild.members.cache.get(userID).user.avatarURL())
                    .addFields(
                        { name: 'Balance', value: `$${result[0].balance}`, inline: true },
                    )

                    .setFooter(embedSettings.footer, embedSettings.footer_url);
                message.channel.send(balanceMessage);
            });
        }
    }
}

