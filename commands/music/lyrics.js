const Commando = require('discord.js-commando');
const Discord = require('discord.js');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const path = require('path');
const {embedSettings, API} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class LyricsCommand extends Commando.Command {
    constructor(client) {
        super(client, {
        name: 'lyrics',
        memberName: 'lyrics',
        description:
            'Get lyrics of any song or the lyrics of the currently playing song',
        group: 'music',
        throttling: {
            usages: 1,
            duration: 10
        },
        args: [
            {
            key: 'songName',
            default: '',
            type: 'string',
            prompt: 'What song lyrics would you like to get?'
            }
        ]
        });
    }
    async run(message, { songName }) {
        if (songName == '' && !message.guild) {
            return message.say('You are not in a guild and no song is playing right now, please try again with a song name or play a song first');
        }
        if (
            songName == '' &&
            message.guild.musicData.isPlaying /*&&
            !message.guild.triviaData.isTriviaRunning*/
        ) {
            songName = message.guild.musicData.nowPlaying.title;
        /*} else if (songName == '' && message.guild.triviaData.isTriviaRunning) {
            return message.say('Please try again after the trivia has ended');*/
        } else if (songName == '' && !message.guild.musicData.isPlaying) {
            return message.say('There is no song playing right now, please try again with a song name or play a song first');
        }
        const sentMessage = await message.channel.send('👀 Searching for lyrics 👀');
        // get song id
        songName = songName.replace(/ *\([^)]*\) */g, ''); // remove stuff like (Official Video)
        songName = songName.replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
        ''
        ); // remove emojis
        var url = `https://api.genius.com/search?q=${encodeURI(songName)}`;

        const headers = {Authorization: `Bearer ${API.geniusLyricsAPI}`};
        try {
            var body = await fetch(url, { headers });
            var result = await body.json();
            const songPath = result.response.hits[0].result.api_path;
            // get lyrics
            url = `https://api.genius.com${songPath}`;
            body = await fetch(url, { headers });
            result = await body.json();

            const song = result.response.song;

            let lyrics = await getLyrics(song.url);
            lyrics = lyrics.replace(/(\[.+\])/g, '');
            if (!lyrics) {
                return message.say('No lyrics have been found for your query, please try again and be more specific.');
            }

            if (lyrics.length > 4095)
                return message.say('Lyrics are too long to be returned in a message embed');
            if (lyrics.length < 2048) {
                const lyricsEmbed = new Discord.MessageEmbed()
                    .setColor(embedSettings.color)
                    .setDescription(lyrics.trim())
                    .setFooter(embedSettings.footer, embedSettings.footer_url);
                return sentMessage.edit('', lyricsEmbed);
            } else {
                // 2048 < lyrics.length < 4096
                const firstLyricsEmbed = new Discord.MessageEmbed()
                    .setColor(embedSettings.color)
                    .setDescription(lyrics.slice(0, 2048))
                    .setFooter(embedSettings.footer, embedSettings.footer_url);
                const secondLyricsEmbed = new Discord.MessageEmbed()
                    .setColor(embedSettings.color)
                    .setDescription(lyrics.slice(2048, lyrics.length))
                    .setFooter(embedSettings.footer, embedSettings.footer_url);
                sentMessage.edit('', firstLyricsEmbed);
                message.channel.send(secondLyricsEmbed);
                return;
            }
        } catch (e) {
            return sentMessage.edit('Something went wrong, please try again or be more specific');
        }
        async function getLyrics(url) {
            const response = await fetch(url);
            const text = await response.text();
            const $ = cheerio.load(text);
            return $('.lyrics')
                .text()
                .trim();
        }
    }
};