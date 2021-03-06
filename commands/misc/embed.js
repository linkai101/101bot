const Discord = require('discord.js');
const Commando = require('discord.js-commando');

const path = require('path');
const {prefix, embedSettings} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class EmbedCommand extends Commando.Command {
    constructor(client) {
        super(client, {
        name: 'embed',
        aliases: ['embedmessage', 'e'],
        group: 'misc',
        memberName: 'embed',
        description: 'Sends a custom embed message',
        guildOnly: false,
        userPermissions: [],
        clientPermissions: []
        });
    }

    run(message, args) {
        const embedFormat = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor('Embed Format', embedSettings.image_url, '')
            .setDescription("```" + prefix + "embed {"
                    +'\n    "color": "#xxxxxx",'
                    +'\n    "author": "",'
                    +'\n    "author_image": "",'
                    +'\n    "author_link": "",'
                    +'\n    "title": "",'
                    +'\n    "title_link": "",'
                    +'\n    "description": "",'
                    +'\n    "thumbnail_image": "",'
                    +'\n    "timestamp": true/false,'
                    +'\n    "footer": "",'
                    +'\n    "footer_image": ""'
                    +'\n}```'
                    +'\n Use `\\n` to create a new line'
                    +"\n Discord [text formatting](https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline-) applies")

            .setFooter(embedSettings.footer, embedSettings.footer_url);
        
        if (args.length == 0) {
            message.channel.send(embedFormat);
        } else {
            let rawEmbed;
            try {
                rawEmbed = JSON.parse(
                    message.content.substr(message.content.indexOf('{'),message.content.indexOf('}')) // Gets text surrounded by {}
                )
            } catch (err) {
                client.commands.get('error').execute(message, args, "Incorrect embed format");
                return;
            }
            
            // Gives error message if embed elements aren't inputted correctly
            if (rawEmbed.length < 11) {
                client.commands.get('error').execute(message, args, "Incorrect embed format");
                return;
            }

            // Embed
            let finalEmbed = new Discord.MessageEmbed()
                .setColor(rawEmbed.color)
                .setTitle(rawEmbed.title)
                .setURL(rawEmbed.title_link)
                .setAuthor(rawEmbed.author, rawEmbed.author_image, rawEmbed.author_link)
                .setDescription(rawEmbed.description)
                .setThumbnail(rawEmbed.thumbnail_image)
                .setFooter(rawEmbed.footer, rawEmbed.footer_image);
            
            // If timestamp element is true, add timestamp
            if (rawEmbed.timestamp) {finalEmbed = finalEmbed.setTimestamp();}

            // Sends the embed
            message.channel.send(finalEmbed);
        }
    }
};