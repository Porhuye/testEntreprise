// routes/auth.js
const express = require("express");
const axios = require("axios");
const qs = require("querystring"); // Pour formater les données en application/x-www-form-urlencoded
const router = express.Router();

// Chargement des variables d’env (WSO2_CLIENT_ID, WSO2_CLIENT_SECRET, WSO2_TOKEN_URL)
const {
  WSO2_CLIENT_ID,
  WSO2_CLIENT_SECRET,
  WSO2_TOKEN_URL
} = process.env;

// GET /auth/login => affiche le formulaire de connexion
router.get("/login", (req, res) => {
  res.render("login");
});

// POST /auth/login => envoie les identifiants à WSO2 pour ROPC (grant_type=password)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    // Note : on suppose que WSO2AM expose le endpoint /token
    // Format de la requête : grant_type=password&username=...&password=...
    const payload = qs.stringify({
      grant_type: "password",
      username,
      password,
      scope: "openid" // ou autre scope selon votre config
    });

    const basicAuth = Buffer.from(`${WSO2_CLIENT_ID}:${WSO2_CLIENT_SECRET}`).toString("base64");

    const response = await axios.post(WSO2_TOKEN_URL, payload, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${basicAuth}`
      },
      // Si votre WSO2AM a un certificat auto-signé :
      // httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });

    // Si on arrive ici, WSO2 a renvoyé { access_token, expires_in, token_type, refresh_token, etc. }
    const { access_token, token_type, expires_in, refresh_token } = response.data;

    // Stocker le token côté client : 
    //   1) Soit on le met dans un cookie httpOnly (recommandé pour éviter le XSS)
    //   2) Soit on le renvoie dans la réponse pour que le front le garde en localStorage
    // Ici, on choisit un cookie httpOnly :
    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: false, // en prod, mettre true si HTTPS
      maxAge: expires_in * 1000
    });
    // (Optionnel) on peut stocker le refresh_token également

    // Rediriger vers une page “profil” ou “tableau de bord”
    return res.redirect("/dashboard");
  } catch (err) {
    console.error("Erreur lors de la requête de token WSO2 :", err.response?.data || err.message);
    // En cas d’erreur (identifiants invalides, etc.), renvoyer index avec message d’erreur
    return res.status(401).render("login", { errorMessage: "Identifiants invalides" });
  }
});

// GET /auth/logout => supprimer le cookie puis rediriger vers login
router.get("/logout", (req, res) => {
  res.clearCookie("access_token");
  res.redirect("/auth/login");
});

module.exports = router;
