/*
const mysql = require("mysql2");
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10
});
module.exports = pool.promise();
*/

const { Sequelize } = require("sequelize");
require("dotenv").config(); // Charge les variables d'environnement

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || "localhost",
        dialect: "mysql",
        logging: false,
    }
);

async function testDBConnection() {
    try {
        await sequelize.authenticate();
        console.log("Connexion à la base de données réussie !");
    } catch (error) {
        console.error("Erreur de connexion à la base de données :", error);
    }
}

testDBConnection();

module.exports = sequelize;

