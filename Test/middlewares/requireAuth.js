// middlewares/requireAuth.js
// ce que tu as besoin de mettre dans le formulaire de chaque vue EJS protégée
const { withLogto } = require('@logto/express');
const logtoConfig = require('../config/logto');

module.exports = [
  withLogto(logtoConfig),
  (req, res, next) => {
    if (!req.user?.isAuthenticated) return res.redirect('/logto/sign-in');

    const c = req.user.claims || {};
    // Mappe vers les noms que tes vues utilisent
    const prenom = c.given_name || '';
    const nom = c.family_name || c.name || c.preferred_username || c.email || c.sub || 'Utilisateur';

    req.viewUser = {
      prenom,
      nom,
      email: c.email,
      sub: c.sub,
      raw: c, // pratique pour déboguer
    };

    next();
  },
];
