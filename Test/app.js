// /app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { handleAuthRoutes } = require('@logto/express');

// Sécurité & perfs
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const logtoConfig = require('./config/logto');

const app = express();

/* ---------- Sécurité HTTP (Helmet) ---------- */
app.use(helmet({
  // Ajuste si tu as du contenu inline (idéalement évite le inline script)
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

/* ---------- Compression ---------- */
app.use(compression());

/* ---------- CORS (uniquement pour /api) ---------- */
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
app.use('/api', cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
      return cb(null, true);
    }
    cb(new Error('CORS not allowed'));
  },
  credentials: false,
}));

/* ---------- Parsers ---------- */
app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

/* ---------- Rate limit (API uniquement) ---------- */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120, // 120 req/min par IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

/* ---------- SESSION AVANT Logto ---------- */
app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 14 * 24 * 60 * 60 * 1000,
  },
  // ⚠️ En prod, utilise un store persistant (Redis/Mongo). MemoryStore n’est pas fait pour la prod.
}));

/* ---------- Routes d’auth Logto ---------- */
app.use(handleAuthRoutes(logtoConfig));

/* ---------- Vues ---------- */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* ---------- Static ---------- */
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));

/* ---------- Routes applicatives ---------- */
app.use('/', require('./routes'));

/* ---------- Gestion d’erreurs ---------- */
app.use(require('./middlewares/errorHandler'));

module.exports = app;
