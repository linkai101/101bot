const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const {embedSettings} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class PauseCommand extends Commando.Command {
  constructor(client) {
    super(client, {
        name: 'pause',
        aliases: ['pausesong', 'hold', 'stop'],
        memberName: 'pause',
        group: 'music',
        description: 'Pause the current playing song',
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
        return message.say('There is no song playing right now!');
    }

    message.say('Song paused :pause_button:');

    message.guild.musicData.songDispatcher.pause();
  }
};