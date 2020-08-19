const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const {embedSettings} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class LeaveCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'leave',
      aliases: ['end'],
      group: 'music',
      memberName: 'leave',
      guildOnly: true,
      description: 'Leaves voice channel if in one'
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
    } else if (
        typeof message.guild.musicData.songDispatcher == 'undefined' ||
        message.guild.musicData.songDispatcher == null
    ) {
        message.reply('There is no song playing right now!');
        return;
    } else if (!message.guild.musicData.queue) {
        message.reply('There are no songs in queue');
        return;
    } else if (message.guild.musicData.songDispatcher.paused) {
        message.guild.musicData.songDispatcher.resume();
        setTimeout(() => {
            message.guild.musicData.songDispatcher.end();
        }, 100);
        message.guild.musicData.queue.length = 0;
        return;
    } else {
        message.guild.musicData.songDispatcher.end();
        message.guild.musicData.queue.length = 0;
        return;
    }
  }
};