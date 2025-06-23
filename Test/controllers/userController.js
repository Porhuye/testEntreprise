// controllers/userController.js
const sequelize = require("../config/db");

async function testDBConnection(req, res) {
  try {
    // Utilisation de Sequelize pour tester la connexion
    const [results] = await sequelize.query("SELECT 1 + 1 AS solution");
    res.json({ message: "Connexion réussie", solution: results[0].solution });
  } catch (error) {
    console.error("Erreur DB Sequelize :", error);
    res.status(500).json({ message: "Erreur de connexion à la base de données" });
  }
}

module.exports = { testDBConnection };