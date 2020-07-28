const Discord = require("discord.js");
module.exports = {
    name: 'unban',
    description: "Unbans a banned member",
    aliases: ["unban"],
    async execute(client, message, args) {
        const {prefix, embedSettings} = require('../config.json');

        const catchErr = err => {
            console.log("ERROR> " + err);
            client.commands.get('error').execute(message, args, err);
        }

        const usageMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Usage", 'https://images.emojiterra.com/twitter/v13.0/512px/1f6e0.png', '')
            .setDescription("`"+prefix+"unban <userID> <reason>`")

            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);
        
        if (!message.member.hasPermission(["BAN_MEMBERS", "ADMINSTRATOR"])) {client.commands.get('noPermission').execute(message, args, Discord);return;}
        if (args.length < 2) {
            message.channel.send(usageMessage);
            return;
        }

        const unbanReason = message.content.substr(prefix.length+6+args[0].length+1,message.content.length-1); // Unban reason
        const memberID = args[0].split("<@").join("").split("!").join("").split(">").join(""); // Member ID that was inputted

        const banList = await message.guild.fetchBans().catch(catchErr); // Banlist
        const bannedUser = await message.guild.fetchBan(memberID).catch(catchErr);
        //const bannedUser = banList.find(user => user.id === memberID).catch(catchErr); // Finds banned user in banlist
        
        if (!bannedUser) {return;} // await client.commands.get('error').execute(message, args, "User not banned"); 

        const unbanSuccessMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Unban Successful", 'https://images.emojiterra.com/twitter/512px/1f6e1.png', '')
            .setDescription("<@"+ memberID + "> has been unbanned from **" + message.guild.name + "** for `" + unbanReason + '`.')

            .setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);


        message.guild.members.unban(memberID).catch(catchErr);
        message.channel.send(unbanSuccessMessage);

    }
}




