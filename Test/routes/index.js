// routes/index.js
const express = require('express');
const router = express.Router();

const { withLogto } = require('@logto/express');
const logtoConfig = require('../config/logto'); // { endpoint, appId, appSecret, baseUrl }
const requireAuth = require('../middlewares/requireAuth');
const userRoutes = require('./user');
const { testDBConnection } = require('../controllers/userController');

// Accueil : si connecté -> dashboard, sinon -> page de login.ejs
router.get('/', withLogto(logtoConfig), (req, res) => {
  if (req.user?.isAuthenticated) return res.redirect('/dashboard');
  return res.render('login'); // vue EJS avec bouton /logto/sign-in
});

// Dashboard protégé
router.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard', { user: req.viewUser });
});

// API Users protégée
router.use('/user', requireAuth, userRoutes);

// routes/index.js
router.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard', { user: req.viewUser });
});


// Test DB
router.get('/test-db', testDBConnection);

// Déconnexion conviviale (redirige vers Logto)
router.get('/logout', (_req, res) => res.redirect('/logto/sign-out'));

module.exports = router;
