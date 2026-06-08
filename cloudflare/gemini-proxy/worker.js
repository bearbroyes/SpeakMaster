/**
 * Cloudflare Worker — прокси для Gemini API (ключ остаётся на сервере).
 *
 * Deploy:
 *   1. cloudflare.com → Workers → Create
 *   2. Settings → Variables → GEMINI_API_KEY = ваш ключ
 *   3. Вставьте этот код, сохраните
 *   4. В GitHub Secrets добавьте VITE_GEMINI_PROXY_URL = https://YOUR-WORKER.workers.dev
 */

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "POST only" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not set on worker" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let prompt;
    try {
      const body = await request.json();
      prompt = body.prompt;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const model of MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt.slice(0, 8000) }] }],
        }),
      });

      const text = await res.text();
      if (!res.ok) continue;

      try {
        const json = JSON.parse(text);
        const out = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (out) {
          return new Response(JSON.stringify({ text: out }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch {
        /* try next model */
      }
    }

    return new Response(JSON.stringify({ error: "Gemini request failed" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  },
};
