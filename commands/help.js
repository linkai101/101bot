const Discord = require("discord.js");
module.exports = {
    name: 'help',
    description: "Displays the help page",
    aliases: ["help"],
    execute(client, message, args) {
        const {prefix, embedSettings} = require('../config.json');

        const unknownSubcommandMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor('Unknown subcommand', embedSettings.image_url, '')
            .setDescription("Type `" + prefix + "help` for the help page.")

            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);
        
        const mainHelpPage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor('101bot Help', embedSettings.image_url, '')
            .setDescription('101bot is an experimental Discord bot created by linkai101 that serves many purposes.')
            .setThumbnail(embedSettings.image_url)
            .addFields(
                { name: '\u200b', value: '\u200b' },
                { name: 'Commands', value: '`' + prefix + 'help commands`', inline: true },
                { name: 'Moderator', value: '`' + prefix + 'help moderator`', inline: true },
                { name: 'Settings', value: '`' + prefix + 'help settings`', inline: true },
            )
            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);
        
        const commandsHelpPage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor('101bot Help - Commands', embedSettings.image_url, '')
            .setThumbnail(embedSettings.image_url)
            .addFields(
                { name: "`"+prefix+"ping`", value: client.commands.get('ping').description, inline: false },
                { name: "`"+prefix+"serverinfo`", value: client.commands.get('serverInfo').description, inline: false },
                { name: "`"+prefix+"embed`", value: client.commands.get('embed').description, inline: false },
                { name: "`"+prefix+"rickroll`", value: client.commands.get('rickRoll').description, inline: false },
                { name: "`"+prefix+"soundboard`", value: client.commands.get('soundboard').description, inline: false }
            )
            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);
        
        const moderatorHelpPage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor('101bot Help - Moderator', embedSettings.image_url, '')
            .setThumbnail(embedSettings.image_url)
            .addFields(
                { name: "`"+prefix+"kick`", value: client.commands.get('kick').description, inline: true },
                { name: "`"+prefix+"ban`", value: client.commands.get('ban').description, inline: true },
                { name: "`"+prefix+"tempban`", value: client.commands.get('tempban').description, inline: true },
                { name: "`"+prefix+"unban`", value: client.commands.get('unban').description, inline: true },
                { name: "`"+prefix+"banlist`", value: client.commands.get('banList').description, inline: true },
                { name: "`"+prefix+"clear`", value: client.commands.get('clear').description, inline: false }
            )
            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);
        
        const settingsHelpPage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor('101bot Help - Settings', embedSettings.image_url, '')
            .setThumbnail(embedSettings.image_url)
            .setDescription("Not implemented yet!")
            .addFields(
            )
            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);
        
        if (args.length == 0) {message.channel.send(mainHelpPage);}
        else if (args.length == 1 && args[0] == "commands") {message.channel.send(commandsHelpPage);}
        else if (args.length == 1 && args[0] == "moderator") {message.channel.send(moderatorHelpPage);}
        else if (args.length == 1 && args[0] == "settings") {message.channel.send(settingsHelpPage);}
        else {message.channel.send(unknownSubcommandMessage);}
    }
}


