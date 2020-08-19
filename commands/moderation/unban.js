const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const {embedSettings} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class UnbanCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'unban',
            group: 'moderation',
            memberName: 'unban',
            description: 'Unban a banned user from the guild',
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
        const userID = args.user.split("<@").join("").split("!").join("").split(">").join(""); // Member ID that was inputted

        const banList = await message.guild.fetchBans().catch(err => {}); // Banlist
        const bannedUser = await message.guild.fetchBan(userID).catch(err => {});
        //const bannedUser = banList.find(user => user.id === userID).catch(err => {}); // Finds banned user in banlist
        
        const userNotBannedMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("User not banned", 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/emojidex/112/warning-sign_26a0.png', '')
            .setDescription("That user is not banned from this guild!")

            .setFooter(embedSettings.footer, embedSettings.footer_url);

        if (!bannedUser) {await message.channel.send(userNotBannedMessage);return;}

        const unbanSuccessMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Unban Successful", 'https://images.emojiterra.com/twitter/512px/1f6e1.png', '')
            .setDescription("<@"+ userID + "> has been unbanned from **" + message.guild.name + "** for `" + args.reason + '`.')

            .setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);


        message.guild.members.unban(userID).catch(err => {});
        message.channel.send(unbanSuccessMessage);
    }
}

