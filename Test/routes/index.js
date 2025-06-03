const express = require("express");
const router = express.Router();
const { testDBConnection } = require("../controllers/userController");

// Route de test DB
router.get("/test-db", testDBConnection);

// Authentification (login/logout)
router.use("/auth", require("./auth"));

// Dashboard (protéger avec authWSO2)
router.get("/dashboard", authWSO2, async (req, res) => {
  try {
    // Récupérer tous les utilisateurs (ou autre logique)
    const users = await Utilisateur.findAll();
    // Passer l’utilisateur courant (req.user) + liste pour affichage
    res.render("dashboard", { user: req.user, users });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur interne");
  }
});

// Route utilisateur (GET/POST/PUT/DELETE)
router.use("/user", require("./user"));

module.exports = router;
