const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const {embedSettings} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class BanCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'ban',
            group: 'moderation',
            memberName: 'ban',
            description: 'Ban a user from the guild',
            guildOnly: true,
            userPermissions: [
                'BAN_MEMBERS'
            ],
            clientPermissions: [],
            //argsType: 'multiple',
            args: [
                {
                  key: 'user',
                  prompt: 'Which user would you like to ban?',
                  type: 'string'
                },
                {
                  key: 'reason',
                  prompt: 'What is the reason for the ban?',
                  type: 'string'
                }
              ]
        })
    }

    async run (message, args) {
        const invalidUserMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Invalid user", 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/emojidex/112/warning-sign_26a0.png', '')
            .setDescription("That user is not a valid user!")

            .setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);

        let user = message.guild.member(args.user.split("<@!").join("").split(">").join(""));
        if (!user) {message.channel.send(invalidUserMessage);return;}

        const banSuccessMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Ban Successful", 'https://images.emojiterra.com/twitter/512px/1f6e1.png', '')
            .setDescription("<@" + user.id + "> has been permanently banned from **" + message.guild.name + "** for `" + args.reason + '`.')

            .setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);

        const userNotBannableMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("User not bannable", 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/emojidex/112/warning-sign_26a0.png', '')
            .setDescription("That user is not bannable!")

            .setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);

        
        if (!user.bannable) {message.channel.send(userNotBannableMessage);return;}
        message.guild.member(user).ban({reason: args.reason}).catch(err => {});
        message.channel.send(banSuccessMessage);

    }
}

