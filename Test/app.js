require("dotenv").config();
const express = require("express");
const app = express();

// Middlewares globaux
app.use(express.json());

// Routes principales
const routes = require("./routes");
app.use("/", routes);

// Middleware de gestion d'erreur
const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

module.exports = app;
