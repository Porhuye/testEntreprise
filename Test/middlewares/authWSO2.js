// middlewares/authWSO2.js
const jwt = require("jsonwebtoken");
const axios = require("axios");
const https = require("https");
const Utilisateur = require("../models/Utilisateur");

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
    // Introspect WSO2
    const response = await axios.get(process.env.WSO2_INTROSPECT_URL, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.WSO2_CLIENT_ID}:${process.env.WSO2_CLIENT_SECRET}`).toString("base64")}`
      },
      params: { token },
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });

    const data = response.data;
    if (!data.active) {
      return res.status(401).json({ message: "Token invalide" });
    }

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
    console.error("Erreur WSO2 :", error.message);
    return res.status(500).json({ message: "Erreur serveur WSO2" });
  }
}

module.exports = authWSO2;
