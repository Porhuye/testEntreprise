// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { handleAuthRoutes } = require('@logto/express');

const app = express();

/* ---------- Config Logto depuis .env (fail-fast) ---------- */
const need = (key) => {
  const v = (process.env[key] || '').trim();
  if (!v || v === '...') {
    console.error(`[CONFIG] ${key} manquant ou invalide dans .env`);
    process.exit(1);
  }
  return v;
};

let endpoint = need('LOGTO_ENDPOINT'); // ex: https://wtl9wf.logto.app (sans /oidc, sans slash final)
if (endpoint.endsWith('/')) endpoint = endpoint.slice(0, -1);

const logtoConfig = {
  endpoint,
  appId: need('LOGTO_CLIENT_ID'),
  appSecret: need('LOGTO_CLIENT_SECRET'),
  baseUrl: process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
};

/* (Optionnel) Pré-check OIDC pour éviter “Not found … not valid JSON” plus tard */
(async () => {
  try {
    const wellKnown = `${logtoConfig.endpoint}/oidc/.well-known/openid-configuration`;
    const r = await fetch(wellKnown);
    if (!r.ok) {
      const t = await r.text();
      console.error(`[LOGTO] OIDC discovery failed (${r.status}).\n${wellKnown}\nResponse: ${t}`);
      process.exit(1);
    }
    await r.json();
    console.log('[LOGTO] OIDC discovery OK');
  } catch (e) {
    console.error('[LOGTO] OIDC discovery error:', e);
    process.exit(1);
  }
})();

/* ---------- Express base ---------- */
app.set('trust proxy', 1); // utile en prod derrière un proxy/HTTPS
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

/* ---------- SESSION AVANT Logto (sinon: session_not_configured) ---------- */
app.use(
  session({
    name: 'sid',
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 jours en ms
    },
  })
);

/* ---------- Routes d’auth Logto (/logto/sign-in, callback, sign-out) ---------- */
app.use(handleAuthRoutes(logtoConfig));

/* ---------- Vues EJS ---------- */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* ---------- Static (Bootstrap local — optionnel si tu préfères le CDN) ---------- */
app.use(
  '/bootstrap',
  express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist'))
);

/* ---------- Routes applicatives ---------- */
const routes = require('./routes');
app.use('/', routes);

/* ---------- Gestion d’erreurs (si présente) ---------- */
try {
  const errorHandler = require('./middlewares/errorHandler');
  app.use(errorHandler);
} catch (_) {
  // pas de middleware d'erreur custom, c'est ok
}

module.exports = app;
