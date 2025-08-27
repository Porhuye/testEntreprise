// /controllers/downstreamController.js
const API_RESOURCE = process.env.API_RESOURCE || 'https://getToken';
const DOWNSTREAM_URL = process.env.DOWNSTREAM_URL || 'https://service.interne.local/products';

const fetchWithTimeout = async (url, opts = {}, ms = 8000) => {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort('timeout'), ms);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
};

exports.callDownstream = async (req, res, next) => {
  try {
    const token = await req.getAccessToken(API_RESOURCE);
    const r = await fetchWithTimeout(DOWNSTREAM_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const raw = await r.text();
    let data;
    try { data = JSON.parse(raw); } catch { data = raw; }

    res.status(r.status).json({ status: r.status, data });
  } catch (e) {
    next(e);
  }
};
