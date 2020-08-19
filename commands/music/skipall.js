const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const {embedSettings} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class SkipAllCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'skipall',
            aliases: ['skipqueue'],
            memberName: 'skipall',
            group: 'music',
            description: 'Skip all songs in queue',
            guildOnly: true
        });
    }

    run(message) {
        var voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            const notInVCMessage = new Discord.MessageEmbed()
                .setColor(embedSettings.color)
                .setAuthor("You are not in a voice channel", 'https://images.emojiterra.com/google/android-nougat/512px/26a0.png', '')
                .setDescription("You have to be in a voice channel to do that!")
    
                //.setTimestamp()
                .setFooter(embedSettings.footer, embedSettings.footer_url);
    
            return message.channel.send(notInVCMessage);
        }

        if (
            typeof message.guild.musicData.songDispatcher == 'undefined' ||
            message.guild.musicData.songDispatcher == null
        ) {
            return message.reply('There is no song playing right now!');
        }
        if (!message.guild.musicData.queue) {
            return message.say('There are no songs in queue');
        }
        message.guild.musicData.songDispatcher.end();
        message.guild.musicData.queue.length = 0; // clear queue
        return;
    }
};