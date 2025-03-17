const pool = require("../config/db");

async function testDBConnection(req, res) {
    try {
        const [rows] = await pool.query("SELECT 1 + 1 AS solution");
        res.json({ message: "Connexion réussie", solution: rows[0].solution });
    } catch (error) {
        console.error("Erreur MySQL :", error);
        res.status(500).json({ message: "Erreur de connexion à la base de données" });
    }
}

async function addUser(req, res) {
    try {
        const { nom, prenom, date_naissance } = req.body;

        if (!nom || !prenom || !date_naissance) {
            return res.status(400).json({ message: "Tous les champs sont requis !" });
        }

        const query = "INSERT INTO user (nom, prenom, date_naissance) VALUES (?, ?, ?)";
        await pool.query(query, [nom, prenom, date_naissance]);

        res.status(201).json({ message: "Utilisateur ajouté avec succès !" });
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'utilisateur :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}

module.exports = { testDBConnection, addUser };
