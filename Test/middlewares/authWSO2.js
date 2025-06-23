// middlewares/authWSO2.js
const axios = require("axios");
const https = require("https");
const qs = require("querystring");
const Utilisateur = require("../models/Utilisateur");

async function authWSO2(req, res, next) {
  let token;

  // 1) Essayer de récupérer un token Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log("→ Token extrait depuis Authorization header");
  }
  // 2) Sinon depuis le cookie
  else if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
    console.log("→ Token extrait depuis cookie");
  }

  // 3) Si pas de token, on fait un Password Grant
  if (!token) {
    console.log("→ Aucun Bearer token, on tente un Password Grant…");

    // On doit recevoir en Basic Auth les credentials du client OAuth2
    const basic = req.headers.authorization;
    if (!basic || !basic.startsWith("Basic ")) {
      return res
        .status(401)
        .json({ message: "Pas de token ni de Basic Auth pour en obtenir un." });
    }
    const [clientId, clientSecret] = Buffer.from(
      basic.split(" ")[1],
      "base64"
    )
      .toString()
      .split(":");

    // On prend username/password/scope dans le body (comme dans Postman)
    const { username, password, scope = "openid" } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Manque username/password pour Password Grant." });
    }

    // Préparer la requête vers /token
    const payloadToken = qs.stringify({
      grant_type: "password",
      username,
      password,
      scope,
    });

    try {
      const respToken = await axios.post(
        process.env.WSO2_TOKEN_URL, // ex: https://localhost:9443/oauth2/token
        payloadToken,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(
              `${clientId}:${clientSecret}`
            ).toString("base64")}`,
          },
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        }
      );

      token = respToken.data.access_token;
      console.log("→ Nouvel access_token obtenu");
      // Facultatif : on stocke en cookie pour la prochaine requête
      res.cookie("access_token", token, { httpOnly: true, secure: true });
    } catch (err) {
      console.error("→ Erreur Password Grant :", err.response?.data || err);
      return res
        .status(401)
        .json({ message: "Impossible d’obtenir le token WSO2." });
    }
  }

  // 4) Introspection du token
  try {
    const payload = qs.stringify({
      token,
      token_type_hint: "access_token",
    });

    const basicAuth = Buffer.from(
      `${process.env.WSO2_ADMIN_ID}:${process.env.WSO2_ADMIN_SECRET}`
    ).toString("base64");

    console.log("→ Introspect URL    :", process.env.WSO2_INTROSPECT_URL);
    console.log("→ Basic Auth (masked):", basicAuth.replace(/./g, "*"));

    const respIntro = await axios.post(
      process.env.WSO2_INTROSPECT_URL, // ex: https://localhost:9443/oauth2/introspect
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basicAuth}`,
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      }
    );

    if (!respIntro.data.active) {
      return res.status(401).json({ message: "Token invalide" });
    }

    // 5) Charger ou créer l’utilisateur local
    const usernameResp = respIntro.data.username || respIntro.data.sub;
    let user = await Utilisateur.findOne({ where: { nom: usernameResp } });
    if (!user) {
      user = await Utilisateur.create({
        nom: usernameResp,
        prenom: "",
        dateNaissance: new Date(),
        motDePasse: "",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.response) {
      console.error(
        "→ WSO2 Introspect status:",
        err.response.status,
        err.response.data
      );
    } else {
      console.error("→ Erreur Introspect WSO2 :", err.message);
    }
    return res.status(500).json({ message: "Erreur serveur WSO2" });
  }
}

module.exports = authWSO2;
