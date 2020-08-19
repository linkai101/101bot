const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const {embedSettings} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class SkipCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'skip',
            aliases: ['s', 'skipsong', 'advancesong'],
            memberName: 'skip',
            group: 'music',
            description: 'Skip the current playing song',
            guildOnly: true
        });
    }

    run(message) {
        const voiceChannel = message.member.voice.channel;
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
        } /*else if (message.guild.triviaData.isTriviaRunning) {
            return message.reply(`You can't skip a trivia! Use end-trivia`);
        }*/
        message.guild.musicData.songDispatcher.end();
    }
};