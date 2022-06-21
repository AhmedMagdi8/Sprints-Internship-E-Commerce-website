const Sequelize = require("sequelize");
const path = require('path');
const fs  = require('fs')


const sequelize = new Sequelize(process.env.DBNAME, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
    dialect:'postgres', 
    host: '127.0.0.1'
});

module.exports = sequelize;