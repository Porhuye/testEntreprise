require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const routes = require("./routes/index");
const errorHandler = require("./middlewares/errorHandler");

app.use(express.json()); 
app.use("/", routes);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${port}`);
});
