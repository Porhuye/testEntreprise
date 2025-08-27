// /routes/index.js
const express = require('express');
const router = express.Router();

const { withLogto } = require('@logto/express');
const logtoConfig = require('../config/logto');
const authLogto = require('../middlewares/authLogto'); // { session, api }
const { testDBConnection } = require('../controllers/userController');
const { callDownstream } = require('../controllers/downstreamController');

// Accueil : si connecté -> dashboard, sinon -> login
router.get('/', withLogto(logtoConfig), (req, res) => {
  if (req.user?.isAuthenticated) return res.redirect('/dashboard');
  return res.render('login');
});

// Dashboard (profil)
router.get('/dashboard', authLogto.session, (req, res) => {
  res.render('dashboard', { user: req.viewUser });
});

// Appel sortant protégé (serveur -> service en aval)
router.get('/call-downstream', authLogto.session, callDownstream);

// API protégée par Bearer (exemples)
router.get('/api/products', authLogto.api('read:products'), (req, res) => {
  res.json({
    by: 'GET /api/products',
    sub: req.auth.sub,
    scopes: (req.auth.scope || '').split(' '),
    items: [{ id: 1, name: 'Produit A' }, { id: 2, name: 'Produit B' }],
  });
});

router.post('/api/products', authLogto.api('write:products'), (req, res) => {
  res.status(201).json({
    by: 'POST /api/products',
    sub: req.auth.sub,
    created: req.body || {},
  });
});

// Test DB
router.get('/test-db', testDBConnection);

// Debug token (DEV seulement)
if (process.env.NODE_ENV !== 'production') {
  const jwt = require('jsonwebtoken');
  router.get('/debug/tokens', authLogto.session, async (req, res) => {
    try {
      const resource = process.env.API_RESOURCE || 'https://getToken';
      const token = await req.getAccessToken(resource);
      res.json({
        idTokenClaims: req.user?.claims || {},
        accessTokenPreview: token ? token.slice(0, 24) + '…' : null,
        accessTokenDecoded: token ? jwt.decode(token, { complete: true }) : null,
      });
    } catch (e) {
      res.status(500).json({ error: 'no_access_token' });
    }
  });
}

// Déconnexion
router.get('/logout', (_req, res) => res.redirect('/logto/sign-out'));

module.exports = router;
