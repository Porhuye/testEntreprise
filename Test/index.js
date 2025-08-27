// /index.js
const app = require('./app');

const port = Number(process.env.PORT || 3000);

const server = app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION', err);
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION', err);
  // Option: process.exit(1);
});

module.exports = server;
