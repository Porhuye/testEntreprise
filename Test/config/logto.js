// config/logto.js
require('dotenv').config();

module.exports = {
  endpoint: process.env.LOGTO_ENDPOINT,        // ex: https://wt19wf.logto.app
  appId: process.env.LOGTO_CLIENT_ID,
  appSecret: process.env.LOGTO_CLIENT_SECRET,
  baseUrl: process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
};
