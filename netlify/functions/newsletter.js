// Netlify Function: proxy newsletter submissions to Google Apps Script
// Works with URL-encoded form posts or JSON. Returns JSON for your front-end.

const ALLOW_ORIGINS = [
  "http://localhost:4321", // Astro dev
  "http://localhost:8888", // Netlify dev
  "https://midmotours.netlify.app", // Netlify preview/prod
  "https://midmotours.com", // Custom domain (if/when live)
];

const corsHeaders = (origin) => {
  const allow = ALLOW_ORIGINS.includes(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    Vary: "Origin",
    "Content-Type": "application/json",
  };
};

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || "";
  const baseHeaders = corsHeaders(origin);

  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: baseHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: baseHeaders, body: JSON.stringify({ ok: false, error: "Method Not Allowed" }) };
  }

  const gscript = process.env.GSCRIPT_URL;
  if (!gscript) {
    return { statusCode: 500, headers: baseHeaders, body: JSON.stringify({ ok: false, error: "Missing GSCRIPT_URL" }) };
  }

  try {
    // Forward original content-type & body to Apps Script
    const contentType =
      event.headers["content-type"] ||
      event.headers["Content-Type"] ||
      "application/x-www-form-urlencoded;charset=UTF-8";
    const upstream = await fetch(gscript, {
      method: "POST",
      headers: { "Content-Type": contentType },
      body: event.body,
    });

    // Try to pass through JSON; otherwise normalize
    const ctype = upstream.headers.get("content-type") || "";
    let payload;
    if (ctype.includes("application/json")) {
      payload = await upstream.json();
    } else {
      payload = { ok: upstream.ok, message: upstream.ok ? "Thanks for subscribing!" : "Upstream error" };
    }

    return {
      statusCode: upstream.ok ? 200 : 502,
      headers: baseHeaders,
      body: JSON.stringify(payload),
    };
  } catch (err) {
    return { statusCode: 500, headers: baseHeaders, body: JSON.stringify({ ok: false, error: "Proxy error" }) };
  }
};
