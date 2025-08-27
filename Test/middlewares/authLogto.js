// /middlewares/authLogto.js
require('dotenv').config();
const { withLogto } = require('@logto/express');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const logtoConfig = require('../config/logto');

/** -------- Session (protège les pages côté serveur) -------- */
const session = [
  withLogto(logtoConfig), // remplit req.user, expose req.getAccessToken(resource)
  async (req, res, next) => {
    if (!req.user?.isAuthenticated) return res.redirect('/logto/sign-in');

    const c = req.user.claims || {};
    req.viewUser = {
      prenom: c.given_name || '',
      nom: c.family_name || c.name || c.preferred_username || c.email || c.sub || 'Utilisateur',
      email: c.email || '',
      sub: c.sub || '',
    };
    next();
  },
];

/** -------- API (vérifie un Bearer token entrant) -------- */
const issuer = `${(process.env.LOGTO_ENDPOINT || '').replace(/\/+$/, '')}/oidc`;
const audience = process.env.API_RESOURCE || 'https://getToken';

const client = jwksClient({
  jwksUri: `${issuer}/jwks`,
  cache: true,
  cacheMaxEntries: 10,
  cacheMaxAge: 10 * 60 * 1000,
  rateLimit: true,
  jwksRequestsPerMinute: 30,
});

function getKey(header, cb) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return cb(err);
    cb(null, key.getPublicKey());
  });
}

const hasScope = (scope, wanted) => (scope || '').split(' ').includes(wanted);

const api = (requiredScope) => (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'missing_bearer' });
    }
    const token = auth.slice(7);

    jwt.verify(
      token,
      getKey,
      {
        issuer,
        audience,
        algorithms: ['RS256', 'ES256'],
        clockTolerance: 5, // tolérance légère aux décalages d’horloge (secondes)
      },
      (err, payload) => {
        if (err) {
          // Ne divulgue pas trop d’info côté client
          return res.status(401).json({ error: 'invalid_token' });
        }
        if (requiredScope && !hasScope(payload.scope, requiredScope)) {
          return res.status(403).json({ error: 'insufficient_scope', need: requiredScope });
        }
        req.auth = payload; // sub, scope, aud, iss, exp, ...
        next();
      }
    );
  } catch (e) {
    return res.status(401).json({ error: 'invalid_token' });
  }
};

module.exports = { session, api };
