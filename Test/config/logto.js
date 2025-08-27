// /config/logto.js
require('dotenv').config();

const must = (k, hint) => {
  const v = (process.env[k] || '').trim();
  if (!v || v === '...') {
    throw new Error(`[config/logto] ${k} manquant ou invalide${hint ? ` (${hint})` : ''}`);
  }
  return v;
};

let endpoint = must('LOGTO_ENDPOINT', 'ex: https://wtl9wf.logto.app (sans /oidc)');
if (endpoint.endsWith('/')) endpoint = endpoint.slice(0, -1);

const cfg = {
  endpoint,
  appId: must('LOGTO_CLIENT_ID', 'App ID de l’app Traditional Web'),
  appSecret: must('LOGTO_CLIENT_SECRET', 'App Secret de la même app'),
  baseUrl: process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
  resources: [process.env.API_RESOURCE || 'https://getToken'],
  ...(process.env.API_SCOPES
    ? { scopes: process.env.API_SCOPES.split(',').map(s => s.trim()).filter(Boolean) }
    : {}),
};

module.exports = Object.freeze(cfg);
