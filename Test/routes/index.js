const express = require("express");
const router = express.Router();
const { testDBConnection } = require("../controllers/userController");

router.get("/test-db", testDBConnection);

module.exports = router;
