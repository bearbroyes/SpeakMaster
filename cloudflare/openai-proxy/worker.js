/**
 * Cloudflare Worker — прокси для OpenAI API (ключ остаётся на сервере).
 *
 * Deploy:
 *   1. cloudflare.com → Workers → Create
 *   2. Settings → Variables → OPENAI_API_KEY = ваш ключ sk-...
 *   3. Вставьте этот код, сохраните
 *   4. В GitHub Secrets: VITE_OPENAI_PROXY_URL = https://YOUR-WORKER.workers.dev
 */

const MODELS = ["gpt-4o-mini", "gpt-4o"];

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

    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY not set on worker" }), {
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
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt.slice(0, 8000) }],
          temperature: 0.4,
          max_tokens: 600,
        }),
      });

      const text = await res.text();
      if (!res.ok) continue;

      try {
        const json = JSON.parse(text);
        const out = json?.choices?.[0]?.message?.content;
        if (out) {
          return new Response(JSON.stringify({ text: out }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch {
        /* try next model */
      }
    }

    return new Response(JSON.stringify({ error: "OpenAI request failed" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  },
};
