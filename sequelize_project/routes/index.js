const express = require("express");
const router = express.Router();
const { testDBConnection, addUser } = require("../controllers/userController");

router.get("/test-db", testDBConnection);
router.post("/add-user", addUser);

module.exports = router;
