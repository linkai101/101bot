const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const {prefix, embedSettings} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class KickCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'kick',
            group: 'moderation',
            memberName: 'kick',
            description: 'Kick a user from the guild',
            guildOnly: true,
            userPermissions: [
                'KICK_MEMBERS'
            ],
            clientPermissions: [
                'KICK_MEMBERS'
            ],
            //argsType: 'multiple',
            args: [
                {
                  key: 'user',
                  prompt: 'Which user would you like to kick?',
                  type: 'string'
                },
                {
                  key: 'reason',
                  prompt: 'What is the reason for the kick?',
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

        const kickSuccessMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Kick Successful", 'https://images.emojiterra.com/twitter/512px/1f6e1.png', '')
            .setDescription("<@" + user.id + "> has been kicked from **" + message.guild.name + "** for `" + args.reason + '`.')

            .setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);
        
        const userNotKickableMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("User not kickable", 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/emojidex/112/warning-sign_26a0.png', '')
            .setDescription("That user is not kickable!")

            .setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);

        
        if (!user.kickable) {message.channel.send(userNotKickableMessage);return;}
        user.kick(args.reason).catch(err => {});
        message.channel.send(kickSuccessMessage);
    }
}

