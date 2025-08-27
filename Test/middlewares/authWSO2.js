// middlewares/authWSO2.js
const { introspectToken } = require("../services/wso2Introspect");
const Utilisateur         = require("../models/Utilisateur");

async function authWSO2(req, res, next) {
  // 1) Récupérer le token (Bearer header ou cookie)
  let token;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res.status(401).json({ message: "Token manquant ou invalide" });
  }

  try {
    // 2) Introspect
    const data = await introspectToken(token);

    if (!data.active) {
      return res.status(401).json({ message: "Token inactif ou invalide" });
    }

    // 3) Récupérer/créer l’utilisateur local
    const username = data.username || data.sub;
    let user = await Utilisateur.findOne({ where: { nom: username } });
    if (!user) {
      user = await Utilisateur.create({
        nom: username,
        prenom: "",
        dateNaissance: new Date(),
        motDePasse: ""
      });
    }

    // 4) On passe l’utilisateur à la suite
    req.user = user;
    next();

  } catch (err) {
    console.error("Erreur introspection :", err.response?.data || err.message);
    return res.status(500).json({ message: "Erreur serveur d’introspection" });
  }
}

module.exports = authWSO2;
