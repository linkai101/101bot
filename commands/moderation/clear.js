const Discord = require('discord.js');
const Commando = require('discord.js-commando');

const path = require('path');
const {embedSettings} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class ClearCommand extends Commando.Command {
    constructor(client) {
        super(client, {
        name: 'clear',
        aliases: ['delete'],
        group: 'moderation',
        memberName: 'clear',
        guildOnly: true,
        userPermissions: [
            'MANAGE_MESSAGES'
        ],
        clientPermissions: [
            'MANAGE_MESSAGES'
        ],
        description: 'Deletes a specified amount of messages on the text channel',
        args: [
            {
            key: 'numOfLines',
            type: 'integer',
            prompt: 'How lines do you want to delete?'
            }
        ]
        });
    }

    run(message, { numOfLines }) {
        const numTooLowMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Number too low", 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/emojidex/112/warning-sign_26a0.png', '')
            .setDescription("You have to delete at least 1 message!")

            .setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);

        const numTooHighMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Number too high", 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/emojidex/112/warning-sign_26a0.png', '')
            .setDescription("You cannot delete more than 100 messages!")

            .setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);

        if (numOfLines < 1) {message.channel.send(numTooLowMessage); return;}
        if (numOfLines > 100) {message.channel.send(numTooHighMessage); return;}

        const clearSuccessMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Clear Successful", 'https://images.emojiterra.com/twitter/512px/1f5d1.png', '')
            .setDescription("`"+numOfLines+"` messages have been deleted from <#"+message.channel+">.")

            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url)

        
        message.channel.bulkDelete(numOfLines+1).then(() => {
            message.channel.send(clearSuccessMessage)
                .then(sentMessage => {sentMessage.delete({timeout: 5000}).catch(err => {});});
        }).catch(err => {});
    }
};