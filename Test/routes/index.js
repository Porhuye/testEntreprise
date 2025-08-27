// routes/index.js (CommonJS)
const express = require("express");
const path = require("path");

const authWSO2 = require("../middlewares/authWSO2");
const { testDBConnection } = require("../controllers/userController");
const authRoutes = require("./auth");
const userRoutes = require("./user");

const router = express.Router();

// Page d’accueil -> login
router.get("/", (req, res) => res.redirect("/auth/login"));

// Test DB
router.get("/test-db", testDBConnection);

// Auth
router.use("/auth", authRoutes);

// Dashboard protégé
router.get("/dashboard", authWSO2, (req, res) => {
  // req.user est posé par authWSO2
  res.render("dashboard", { user: req.user });
});

// API Users protégée
router.use("/user", authWSO2, userRoutes);

module.exports = router;
