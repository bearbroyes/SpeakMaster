const OPENAI_MODELS = ["gpt-4o-mini", "gpt-4o"] as const;

export class OpenAIError extends Error {
  readonly code?: string;
  readonly hint?: string;

  constructor(message: string, code?: string, hint?: string) {
    super(message);
    this.name = "OpenAIError";
    this.code = code;
    this.hint = hint;
  }
}

function getApiKey(): string | null {
  const raw = import.meta.env.VITE_OPENAI_API_KEY;
  if (!raw || raw.includes("%VITE_OPENAI_API_KEY%")) return null;
  const key = raw.trim();
  return key.startsWith("sk-") && key.length > 20 ? key : null;
}

function buildPrompt(transcript: string, theme: string, points: string[]): string {
  return `You are an English exam teacher reviewing an OGE monologue about "${theme}".
The student was required to cover these aspects:
${points.map((p, i) => `${i + 1}. ${p}`).join("\n")}

Speech-to-text transcript (may contain minor recognition errors — focus on content, not typos):
"${transcript.slice(0, 6000)}"

Give brief constructive feedback in Russian (3-5 sentences): which aspects seem covered, notable grammar issues, and one practical tip. Base your answer only on the transcript above. Do not invent facts. Do not give a numeric score.`;
}

function parseApiError(status: number, body: string): OpenAIError {
  try {
    const json = JSON.parse(body) as {
      error?: { message?: string; type?: string; code?: string };
    };
    const message = json.error?.message ?? body.slice(0, 300);
    const code = json.error?.code ?? json.error?.type ?? String(status);
    const lower = message.toLowerCase();

    if (status === 401 || lower.includes("incorrect api key") || lower.includes("invalid api key")) {
      return new OpenAIError(
        "Неверный API-ключ OpenAI.",
        code,
        "Проверьте секрет VITE_OPENAI_API_KEY в GitHub → Settings → Secrets → Actions (или OPENAI_API_KEY в Cloudflare Worker) и пересоберите сайт."
      );
    }

    if (status === 429 || lower.includes("rate limit") || lower.includes("quota")) {
      return new OpenAIError(
        "Превышена квота или лимит OpenAI API.",
        code,
        "Проверьте баланс и лимиты на platform.openai.com, затем попробуйте снова."
      );
    }

    return new OpenAIError(message, code);
  } catch {
    return new OpenAIError(`HTTP ${status}: ${body.slice(0, 200)}`);
  }
}

function extractText(data: unknown): string | null {
  const d = data as {
    choices?: { message?: { content?: string } }[];
  };
  const text = d.choices?.[0]?.message?.content;
  return text?.trim() || null;
}

async function callOpenAIRest(apiKey: string, prompt: string, baseUrl: string): Promise<string> {
  let lastError: OpenAIError | null = null;

  for (const model of OPENAI_MODELS) {
    let response: Response;
    try {
      response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4,
          max_tokens: 600,
        }),
      });
    } catch (networkErr) {
      const msg = networkErr instanceof Error ? networkErr.message : String(networkErr);
      const isCors = msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("network");
      throw new OpenAIError(
        isCors ? "Браузер заблокировал запрос к OpenAI (CORS)." : msg,
        "NETWORK",
        isCors
          ? "На GitHub Pages нужен прокси: задеплойте cloudflare/openai-proxy, ключ положите в OPENAI_API_KEY (Worker), URL — в секрет VITE_OPENAI_PROXY_URL."
          : undefined
      );
    }

    const body = await response.text();

    if (!response.ok) {
      lastError = parseApiError(response.status, body);
      if (response.status === 404 || body.includes("model") || body.includes("does not exist")) {
        continue;
      }
      throw lastError;
    }

    const text = extractText(JSON.parse(body));
    if (text) return text;
    lastError = new OpenAIError(`Пустой ответ от модели ${model}.`);
  }

  throw lastError ?? new OpenAIError("Не удалось получить ответ ни от одной модели OpenAI.");
}

async function callOpenAIProxy(prompt: string): Promise<string> {
  const proxyUrl = import.meta.env.VITE_OPENAI_PROXY_URL?.trim();
  if (!proxyUrl) throw new OpenAIError("Прокси не настроен.");

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
    if (json.error) throw new OpenAIError(json.error);
    const text = extractText(json);
    if (text) return text;
  } catch (e) {
    if (e instanceof OpenAIError) throw e;
  }

  throw new OpenAIError("Прокси вернул неожиданный ответ.");
}

export function isOpenAIConfigured(): boolean {
  return !!getApiKey() || !!import.meta.env.VITE_OPENAI_PROXY_URL?.trim();
}

export async function analyzeTranscript(
  transcript: string,
  theme: string,
  points: string[]
): Promise<string> {
  if (!transcript.trim()) {
    throw new OpenAIError("Транскрипт пуст — нечего анализировать.");
  }

  const prompt = buildPrompt(transcript, theme, points);
  const proxyUrl = import.meta.env.VITE_OPENAI_PROXY_URL?.trim();

  if (proxyUrl) {
    return callOpenAIProxy(prompt);
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new OpenAIError(
      "API-ключ OpenAI не встроен в сборку сайта.",
      "MISSING_KEY",
      "Добавьте секрет VITE_OPENAI_API_KEY в GitHub (Settings → Secrets → Actions) или настройте VITE_OPENAI_PROXY_URL, затем push в main."
    );
  }

  const isDev = import.meta.env.DEV;
  const baseUrl = isDev ? "/api/openai" : "https://api.openai.com";
  return callOpenAIRest(apiKey, prompt, baseUrl);
}
