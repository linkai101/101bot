const Commando = require('discord.js-commando');
const Discord = require('discord.js');

const path = require('path');
const {embedSettings, API} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class QueueCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'queue',
            aliases: ['q', 'songlist', 'nextsongs'],
            group: 'music',
            memberName: 'queue',
            guildOnly: true,
            description: 'Display the song queue'
        });
    }

    run(message) {
        /*if (message.guild.triviaData.isTriviaRunning)
            return message.say('Try again after the trivia has ended');*/
        /*if (message.guild.musicData.queue.length == 0)
            return message.say('There are no songs in queue!');*/
        const titleArray = [];
        /* eslint-disable */
        // display only first 10 items in queue
        message.guild.musicData.queue.slice(0, 10).forEach(obj => {
            titleArray.push([obj.title, obj.url]);
        });
        /* eslint-enable */
        var queueEmbed = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setTitle(`Music queue for ${message.guild.name}`)
        
        if (!message.guild.musicData.nowPlaying) {
            queueEmbed.addField('Now Playing', 'No songs are playing right now!');
            queueEmbed.setFooter(`0 songs | 00:00 total | ${embedSettings.footer}`, embedSettings.footer_url);
        } else {
            queueEmbed.addField('Now Playing', `[${message.guild.musicData.nowPlaying.title}](${message.guild.musicData.nowPlaying.url}) (${message.guild.musicData.nowPlaying.duration})`);
            queueEmbed.setFooter(`${message.guild.musicData.queue.length+1} songs | ${module.exports.formatDuration(module.exports.queueDuration(message, message.guild.musicData.queue.length))} total | ${embedSettings.footer}`, embedSettings.footer_url);
        }

        for (let i = 0; i < titleArray.length; i++) {
            queueEmbed.addField(`${i + 1}`, `[${titleArray[i][0]}](${titleArray[i][1]}) (${message.guild.musicData.queue[i].duration})`);
        }
        return message.say(queueEmbed);
    }

    static formatDuration(durationObj) {
        const duration = `${durationObj.hours ? (durationObj.hours + ':') : ''}${
        durationObj.minutes ? durationObj.minutes : '00'
        }:${
        (durationObj.seconds < 10)
            ? ('0' + durationObj.seconds)
            : (durationObj.seconds
            ? durationObj.seconds
            : '00')
        }`;
        return duration;
    }

    static queueDuration(message, position) {
        const queue = message.guild.musicData.queue;

        if (queue.length < position) {return false;}

        var duration = message.guild.musicData.nowPlaying.rawDuration;

        /*var duration = {
            weeks: 0,
            years: 0,
            months: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };*/

        var i;
        for (i=0;i<position;i++) {
            duration.weeks += queue[i].rawDuration.weeks;
            duration.years += queue[i].rawDuration.years;
            duration.months += queue[i].rawDuration.months;
            duration.days += queue[i].rawDuration.days;
            duration.hours += queue[i].rawDuration.hours;
            duration.minutes += queue[i].rawDuration.minutes;
            duration.seconds += queue[i].rawDuration.seconds;
        }
        while (duration.seconds>=60) {
            duration.minutes++;
            duration.seconds -= 60;
        }
        while (duration.minutes>=60) {
            duration.hours++;
            duration.minutes -= 60;
        }
        while (duration.hours>=24) {
            duration.days++;
            duration.hours -= 24;
        }
        while (duration.days>=31) {
            duration.months++;
            duration.days -= 31;
        }
        while (duration.months>=12) {
            duration.years++;
            duration.months -= 12;
        }

        return duration;
    }
};