const express = require("express");
const router = express.Router();
const { testDBConnection } = require("../controllers/userController");

// Route de test DB
router.get("/test-db", testDBConnection);

// Route utilisateur (GET/POST/PUT/DELETE)
router.use("/user", require("./user"));

module.exports = router;
