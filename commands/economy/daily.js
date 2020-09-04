const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const pool = require('../../lib/dbpool');
const {embedSettings} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));
const {dailyReward, streakReward} = require(path.join(__dirname, '..', '..', 'config', 'economy.json'));

module.exports = class DailyCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'daily',
            group: 'economy',
            memberName: 'daily',
            aliases: ['d'],
            description: 'Gives the daily reward',
            guildOnly: true,
            userPermissions: [],
            clientPermissions: [],
            //argsType: 'multiple',
            args: []
        })
    }

    async run (message, args) {
        pool.query(`SELECT * FROM economy WHERE userID = '${message.author.id}' AND guildID = '${message.guild.id}'`, function (err, result) {
            if (err) throw err;

            var ecoRecord = result[0];

            const dailyCooldown = 86400000; // In ms
            
            if (result.length == 0) {
                var addDailyRecord = `INSERT INTO economy (guildID, userID, balance, lastDailyTimestamp, lastDailyXP) VALUES ('${message.guild.id}', '${message.author.id}', 0, ${message.createdTimestamp - dailyCooldown}, 0)`;
                pool.query(addDailyRecord, function (err, result) {
                    if (err) throw err;
                });

                ecoRecord = {
                    id: null,
                    guildID: message.guild.id,
                    userID: message.author.id,
                    balance: 0,
                    lastDailyTimestamp: message.createdTimestamp - dailyCooldown,
                    lastDailyXP: 0
                }
            }

            pool.query(`SELECT * FROM timezone WHERE guildID = '${message.guild.id}'`, function (err, timezoneResult) {
                if (err) throw err;

                let UTCOffset = 0
                if (timezoneResult.length != 0) UTCOffset = timezoneResult[0].utcOffset;
                
                if (
                    module.exports.timezoneTime(ecoRecord.lastDailyTimestamp, UTCOffset).getFullYear() == module.exports.timezoneTime(message.createdTimestamp, UTCOffset).getFullYear() &&
                    module.exports.timezoneTime(ecoRecord.lastDailyTimestamp, UTCOffset).getMonth() == module.exports.timezoneTime(message.createdTimestamp, UTCOffset).getMonth() &&
                    module.exports.timezoneTime(ecoRecord.lastDailyTimestamp, UTCOffset).getDate() == module.exports.timezoneTime(message.createdTimestamp, UTCOffset).getDate()
                ) {
                    const utcString = `${module.exports.timezoneTime(message.createdTimestamp+86400000,UTCOffset).toISOString().replace(/\T.+/, '')} UTC${UTCOffset<0 ? '-' : '+'}${Math.floor(Math.abs(UTCOffset))}:${Math.abs(UTCOffset)*60%60 < 10 ? '0' + Math.abs(UTCOffset)*60%60 : Math.abs(UTCOffset)*60%60}`
                    const dailyCooldownMessage = new Discord.MessageEmbed()
                            .setColor(embedSettings.color)
                            .setAuthor('Daily cooldown', `https://images.emojiterra.com/google/android-pie/512px/1f6d1.png`, '')
                            .setDescription(`You cannot collect your daily reward yet!\nCome back on **${utcString}**!`)
                            .setFooter(embedSettings.footer, embedSettings.footer_url);
                    return message.channel.send(dailyCooldownMessage);
                }

                pool.query(`SELECT * FROM experience WHERE userID = '${message.author.id}' AND guildID = '${message.guild.id}'`, function (err, xpResult) {
                    if (err) throw err;

                    // Leveling rewards
                    var levelingRewards = []
                    var levelBefore = module.exports.calculateLevel(ecoRecord.lastDailyXP).level;
                    var levelAfter = module.exports.calculateLevel(xpResult[0].xp).level
                    var i;
                    if (levelAfter > levelBefore) {
                        for (i=levelBefore+1;i<=levelAfter;i++) {
                            levelingRewards.push({level:i, reward: module.exports.calculateLevelRewards(i)});
                        }
                    }

                    // Streak reward
                    var streak = false;
                    /*if (message.createdTimestamp - ecoRecord.lastDailyTimestamp < 172800000 && ecoRecord.lastDailyTimestamp != message.createdTimestamp - dailyCooldown) {
                        streak = true;
                    }*/
                    var yesterday = new Date(module.exports.timezoneTime(message.createdTimestamp, UTCOffset));
                    yesterday.setDate(module.exports.timezoneTime(message.createdTimestamp, UTCOffset).getDate()-1);
                    if (
                        module.exports.timezoneTime(ecoRecord.lastDailyTimestamp, UTCOffset).getFullYear() == yesterday.getFullYear() &&
                        module.exports.timezoneTime(ecoRecord.lastDailyTimestamp, UTCOffset).getMonth() == yesterday.getMonth() &&
                        module.exports.timezoneTime(ecoRecord.lastDailyTimestamp, UTCOffset).getDate() == yesterday.getDate() &&
                        ecoRecord.lastDailyTimestamp != message.createdTimestamp - dailyCooldown
                    ) {
                        streak = true;
                    }

                    // Calculating rewards
                    var newBal = ecoRecord.balance + dailyReward;
                    for (let i = 0; i < levelingRewards.length; i++) {
                        newBal += levelingRewards[i].reward;
                    }
                    if (streak) {
                        newBal += streakReward;
                    }

                    var updateBal = `UPDATE economy SET balance = ${newBal} WHERE guildID = ${ecoRecord.guildID} AND userID = ${ecoRecord.userID}`; //WHERE id = ${ecoRecord.id}
                    pool.query(updateBal, function (err) {if (err) throw err;});
                    
                    // Rewards message
                    var rewardsMessageDescription = '';
                    rewardsMessageDescription = rewardsMessageDescription.concat(`+$${dailyReward} (Daily reward)\n`);
                    for (let i = 0; i < levelingRewards.length; i++) {
                        rewardsMessageDescription = rewardsMessageDescription.concat(`+$${levelingRewards[i].reward} (LEVEL ${levelingRewards[i].level} ↑)\n`);
                    }
                    if (streak) {
                        rewardsMessageDescription = rewardsMessageDescription.concat(`+$${streakReward} (Streak)\n`);
                    }

                    const rewardsMessage = new Discord.MessageEmbed()
                        .setColor(embedSettings.color)
                        .setAuthor('Daily Rewards', `https://images.emojiterra.com/mozilla/512px/1f4b0.png`, '')
                        .setTitle(message.author.tag)
                        .setThumbnail(message.author.avatarURL())
                        .setDescription(rewardsMessageDescription)
                        .addFields(
                            { name: `${message.author.username}'s Balance`, value: `$${newBal}`, inline: true },
                        )
                        .setFooter(embedSettings.footer, embedSettings.footer_url);
                    message.channel.send(rewardsMessage);
                    
                    if (!(
                        module.exports.timezoneTime(ecoRecord.lastDailyTimestamp, UTCOffset).getFullYear() == module.exports.timezoneTime(message.createdTimestamp, UTCOffset).getFullYear() &&
                        module.exports.timezoneTime(ecoRecord.lastDailyTimestamp, UTCOffset).getMonth() == module.exports.timezoneTime(message.createdTimestamp, UTCOffset).getMonth() &&
                        module.exports.timezoneTime(ecoRecord.lastDailyTimestamp, UTCOffset).getDate() == module.exports.timezoneTime(message.createdTimestamp, UTCOffset).getDate()
                    )) {
                        var updateLastDailyTimestamp = `UPDATE economy SET lastDailyTimestamp = ${message.createdTimestamp} WHERE guildID = ${ecoRecord.guildID} AND userID = ${ecoRecord.userID}`;
                        pool.query(updateLastDailyTimestamp, function (err) {if (err) throw err;});

                        var updateLastDailyXP = `UPDATE economy SET lastDailyXP = ${xpResult[0].xp} WHERE guildID = ${ecoRecord.guildID} AND userID = ${ecoRecord.userID}`;
                        pool.query(updateLastDailyXP, function (err) {if (err) throw err;});
                    }
                });
            });
        });
    }

    static msToTime(s) {
        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;
      
        return hrs + ':' + mins + ':' + secs + '.' + ms;
    }

    static calculateLevel(xp) {
        var level = 0;

        while (true) {
            if (xp >= Math.floor(1.5**(8+level))) {
                level++;
            } else {
                break;
            }
        }

        /*while (true) {
            if (xp >= 2**(6+level)) {
                level++;
            } else {
                break;
            }
        }*/

        var xpProgress = xp - Math.floor(1.5**(8+level-1));
        var xpProgressTotal = Math.floor(1.5**(8+level)) - Math.floor(1.5**(8+(level-1)));
        if (level == 0) {
            xpProgress = xp;
            xpProgressTotal = Math.floor(1.5**(8+level));
        }

        return {
            "level": level,
            "progress": xpProgress,
            "progressTotal": xpProgressTotal
        };
    }

    static calculateLevelRewards(level) {
        var reward = 1.25**(8+level);
        reward = Math.ceil(reward / 10) * 10; // rounding
        return reward;
    }

    static timezoneTime(time, offset) {
        let utc = time + new Date().getTimezoneOffset();

        let newDate = new Date(utc + 3600000*offset);

        return newDate;
    }
}

