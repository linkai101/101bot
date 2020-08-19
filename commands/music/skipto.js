const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const {embedSettings} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class SkipToCommand extends Commando.Command {
    constructor(client) {
        super(client, {
        name: 'skipto',
        memberName: 'skipto',
        group: 'music',
        description: 'Skip to a specific song in the queue (provide the song number)',
        guildOnly: true,
        args: [
            {
            key: 'songNumber',
            prompt:
                'What is the number in queue of the song you want to skip to? (>1)',
            type: 'integer'
            }
        ]
        });
    }

    run(message, { songNumber }) {
        if (songNumber < 1 && songNumber >= message.guild.musicData.queue.length) {
            return message.reply('Please enter a valid song number');
        }
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

        if (message.guild.musicData.queue < 1) return message.say('There are no songs in queue');

        message.guild.musicData.queue.splice(0, songNumber - 1);
        message.guild.musicData.songDispatcher.end();
        return;
    }
};