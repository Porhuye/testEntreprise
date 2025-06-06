// routes/auth.js
const express = require("express");
const axios = require("axios");
const https = require("https");
const qs = require("querystring");              // Pour formater les données en application/x-www-form-urlencoded
const router = express.Router();

// Chargement des variables d’environnement (WSO2_CLIENT_ID, WSO2_CLIENT_SECRET, WSO2_TOKEN_URL)
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
  // Vérifier que le body contient bien username et password
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).render("login", { errorMessage: "Veuillez renseigner tous les champs." });
  }

  try {
    // 1) Préparation du payload en x-www-form-urlencoded
    const payload = qs.stringify({
      grant_type: "password",
      username,
      password,
      scope: "openid" // ou autre scope selon votre configuration WSO2
    });

    // 2) Construction de l’en-tête Basic Auth pour WSO2 (client_id:client_secret)
    const basicAuth = Buffer
      .from(`${WSO2_CLIENT_ID}:${WSO2_CLIENT_SECRET}`)
      .toString("base64");

    // 3) Requête POST vers l’endpoint /oauth2/token de WSO2
    const response = await axios.post(
      WSO2_TOKEN_URL,  // ex. "https://localhost:9443/oauth2/token"
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${basicAuth}`
        },
        // Désactiver la vérification SSL pour accepter le certificat auto-signé (en dev)
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      }
    );

    // 4) Si WSO2 renvoie un token (access_token, expires_in, etc.), on le récupère
    const { access_token, expires_in } = response.data;

    // 5) Stocker le token dans un cookie HttpOnly (et non-secure en dev, pour que le cookie soit bien repris en HTTP)
    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: false,            // ← secure: false en développement (HTTP); en production, mettre true si HTTPS
      maxAge: expires_in * 1000 // convertir en millisecondes
    });

    // 6) (Optionnel) vous pouvez stocker aussi le refresh_token si vous voulez le réutiliser
    //    const { refresh_token } = response.data;
    //    res.cookie("refresh_token", refresh_token, { httpOnly: true, secure: false, maxAge: <durée> });

    // Rediriger vers la page protégée /dashboard
    return res.redirect("/dashboard");
  } catch (err) {
    console.error(
      "Erreur lors de la requête de token WSO2 :",
      err.response?.data || err.message
    );
    // En cas d’erreur (identifiants invalides, client_id incorrect, etc.), on réaffiche le formulaire avec un message
    return res.status(401).render("login", { errorMessage: "Identifiants invalides" });
  }
});

// GET /auth/logout => supprimer le cookie puis rediriger vers /auth/login
router.get("/logout", (req, res) => {
  // Effacer le cookie "access_token"
  res.clearCookie("access_token");
  // (Optionnel) effacer aussi refresh_token si vous l’avez stocké
  // res.clearCookie("refresh_token");

  return res.redirect("/auth/login");
});

module.exports = router;
