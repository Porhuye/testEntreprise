// services/wso2Introspect.js
const axios = require("axios");
const https = require("https");
const qs    = require("querystring");

async function introspectToken(token) {
  const payload = qs.stringify({
    token,
    token_type_hint: "access_token"
  });

  const basicAuth = Buffer.from(
    `${process.env.WSO2_ADMIN_ID}:${process.env.WSO2_ADMIN_MDP}`
  ).toString("base64");

  const resp = await axios.post(
    process.env.WSO2_INTROSPECT_URL,
    payload,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${basicAuth}`
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    }
  );

  return resp.data;  // { active: true, username: "...", ... }
}

module.exports = { introspectToken };
