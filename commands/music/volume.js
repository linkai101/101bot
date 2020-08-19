const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const {embedSettings, API} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class VolumeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
        name: 'volume',
        aliases: ['changevolume', 'v'],
        group: 'music',
        memberName: 'volume',
        guildOnly: true,
        description: 'Adjust song volume',
        throttling: {
            usages: 1,
            duration: 5
        },
        args: [
            {
                key: 'wantedVolume',
                prompt: 'What volume would you like to set? (1-200)',
                type: 'integer',
                validate: function(wantedVolume) {
                    return wantedVolume >= 1 && wantedVolume <= 200;
                }
            }
        ]
        });
    }

    run(message, { wantedVolume }) {
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
        }
        const volume = wantedVolume / 100;
        message.guild.musicData.volume = volume;
        message.guild.musicData.songDispatcher.setVolume(volume);
        message.say(`Volume changed to: ${wantedVolume}%`);
    }
};