// index.js
require('dotenv').config();
const app = require('./app');

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
