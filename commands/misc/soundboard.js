const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const {embedSettings} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class SoundboardCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'soundboard',
            aliases: ['sb'],
            group: 'misc',
            memberName: 'soundboard',
            description: 'Plays a sound effect into the voice channel',
            guildOnly: true,
            userPermissions: [],
            //clientPermissions: ['SPEAK', 'CONNECT']
        })
    }

    async run (message, args) {
        const tempDisabledMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Feature is disabled", 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/mozilla/36/no-entry-sign_1f6ab.png', '')
            .setDescription("That feature is temporarily disabled!")

            .setFooter(embedSettings.footer, embedSettings.footer_url);

        message.channel.send(tempDisabledMessage);
    }
}

