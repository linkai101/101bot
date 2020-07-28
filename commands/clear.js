const Discord = require("discord.js");
module.exports = {
    name: 'clear',
    description: "Clears a specified amount of messages from the channel",
    aliases: ["clear"],
    execute(client, message, args) {
        const {prefix, embedSettings} = require('../config.json');

        const catchErr = err => {
            console.log("ERROR> " + err);
            client.commands.get('error').execute(message, args, err);
        }

        const usageMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Usage", 'https://images.emojiterra.com/twitter/v13.0/512px/1f6e0.png', '')
            .setDescription("`"+prefix+"clear <#ofmessages>`\nOnly deletes messages not older than `14 days`.")

            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);
        
        const clearSuccessMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Clear Successful", 'https://images.emojiterra.com/twitter/512px/1f5d1.png', '')
            .setDescription("`"+args[0]+"` messages have been deleted from <#"+message.channel+">.")

            .setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url)

            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);
        
        if (!message.member.hasPermission(["MANAGE_MESSAGES", "ADMINSTRATOR"])) {client.commands.get('noPermission').execute(message, args, Discord);return;}

        if (args.length < 1) {message.channel.send(usageMessage);return;}
        if (isNaN(args[0])) {message.channel.send(usageMessage);return;}
        if (args[0] < 1) {client.commands.get('error').execute(message, args, "You have to delete at least 1 message!"); return;}
        if (args[0] > 100) {client.commands.get('error').execute(message, args, "You cannot delete more than 100 messages!"); return;}

        message.channel.bulkDelete(args[0]).then(() => {
            message.channel.send(clearSuccessMessage)
                .then(sentMessage => {sentMessage.delete({timeout: 10000});}).catch(catchErr);
        });

    }
}




