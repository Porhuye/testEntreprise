require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Import des routes et middlewares
const routes = require("./routes/index");
const errorHandler = require("./middlewares/errorHandler");

// Import des contrôleurs utilisateur
const { addUser, getUser, getUsers, putUser, deleteUser } = require("./services/UserService.js");

/*
//////////////
NodeJS :
Connecter DB à NodeJS avec bonne pratique (à chercher)
+ faire une com entre API et NodeJS (get, post, put, delete — CRUD)
//////////////
*/

// Middleware pour parser le JSON
app.use(express.json());

// Utilisation des routes générales (optionnel si tu as des routes globales dans routes/index.js)
app.use("/", routes);

// Routes utilisateurs
app.get("/users", getUsers);              // GET tous les utilisateurs
app.get("/user/:userId", getUser);        // GET un utilisateur précis
app.post("/user", addUser);               // POST pour ajouter un utilisateur
app.put("/user", putUser);                // PUT pour modifier un utilisateur
app.delete("/user", deleteUser);          // DELETE pour supprimer un utilisateur

// Middleware de gestion des erreurs
app.use(errorHandler);

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
