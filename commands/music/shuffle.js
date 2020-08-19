const Commando = require('discord.js-commando');
const Discord = require('discord.js');

const path = require('path');
const {embedSettings, API} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class ShuffleQueueCommand extends Commando.Command {
    constructor(client) {
        super(client, {
        name: 'shuffle',
        memberName: 'shuffle',
        group: 'music',
        description: 'Shuffle the song queue',
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

        if (message.guild.musicData.queue.length < 1)
        return message.say('There are no songs in queue');

        shuffleQueue(message.guild.musicData.queue);

        const titleArray = [];
        message.guild.musicData.queue.slice(0, 10).forEach(obj => {
            titleArray.push(obj.title);
        });
        var numOfEmbedFields = 10;
        if (titleArray.length < 10) numOfEmbedFields = titleArray.length;
        var queueEmbed = new Discord.MessageEmbed()
            .setColor('#ff7373')
            .setTitle('New Music Queue')
            .setFooter(embedSettings.footer, embedSettings.footer_url);
        for (let i = 0; i < numOfEmbedFields; i++) {
            queueEmbed.addField(`${i + 1}:`, `${titleArray[i]}`);
        }
        return message.say(queueEmbed);
    }
};

function shuffleQueue(queue) {
    for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
    }
}