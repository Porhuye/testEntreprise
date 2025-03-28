const pool = require("../config/db");
const Utilisateur = require("../models/Utilisateur");

///CONNECTION BD///
async function testDBConnection(req, res) {
    try {
        const [rows] = await pool.query("SELECT 1 + 1 AS solution");
        res.json({ message: "Connexion réussie", solution: rows[0].solution });
    } catch (error) {
        console.error("Erreur MySQL :", error);
        res.status(500).json({ message: "Erreur de connexion à la base de données" });
    }
}

module.exports = { testDBConnection};
