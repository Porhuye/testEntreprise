
// routes/user.js - RESTful avec :userId pour PUT et DELETE
const express = require("express");
const router = express.Router();
const {
  addUser,
  getUser,
  getUsers,
  putUser,
  deleteUser,
} = require("../services/UserService.js");
const authWSO2 = require("../middlewares/authWSO2");

// Appliquer le middleware WSO2 à toutes les routes utilisateur
router.use(authWSO2);

// GET /user - lister tous les utilisateurs
router.get("/", getUsers);

// GET /user/:userId - récupérer un utilisateur par ID
router.get("/:userId", getUser);

// POST /user - ajouter un nouvel utilisateur
router.post("/", addUser);

// PUT /user/:userId - modifier un utilisateur
router.put("/:userId", putUser);

// DELETE /user/:userId - supprimer un utilisateur
router.delete("/:userId", deleteUser);

module.exports = router;
