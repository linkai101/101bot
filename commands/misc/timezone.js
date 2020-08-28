const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const pool = require('../../lib/dbpool');
const config = require(path.join(__dirname, '..', '..', 'config', 'config.json'));

module.exports = class TimezoneCommand extends Commando.Command {
	constructor(client) {
		super(client, {
			name: 'timezone',
			group: 'misc',
			memberName: 'timezone',
            aliases: ['tz'],
			description: 'Shows or sets the guild timezone.',
            guildOnly: true,
			format: '[prefix/"default"/"none"]',
			examples: ['timezone 0', 'timezone -4', 'timezone -11'],

			args: [
				{
					key: 'timezone',
					prompt: 'What would you like to set the guild\'s timezone to? (in hours offset from UTC)',
					type: 'string',
					max: 5,
					default: ''
				}
			]
		});
	}

	async run(message, args) {
		// Just output the timezone
		if(args.timezone == '') {
            pool.query(`SELECT * FROM timezone WHERE guildID = '${message.guild.id}'`, function (err, result) {
                if (err) throw err;

                var timezone = 0;
                if (result.length != 0) timezone = result[0].utcOffset;


                const timezoneMessage = new Discord.MessageEmbed()
                    .setColor(config.embedSettings.color)
                    .setAuthor('Timezone', `https://cdn.discordapp.com/icons/${message.guild.id}/${message.guild.icon}.png`, '')
                    .setDescription(`The timezone for **${message.guild.name}** is **UTC${timezone<0 ? '-' : '+'}${Math.floor(Math.abs(timezone))}:${Math.abs(timezone)*60%60 < 10 ? '0' + Math.abs(timezone)*60%60 : Math.abs(timezone)*60%60}**.`)

                    .setFooter(config.embedSettings.footer, config.embedSettings.footer_url);
                
                message.channel.send(timezoneMessage);
            });
            return;
        }

        if (Number(args.timezone) >= 12 || Number(args.timezone) <= -12) {
            const invalidTimezoneMessage = new Discord.MessageEmbed()
                    .setColor(config.embedSettings.color)
                    .setAuthor('Invalid timezone', `https://images.emojiterra.com/mozilla/512px/26a0.png`, '')
                    .setDescription(`You have to enter the number of hours offset from UTC!\nThe hours offset cannot be >= 12 or <= -12!`)

                    .setFooter(config.embedSettings.footer, config.embedSettings.footer_url);
                
            return message.channel.send(invalidTimezoneMessage);
        }
		
		// Check the user's permission before changing anything
        if(!message.member.hasPermission('ADMINISTRATOR') && !this.client.isOwner(message.author)) {
            const noPermsMessage = new Discord.MessageEmbed()
                .setColor(config.embedSettings.color)
                .setAuthor('No permission', 'https://images.emojiterra.com/google/android-pie/512px/1f6d1.png', '')
                .setDescription("You do not have the following permissions:\n`ADMINISTRATOR`")

                //.setTimestamp()
                .setFooter(config.embedSettings.footer, config.embedSettings.footer_url);
            return message.channel.send(noPermsMessage);
            //return message.reply('Only administrators may change the command prefix.');
        }

		// Save the timezone
        const timezone = Number(args.timezone);
        
        if (timezone == 0) {
			module.exports.deleteMySQLRecord(message.guild.id);
        } else {
            module.exports.updateMySQLTimezone(message.guild.id, timezone);
        }
		const timezoneChangedMessage = new Discord.MessageEmbed()
			.setColor(config.embedSettings.color)
			.setAuthor('Changed timezone', `https://cdn.discordapp.com/icons/${message.guild.id}/${message.guild.icon}.png`, '')
			.setDescription(`The timezone for **${message.guild.name}** has been changed to **UTC${timezone<0 ? '-' : '+'}${Math.floor(Math.abs(timezone))}:${Math.abs(timezone)*60%60 < 10 ? '0' + Math.abs(timezone)*60%60 : Math.abs(timezone)*60%60}**.`)

			.setFooter(config.embedSettings.footer, config.embedSettings.footer_url);
		
		await message.channel.send(timezoneChangedMessage);
		return null;
	}

	static updateMySQLTimezone(guildID, utcOffset) {
		pool.query(`SELECT * FROM timezone WHERE guildID = '${guildID}'`, function (err, result) {
			if (err) throw err;
			//console.log(result);

			if (result.length != 0) {
				var changePrefix = `UPDATE timezone SET utcOffset = '${utcOffset}' WHERE guildID = '${guildID}'`;
				pool.query(changePrefix, function (err, result) {
					if (err) {throw err;}
					//console.log(result.affectedRows + " record(s) updated");
				});
			} else {
				var addGuildRecord = `INSERT INTO timezone (guildID, utcOffset) VALUES ('${guildID}', '${utcOffset}')`;
				pool.query(addGuildRecord, function (err, result) {
					if (err) throw err;
					//console.log("MYSQL> Inserted 1 record into 'timezone'");
				});
			}
		});
	}

	static deleteMySQLRecord(guildID) {
		var deleteRecord = `DELETE FROM timezone WHERE guildID = '${guildID}'`;
		pool.query(deleteRecord, function (err, result) {
			if (err) throw err;
			//console.log("Number of records deleted: " + result.affectedRows);
		});
	}
};
