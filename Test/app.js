require("dotenv").config();
const express = require("express");
const app = express();

// Middlewares globaux
app.use(express.json());

// config view engine (EJS)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//cookies
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Routes principales
const routes = require("./routes");
app.use("/", routes);

// Middleware de gestion d'erreur
const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

module.exports = app;
