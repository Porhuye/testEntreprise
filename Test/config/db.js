const mysql = require("mysql2");
//const { Sequelize } = require('sequelize');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10
});
/*
const sequelize = new Sequelize('test_entreprise', 'root', null, { //database , username , password
    dialect: 'mysql'
  })

// Option 3: Passing parameters separately (other dialects)
const sequelize = new Sequelize('test_entreprise', 'root', null, {
  host: 'localhost',
  dialect: 'mysql' 
});
*/
module.exports = pool.promise();
