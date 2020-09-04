var mysql = require('mysql');
const path = require('path');
const config = require(path.join(__dirname, '..', 'config', 'config.json'));

var pool = mysql.createPool({
    host: config.mySQL.host,
    port: config.mySQL.port,
    database: config.mySQL.database,
    user: config.mySQL.user,
    password: config.mySQL.password
})

var addTableModules = "CREATE TABLE modules (id INT AUTO_INCREMENT PRIMARY KEY, guildID VARCHAR(255), modules LONGTEXT)";
pool.query(addTableModules, function (err, result) {
    //if (err) console.log("MYSQL> 'modules' table already exists or something went wrong");
    if (!err) console.log("MYSQL> Created table 'modules'");
});

var addTablePrefixes = "CREATE TABLE prefixes (id INT AUTO_INCREMENT PRIMARY KEY, guildID VARCHAR(255), prefix VARCHAR(255))";
pool.query(addTablePrefixes, function (err, result) {
    //if (err) console.log("MYSQL> 'prefixes' table already exists or something went wrong");
    if (!err) console.log("MYSQL> Created table 'prefixes'");
});

var addTableExperience = "CREATE TABLE experience (id INT AUTO_INCREMENT PRIMARY KEY, guildID VARCHAR(255), userID VARCHAR(255), xp INT(9), messages INT(9), lastMsgTimestamp BIGINT(15))";
pool.query(addTableExperience, function (err, result) {
    //if (err) console.log("MYSQL> 'experience' table already exists or something went wrong");
    if (!err) console.log("MYSQL> Created table 'experience'");
});

var addTableEconomy = "CREATE TABLE economy (id INT AUTO_INCREMENT PRIMARY KEY, guildID VARCHAR(255), userID VARCHAR(255), balance INT(9), lastDailyTimestamp BIGINT(15), lastDailyXP INT(9))";
pool.query(addTableEconomy, function (err, result) {
    //if (err) console.log("MYSQL> 'economy' table already exists or something went wrong");
    if (!err) console.log("MYSQL> Created table 'economy'");
});

var addTableTimezone = "CREATE TABLE timezone (id INT AUTO_INCREMENT PRIMARY KEY, guildID VARCHAR(255), utcOffset TINYINT(3))";
pool.query(addTableTimezone, function (err, result) {
    //if (err) console.log("MYSQL> 'timezone' table already exists or something went wrong");
    if (!err) console.log("MYSQL> Created table 'timezone'");
});

module.exports = pool;
