// middlewares/authWSO2.js
const jwt = require("jsonwebtoken");
const axios = require("axios");
const https = require("https");
const Utilisateur = require("../models/Utilisateur");
const qs = require("querystring");

async function authWSO2(req, res, next) {
  // Lecture du token depuis header ou cookie
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res.status(401).json({ message: "Token manquant ou invalide" });
  }

  try {
    // 1) Construire le corps x-www-form-urlencoded pour l'introspection
    const payload = qs.stringify({
      token,
      token_type_hint: "access_token"
    });

    // 2) Faire la requête POST vers l'endpoint WSO2 INTROSPECT
    const response = await axios.post(
      process.env.WSO2_INTROSPECT_URL,  // ex. "https://localhost:9443/oauth2/introspect"
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.WSO2_CLIENT_ID}:${process.env.WSO2_CLIENT_SECRET}`
          ).toString("base64")}`
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      }
    );

    // 3) Extraire les données d'introspection
    const data = response.data;
    if (!data.active) {
      return res.status(401).json({ message: "Token invalide" });
    }

    // 4) Récupérer (ou créer) l'utilisateur local
    const { username } = data;
    let user = await Utilisateur.findOne({ where: { nom: username } });
    if (!user) {
      user = await Utilisateur.create({
        nom: username,
        prenom: "",
        dateNaissance: new Date(),
        motDePasse: ""
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Erreur WSO2 :", error.response?.data || error.message);
    return res.status(500).json({ message: "Erreur serveur WSO2" });
  }
}

module.exports = authWSO2;
