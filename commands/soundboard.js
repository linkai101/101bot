const Discord = require("discord.js");

module.exports = {
    name: 'soundboard',
    aliases: ["soundboard", "sb"],
    description: "Plays a sound effect in the VC that you're connected to",
    execute(client, message, args, sounds) {
        const {prefix, embedSettings} = require('../config.json');

        const catchErr = err => {
            console.log("ERROR> " + err);
            client.commands.get('error').execute(message, args, err);
        }
        
        const usageMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Usage", 'https://images.emojiterra.com/twitter/v13.0/512px/1f6e0.png', '')
            .setDescription("`"+prefix+"soundboard <sound>`\n"+
            "`"+prefix+"soundboard list`"
            )
            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);
        
        const soundsListMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("Sounds", 'https://images.emojiterra.com/mozilla/512px/1f4e2.png', '')
            //.setDescription(sounds.join('\n'))

            .addFields(
                { name: '\u200b', value: 
                    sounds.slice(0,Math.ceil(sounds.length/3)), 
                inline: true },
                { name: '\u200b', value: 
                    sounds.slice(Math.ceil(sounds.length/3),2*Math.ceil(sounds.length/3)), 
                inline: true },
                { name: '\u200b', value: 
                    sounds.slice(2*Math.ceil(sounds.length/3),sounds.length), 
                inline: true },
            )

            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);
        
        const notInVCMessage = new Discord.MessageEmbed()
            .setColor(embedSettings.color)
            .setAuthor("You are not in a voice channel", 'https://images.emojiterra.com/google/android-nougat/512px/26a0.png', '')
            .setDescription("You have to be in a voice channel to do this!")

            //.setTimestamp()
            .setFooter(embedSettings.footer, embedSettings.footer_url);

        if (args.length == 0) {message.channel.send(usageMessage);return;}
        if (args[0] == 'list') {message.channel.send(soundsListMessage);return;}
        if (!sounds.includes(args[0])) {message.channel.send(usageMessage);return;}

        let voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {message.channel.send(notInVCMessage);return;}

        voiceChannel.join().then(connection => {
            console.log('VOICE> Connected to voice channel ('+voiceChannel.id+')')
            const dispatcher = connection.play(require('path').resolve(__dirname, '../soundboard/'+args[0]+'.mp3'))
            dispatcher.on('start', () => {
                console.log('VOICE> Started playing '+args[0]+'.mp3');
            });
            dispatcher.on('finish', () => {
                console.log('VOICE> Finished playing '+args[0]+'.mp3');
                voiceChannel.leave();
                console.log('VOICE> Disconnected from voice channel ('+voiceChannel.id+')')
            });
        }).catch(catchErr);

    }
}




