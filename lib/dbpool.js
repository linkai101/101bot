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

module.exports = pool;
