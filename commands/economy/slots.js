const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const path = require('path');
const pool = require('../../lib/dbpool');
const {embedSettings} = require(path.join(__dirname, '..', '..', 'config', 'config.json'));
const {slots} = require(path.join(__dirname, '..', '..', 'config', 'economy.json'));

module.exports = class BalanceCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'slots',
            group: 'economy',
            memberName: 'slots',
            aliases: ['slot'],
            description: 'Gambles an amount of money;',
            guildOnly: true,
            userPermissions: [],
            clientPermissions: [],
            //argsType: 'multiple',
            args: [
                {
					key: 'money',
                    prompt: 'How much money do you want to gamble?',
                    type: 'integer',
				}
            ],
			throttling: {
				usages: 2,
				duration: 10
			}
        })
    }

    async run (message, args) {
        pool.query(`SELECT * FROM economy WHERE userID = '${message.author.id}' AND guildID = '${message.guild.id}'`, function (err, result) {
            if (err) throw err;

            if (result.length == 0 || result[0].balance < args.money) {
                let userBalance = 0
                if (result[0]) userBalance = result[0].balance;
                const notEnoughMoneyMessage = new Discord.MessageEmbed()
                        .setColor(embedSettings.color)
                        .setAuthor('Not enough money', `https://images.emojiterra.com/google/android-nougat/512px/26a0.png`, '')
                        .setDescription(`You do not have enough money to do that!`)
                        .setFooter(`${message.author.username}'s bal: $${result[0].balance} | ${embedSettings.footer}`, embedSettings.footer_url);
                return message.channel.send(notEnoughMoneyMessage);
            }

            if (args.money < slots.minimumBet) {
                const notEnoughGambleMessage = new Discord.MessageEmbed()
                        .setColor(embedSettings.color)
                        .setAuthor('Bet is too low', `https://images.emojiterra.com/google/android-nougat/512px/26a0.png`, '')
                        .setDescription(`You have to gamble at least $${slots.minimumBet} in slots!`)
                        .setFooter(embedSettings.footer, embedSettings.footer_url);
                return message.channel.send(notEnoughGambleMessage);
            } else if (args.money > slots.maximumBet) {
                const notEnoughGambleMessage = new Discord.MessageEmbed()
                        .setColor(embedSettings.color)
                        .setAuthor('Bet is too high', `https://images.emojiterra.com/google/android-nougat/512px/26a0.png`, '')
                        .setDescription(`You can gamble at most $${slots.maximumBet} in slots!`)
                        .setFooter(embedSettings.footer, embedSettings.footer_url);
                return message.channel.send(notEnoughGambleMessage);
            }

            var reel1 = [];
            var reel2 = [];
            var reel3 = [];
            for (let i=0;i<slots.symbols.length;i++) {
                for (let j=1; j<=slots.symbols[i].reel1; j++) {
                    reel1.push(slots.symbols[i].symbol);
                }
                for (let j=1; j<=slots.symbols[i].reel2; j++) {
                    reel2.push(slots.symbols[i].symbol);
                }
                for (let j=1; j<=slots.symbols[i].reel3; j++) {
                    reel3.push(slots.symbols[i].symbol);
                }
            }

            var tempReel1 = reel1;
            var tempReel2 = reel2;
            var tempReel3 = reel3;

            const slotsResults = [
                reel1[Math.floor(Math.random() * reel1.length)], 
                reel2[Math.floor(Math.random() * reel2.length)], 
                reel3[Math.floor(Math.random() * reel3.length)]
            ]

            tempReel1.splice(tempReel1.indexOf(slotsResults[0]), 1);
            tempReel2.splice(tempReel2.indexOf(slotsResults[1]), 1);
            tempReel3.splice(tempReel3.indexOf(slotsResults[2]), 1);

            const slotsBefore = [
                tempReel1[Math.floor(Math.random() * reel1.length)], 
                tempReel2[Math.floor(Math.random() * reel2.length)], 
                tempReel3[Math.floor(Math.random() * reel3.length)]
            ]

            tempReel1.splice(tempReel1.indexOf(slotsBefore[0]), 1);
            tempReel2.splice(tempReel2.indexOf(slotsBefore[1]), 1);
            tempReel3.splice(tempReel3.indexOf(slotsBefore[2]), 1);

            const slotsAfter = [
                tempReel1[Math.floor(Math.random() * reel1.length)], 
                tempReel2[Math.floor(Math.random() * reel2.length)], 
                tempReel3[Math.floor(Math.random() * reel3.length)]
            ]

            var winningCredit = 0;
            //var wonReward = false;
            for (let i=0; i<slots.rewards.length; i++) {
                if (slotsResults[0] == slots.rewards[i].combination[0] || slots.rewards[i].combination[0] == '*') {
                    if (slotsResults[1] == slots.rewards[i].combination[1] || slots.rewards[i].combination[1] == '*') {
                        if (slotsResults[2] == slots.rewards[i].combination[2] || slots.rewards[i].combination[2] == '*') {
                            winningCredit = slots.rewards[i].credit;
                            //wonReward = true;
                            break;
                        }
                    }
                }
            }
            /*if (!wonReward) {
                for (let i=0; i<slots.bonuses.length; i++) { // bonuses
                    if (slotsResults[0] == slots.bonuses[i].combination[0] || slots.bonuses[i].combination[0] == '*') {
                        if (slotsResults[1] == slots.bonuses[i].combination[1] || slots.bonuses[i].combination[1] == '*') {
                            if (slotsResults[2] == slots.bonuses[i].combination[2] || slots.bonuses[i].combination[2] == '*') {
                                winningCredit += slots.bonuses[i].credit;
                            }
                        }
                    }
                }
            }*/
            var winnings = Math.floor(args.money*winningCredit/100);
            if (winnings > args.money) {
                winnings = winnings - Math.floor((winnings-args.money)*(module.exports.calculateTaxRate(winnings-args.money)));
            }

            var updateBalance = `UPDATE economy SET balance = ${result[0].balance-args.money+winnings} WHERE guildID = ${result[0].guildID} AND userID = ${result[0].userID}`;
                pool.query(updateBalance, function (err) {if (err) throw err;});

            var resultsMessageDescription = '';
            resultsMessageDescription = resultsMessageDescription.concat(`:${slotsBefore[0]}: | :${slotsBefore[1]}: | :${slotsBefore[2]}:\n`);
            resultsMessageDescription = resultsMessageDescription.concat(`:${slotsResults[0]}: | :${slotsResults[1]}: | :${slotsResults[2]}: ←\n`);
            resultsMessageDescription = resultsMessageDescription.concat(`:${slotsAfter[0]}: | :${slotsAfter[1]}: | :${slotsAfter[2]}:\n`);

            const slotsResultsMessage = new Discord.MessageEmbed()
                .setColor(embedSettings.color)
                .setAuthor(`Slots (${message.author.tag})`, 'https://www.emoji.co.uk/files/twitter-emojis/activity-twitter/10866-slot-machine.png', '')
                .setDescription(resultsMessageDescription)
                .addFields(
                    { name: `Spent`, value: `-$${args.money}`, inline: true },
                    { name: `Winnings`, value: `+$${winnings}`, inline: true },
                )
                .setFooter(`${message.author.username}'s bal: $${result[0].balance-args.money+winnings} | ${embedSettings.footer}`, embedSettings.footer_url);
            message.channel.send(slotsResultsMessage);
        });
    }

    static calculateTaxRate(earnings) { // Logistic function
        let taxRate = slots.tax.maxRate/(1 + 100*Math.E**((-slots.tax.rate/10)*earnings));
        return taxRate;
    }
}

