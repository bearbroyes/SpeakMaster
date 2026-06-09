const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"] as const;

export class GeminiError extends Error {
  readonly code?: string;
  readonly hint?: string;

  constructor(message: string, code?: string, hint?: string) {
    super(message);
    this.name = "GeminiError";
    this.code = code;
    this.hint = hint;
  }
}

function getApiKey(): string | null {
  const raw = import.meta.env.VITE_GEMINI_API_KEY;
  if (!raw || raw.includes("%VITE_GEMINI_API_KEY%")) return null;
  const key = raw.trim();
  return key.length > 10 ? key : null;
}

function buildPrompt(transcript: string, theme: string, points: string[]): string {
  return `You are an English exam teacher reviewing an OGE monologue about "${theme}".
The student was required to cover these aspects:
${points.map((p, i) => `${i + 1}. ${p}`).join("\n")}

Speech-to-text transcript (may contain minor recognition errors — focus on content, not typos):
"${transcript.slice(0, 6000)}"

Give brief constructive feedback in Russian (3-5 sentences): which aspects seem covered, notable grammar issues, and one practical tip. Base your answer only on the transcript above. Do not invent facts. Do not give a numeric score.`;
}

function parseApiError(status: number, body: string): GeminiError {
  try {
    const json = JSON.parse(body) as {
      error?: { message?: string; status?: string; code?: number };
    };
    const message = json.error?.message ?? body.slice(0, 300);
    const code = json.error?.status ?? String(status);
    const lower = message.toLowerCase();

    if (
      lower.includes("referer") ||
      lower.includes("referrer") ||
      lower.includes("application restriction") ||
      code === "PERMISSION_DENIED"
    ) {
      return new GeminiError(
        message,
        code,
        "Google AI Studio → API key → Application restrictions → HTTP referrers. Добавьте:\n• https://bearbroyes.github.io/*\n• http://localhost:*/*\nСохраните и подождите 1–5 минут."
      );
    }

    if (code === "RESOURCE_EXHAUSTED" || status === 429) {
      return new GeminiError(
        "Превышена квота Gemini API.",
        code,
        "Проверьте лимиты в Google AI Studio или подождите и попробуйте снова."
      );
    }

    if (lower.includes("api key not valid") || lower.includes("invalid api key")) {
      return new GeminiError(
        "Неверный API-ключ.",
        code,
        "Создайте новый ключ в aistudio.google.com/apikey и обновите секрет VITE_GEMINI_API_KEY в GitHub → Settings → Secrets → Actions, затем сделайте push в main."
      );
    }

    return new GeminiError(message, code);
  } catch {
    return new GeminiError(`HTTP ${status}: ${body.slice(0, 200)}`);
  }
}

function extractText(data: unknown): string | null {
  const d = data as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = d.candidates?.[0]?.content?.parts?.[0]?.text;
  return text?.trim() || null;
}

async function callGeminiRest(apiKey: string, prompt: string): Promise<string> {
  let lastError: GeminiError | null = null;

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      });
    } catch (networkErr) {
      const msg = networkErr instanceof Error ? networkErr.message : String(networkErr);
      const isCors = msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("network");
      throw new GeminiError(
        isCors ? "Браузер заблокировал запрос к Gemini (CORS/сеть)." : msg,
        "NETWORK",
        isCors
          ? "Настройте HTTP referrers для ключа (см. README) или задеплойте прокси Cloudflare Worker из папки cloudflare/ и укажите VITE_GEMINI_PROXY_URL."
          : undefined
      );
    }

    const body = await response.text();

    if (!response.ok) {
      lastError = parseApiError(response.status, body);
      if (response.status === 404 || body.includes("not found") || body.includes("NOT_FOUND")) {
        continue;
      }
      if (response.status === 400 && body.includes("model")) {
        continue;
      }
      throw lastError;
    }

    const text = extractText(JSON.parse(body));
    if (text) return text;
    lastError = new GeminiError(`Пустой ответ от модели ${model}.`);
  }

  throw lastError ?? new GeminiError("Не удалось получить ответ ни от одной модели Gemini.");
}

async function callGeminiProxy(prompt: string): Promise<string> {
  const proxyUrl = import.meta.env.VITE_GEMINI_PROXY_URL?.trim();
  if (!proxyUrl) throw new GeminiError("Прокси не настроен.");

  const response = await fetch(proxyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const body = await response.text();
  if (!response.ok) {
    throw parseApiError(response.status, body);
  }

  try {
    const json = JSON.parse(body) as { text?: string; error?: string };
    if (json.text) return json.text;
    if (json.error) throw new GeminiError(json.error);
    const text = extractText(json);
    if (text) return text;
  } catch (e) {
    if (e instanceof GeminiError) throw e;
  }

  throw new GeminiError("Прокси вернул неожиданный ответ.");
}

export function isGeminiConfigured(): boolean {
  return !!getApiKey() || !!import.meta.env.VITE_GEMINI_PROXY_URL?.trim();
}

export async function analyzeTranscript(
  transcript: string,
  theme: string,
  points: string[]
): Promise<string> {
  if (!transcript.trim()) {
    throw new GeminiError("Транскрипт пуст — нечего анализировать.");
  }

  const prompt = buildPrompt(transcript, theme, points);
  const proxyUrl = import.meta.env.VITE_GEMINI_PROXY_URL?.trim();

  if (proxyUrl) {
    return callGeminiProxy(prompt);
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new GeminiError(
      "API-ключ не встроен в сборку сайта.",
      "MISSING_KEY",
      "Добавьте секрет VITE_GEMINI_API_KEY в GitHub (Settings → Secrets → Actions) и заново задеплойте main."
    );
  }

  return callGeminiRest(apiKey, prompt);
}
