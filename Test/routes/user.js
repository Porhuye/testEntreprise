const express = require("express");
const router = express.Router();
const {
  addUser,
  getUser,
  getUsers,
  putUser,
  deleteUser,
} = require("../services/UserService.js");

const authWSO2 = require("../middlewares/authWSO2"); // <-- ajout du middleware

// Middleware WSO2 appliqué à toutes les routes
router.use(authWSO2);

// GET tous les utilisateurs
router.get("/", getUsers);

// GET un utilisateur par ID
router.get("/:userId", getUser);

// POST : ajouter un utilisateur
router.post("/", addUser);

// PUT : modifier un utilisateur
router.put("/", putUser);

// DELETE : supprimer un utilisateur
router.delete("/", deleteUser);

module.exports = router;
