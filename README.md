# SpeakMasterPro

Тренажёр монологов для устной части ОГЭ по английскому. **Только статический сайт** — один `npm run build`, без сервера.

## Возможности

- 30 карточек монологов ОГЭ
- Подготовка 90с → запись до 2 мин → самооценка
- Подсчёт слов-паразитов и транскрипт (Web Speech API)
- AI-обратная связь через OpenAI (опционально)
- Темы оформления, RU/EN, прогресс в localStorage

## Локально

```bash
npm install --registry https://registry.npmjs.org
cp .env.example .env.local
# Добавьте VITE_OPENAI_API_KEY в .env.local при необходимости
npm run dev
```

Откройте: **http://localhost:3000/SpeakMaster/**

Код входа: `VITE_CLASS_CODE` в `.env.local` (по умолчанию `Oge_Monolog_012`).

## GitHub Pages

### 1. Настройка репозитория

- Репозиторий должен называться **`SpeakMaster`** (тогда URL: `https://ВАШ_ЛОГИН.github.io/SpeakMaster/`)
- Или измените `base` в [`vite.config.ts`](vite.config.ts), если имя репозитория другое

### 2. Включите Pages

Settings → Pages → Source: **GitHub Actions**

### 3. Секреты (Settings → Secrets → Actions)

| Секрет | Зачем |
|--------|--------|
| `VITE_CLASS_CODE` | Пароль входа на сайт |
| `VITE_OPENAI_API_KEY` | Ключ OpenAI (для локальной разработки) |
| `VITE_OPENAI_PROXY_URL` | URL прокси для AI на GitHub Pages (обязательно для сайта) |

### 4. Деплой

```bash
git push origin main
```

Workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) соберёт и выложит `dist/` автоматически.

## OpenAI на GitHub Pages — важно

Браузер **не может** напрямую вызывать OpenAI API (CORS). Для живого сайта нужен прокси:

1. [Cloudflare Workers](https://workers.cloudflare.com) → Create Worker
2. Вставьте код из [`cloudflare/openai-proxy/worker.js`](cloudflare/openai-proxy/worker.js)
3. Settings → Variables → `OPENAI_API_KEY` = ваш ключ `sk-...`
4. Deploy → скопируйте URL worker
5. GitHub → **Settings → Secrets → Actions** → `VITE_OPENAI_PROXY_URL` = URL worker
6. Push в `main` (пересборка сайта)

### Локально

В `.env.local`:

```
VITE_OPENAI_API_KEY=sk-...
```

`npm run dev` проксирует запросы через Vite — AI работает без Cloudflare.

**Не публикуйте ключ в чатах и не коммитьте в git.** Только GitHub Secrets / Worker Variables.

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Разработка |
| `npm run build` | Сборка в `dist/` |
| `npm run preview` | Просмотр сборки |
| `npm run test` | Тесты |
