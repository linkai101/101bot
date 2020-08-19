const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const {embedSettings, API} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const { GitObject } = require('git');
const yt = new Youtube(API.youtubeAPI);

module.exports = class PlayCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'play',
            aliases: ['p', 'playsong', 'add'],
            memberName: 'play',
            group: 'music',
            description: 'Play any song or playlist from YouTube',
            guildOnly: true,
            userPermissions: [],
            clientPermissions: ['SPEAK', 'CONNECT'],
            throttling: {
                usages: 5,
                duration: 10
            },
            args: [{
                key: 'query',
                prompt: 'What song or playlist would you like to play?',
                type: 'string',
                validate: function(query) {
                    return query.length > 0 && query.length < 200;
            }}]
        });
    }

    async run(message, { query }) {
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

        /*if (message.guild.triviaData.isTriviaRunning == true) {
            return message.say('Please try after the trivia has ended');
        }*/

        if (
        // if the user entered a youtube playlist url
            query.match(/^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/)) {
            const playlist = await yt.getPlaylist(query).catch(function() {
                return message.say('Playlist is either private or it does not exist!');
            });
            // add 10 as an argument in getVideos() if you choose to limit the queue
            const videosObj = await playlist.getVideos().catch(function() {
                return message.say(
                'There was a problem getting one of the videos in the playlist!'
                );
            });
            for (let i = 0; i < videosObj.length; i++) {
                if (videosObj[i].raw.status.privacyStatus == 'private') {
                    continue;
                } else {
                    try {
                        const video = await videosObj[i].fetch();
                        // this can be uncommented if you choose to limit the queue
                        // if (message.guild.musicData.queue.length < 10) {
                        //
                        message.guild.musicData.queue.push(
                        PlayCommand.constructSongObj(video, voiceChannel)
                        );
                        // } else {
                        //   return message.say(
                        //     `I can't play the full playlist because there will be more than 10 songs in queue`
                        //   );
                        // }
                    } catch (err) {
                        console.error(err);
                    }
                }
            }
            if (message.guild.musicData.isPlaying == false) {
                message.guild.musicData.isPlaying = true;
                return PlayCommand.playSong(message.guild.musicData.queue, message);
            } else if (message.guild.musicData.isPlaying == true) {
                return message.say(
                    `Playlist - :musical_note:  ${playlist.title} :musical_note: has been added to queue`
                );
            }
        }

        // This if statement checks if the user entered a youtube url, it can be any kind of youtube url
        if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
            query = query
                .replace(/(>|<)/gi, '')
                .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
            const id = query[2].split(/[^0-9a-z_\-]/i)[0];
            const video = await yt.getVideoByID(id).catch(function() {
                return message.say(
                'There was a problem getting the video you provided.'
                );
            });
            // // can be uncommented if you don't want the bot to play live streams
            // if (video.raw.snippet.liveBroadcastContent === 'live') {
            //   return message.say("I don't support live streams!");
            // }
            // // can be uncommented if you don't want the bot to play videos longer than 1 hour
            // if (video.duration.hours !== 0) {
            //   return message.say('I cannot play videos longer than 1 hour');
            // }
            // // can be uncommented if you want to limit the queue
            // if (message.guild.musicData.queue.length > 10) {
            //   return message.say(
            //     'There are too many songs in the queue already, skip or wait a bit'
            //   );
            // }
            message.guild.musicData.queue.push(
                PlayCommand.constructSongObj(video, voiceChannel)
            );
            if (
                message.guild.musicData.isPlaying == false ||
                typeof message.guild.musicData.isPlaying == 'undefined'
            ) {
                message.guild.musicData.isPlaying = true;
                return PlayCommand.playSong(message.guild.musicData.queue, message);
            } else if (message.guild.musicData.isPlaying == true) {
                const addedToQueueEmbed = new Discord.MessageEmbed()
                    .setThumbnail(video.thumbnails.default.url)
                    .setColor(embedSettings.color)
                    .setAuthor('Added to queue')
                    .setTitle(video.title)
                    .setURL(video.url)
                    .addField('Channel', video.channel.title)
                    .addFields (
                        { name: 'Duration', value: module.exports.formatDuration(video.duration), inline: true },
                        { name: 'Position in queue', value: message.guild.musicData.queue.length, inline: true },
                        { name: 'ETA', value: module.exports.formatDuration(module.exports.queueDuration(message, message.guild.musicData.queue.length-1)), inline: true },
                    )
                    .setFooter(embedSettings.footer, embedSettings.footer_url);
                return message.channel.send(addedToQueueEmbed);
            }
        }

        // if user provided a song/video name
        const videos = await yt.searchVideos(query, 5).catch(async function() {
            await message.say(
                'There was a problem searching the video you requested.'
            );
        });
        if (videos.length < 5 || !videos) {
            return message.say(
                `I had some trouble finding what you were looking for, please try again or be more specific`
            );
        }
        const vidNameArr = [];
        for (let i = 0; i < videos.length; i++) {
            vidNameArr.push(`${i + 1}: ${videos[i].title}`);
        }
        vidNameArr.push('exit');
        const embed = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setTitle('Choose a song by replying a number between 1 and 5')
            .addField('Song 1', vidNameArr[0])
            .addField('Song 2', vidNameArr[1])
            .addField('Song 3', vidNameArr[2])
            .addField('Song 4', vidNameArr[3])
            .addField('Song 5', vidNameArr[4])
            .addField('Exit', 'exit')
            .setFooter(embedSettings.footer, embedSettings.footer_url);
        var songEmbed = await message.channel.send({ embed });
        message.channel.awaitMessages(
            function(msg) {
                return (msg.content > 0 && msg.content < 6) || msg.content === 'exit';
            },
            {
                max: 1,
                time: 60000,
                errors: ['time']
            }
        ).then(function(response) {
            const videoIndex = parseInt(response.first().content);
            if (response.first().content === 'exit') return songEmbed.delete();
            yt.getVideoByID(videos[videoIndex - 1].id).then(function(video) {
                // // can be uncommented if you don't want the bot to play live streams
                // if (video.raw.snippet.liveBroadcastContent === 'live') {
                //   songEmbed.delete();
                //   return message.say("I don't support live streams!");
                // }

                // // can be uncommented if you don't want the bot to play videos longer than 1 hour
                // if (video.duration.hours !== 0) {
                //   songEmbed.delete();
                //   return message.say('I cannot play videos longer than 1 hour');
                // }

                // // can be uncommented if you don't want to limit the queue
                // if (message.guild.musicData.queue.length > 10) {
                //   songEmbed.delete();
                //   return message.say(
                //     'There are too many songs in the queue already, skip or wait a bit'
                //   );
                // }
                message.guild.musicData.queue.push(
                    PlayCommand.constructSongObj(video, voiceChannel)
                );
                if (message.guild.musicData.isPlaying == false) {
                    message.guild.musicData.isPlaying = true;
                    if (songEmbed) {
                        songEmbed.delete();
                    }
                    PlayCommand.playSong(message.guild.musicData.queue, message);
                } else if (message.guild.musicData.isPlaying == true) {
                    if (songEmbed) {
                        songEmbed.delete();
                    }
                    const addedToQueueEmbed = new Discord.MessageEmbed()
                        .setThumbnail(video.thumbnails.default.url)
                        .setColor(embedSettings.color)
                        .setAuthor('Added to queue')
                        .setTitle(video.title)
                        .setURL(video.url)
                        .addField('Channel', video.channel.title)
                        .addFields (
                            { name: 'Duration', value: module.exports.formatDuration(video.duration), inline: true },
                            { name: 'Position in queue', value: message.guild.musicData.queue.length, inline: true },
                            { name: 'ETA', value: module.exports.formatDuration(module.exports.queueDuration(message, message.guild.musicData.queue.length-1)), inline: true },
                        )
                        .setFooter(embedSettings.footer, embedSettings.footer_url);
                    return message.channel.send(addedToQueueEmbed);
                }
            }).catch(function() {
                if (songEmbed) {
                    songEmbed.delete();
                }
                return message.say('An error has occured when trying to get the video ID from youtube');
            });
        }).catch(function() {
            if (songEmbed) {
                songEmbed.delete();
            }
            return message.say('Please try again and enter a number between 1 and 5 or exit');
        });
    }
    static playSong(queue, message) {
        const classThis = this; // use classThis instead of 'this' because of lexical scope below
        queue[0].voiceChannel
        .join()
        .then(function(connection) {
            const dispatcher = connection.play(ytdl(queue[0].url, {quality: 'highestaudio', highWaterMark: 1 << 25}))
            .on('start', function() {
                message.guild.musicData.songDispatcher = dispatcher;
                dispatcher.setVolume(message.guild.musicData.volume);
                const videoEmbed = new Discord.MessageEmbed()
                    .setThumbnail(queue[0].thumbnail)
                    .setColor(embedSettings.color)
                    .setAuthor('Now Playing')
                    .setTitle(queue[0].title)
                    .setURL(queue[0].url)
                    .addField('Duration', queue[0].duration)
                    .setFooter(embedSettings.footer, embedSettings.footer_url);
                if (queue[1]) videoEmbed.addField('Up Next:', queue[1].title);
                message.say(videoEmbed);
                message.guild.musicData.nowPlaying = queue[0];
                return queue.shift();
            })
            .on('finish', function() {
                if (queue.length >= 1) {
                    return classThis.playSong(queue, message);
                } else {
                    message.guild.musicData.isPlaying = false;
                    message.guild.musicData.nowPlaying = null;
                    message.guild.musicData.songDispatcher = null;
                    if (message.guild.me.voice.channel) {
                        return message.guild.me.voice.channel.leave();
                    }
                }
            })
            .on('error', function(e) {
                const errorMessage = new Discord.MessageEmbed()
                    .setColor(embedSettings.color)
                    .setAuthor("Error", 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/emojidex/112/warning-sign_26a0.png', '')
                    .setDescription("An error occured!\n\nID: `" + e + "`")

                    .setTimestamp()
                    .setFooter(embedSettings.footer, embedSettings.footer_url);
                message.channel.send(errorMessage);
                //message.say('Cannot play song');

                console.log("ERROR> " + e);
                message.guild.musicData.queue.length = 0;
                message.guild.musicData.isPlaying = false;
                message.guild.musicData.nowPlaying = null;
                message.guild.musicData.songDispatcher = null;
                return message.guild.me.voice.channel.leave();
            });
        })
        .catch(function(e) {
            console.error(e);
            return message.guild.me.voice.channel.leave();
        });
    }
    static constructSongObj(video, voiceChannel) {
        let duration = this.formatDuration(video.duration);
        if (duration == '00:00') duration = 'Live Stream';
        return {
        url: `https://www.youtube.com/watch?v=${video.raw.id}`,
        title: video.title,
        rawDuration: video.duration,
        duration,
        thumbnail: video.thumbnails.high.url,
        voiceChannel
        };
    }
    // prettier-ignore
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


        const timeLeftInMS = message.guild.musicData.songDispatcher.streamTime;
        const timeLeftInMSObj = {
            weeks: 0,
            years: 0,
            months: 0,
            days: 0,
            seconds: Math.floor((timeLeftInMS / 1000) % 60),
            minutes: Math.floor((timeLeftInMS / (1000 * 60)) % 60),
            hours: Math.floor((timeLeftInMS / (1000 * 60 * 60)) % 24)
        };
        //var duration = message.guild.musicData.nowPlaying.rawDuration;
        var duration = Object.keys(message.guild.musicData.nowPlaying.rawDuration).reduce((a, k) => {
            a[k] = message.guild.musicData.nowPlaying.rawDuration[k] - timeLeftInMSObj[k];
            return a;
        }, {});


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
