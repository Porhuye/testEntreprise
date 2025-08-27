// app.js
require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");


// --- Parser les formulaires HTML (x-www-form-urlencoded) ---
app.use(express.urlencoded({ extended: true }));

// Middlewares globaux
app.use(express.json());

// config view engine (EJS)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// cookies
app.use(cookieParser());

// Routes principales
const routes = require("./routes");
app.use("/", routes);

// Middleware de gestion d'erreur
const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);


app.use(
  "/bootstrap",
  express.static(path.join(__dirname, "node_modules", "bootstrap", "dist"))
);

module.exports = app;
