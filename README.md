# SpeakMasterPro

Тренажёр монологов для устной части ОГЭ по английскому. **Только статический сайт** — один `npm run build`, без сервера.

## Возможности

- 30 карточек монологов ОГЭ
- Подготовка 90с → запись до 2 мин → самооценка
- Подсчёт слов-паразитов и транскрипт (Web Speech API)
- AI-обратная связь через Gemini (опционально, прямо из браузера)
- Темы оформления, RU/EN, прогресс в localStorage

## Локально

```bash
npm install --registry https://registry.npmjs.org
cp .env.example .env.local
# Добавьте VITE_GEMINI_API_KEY в .env.local при необходимости
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
| `VITE_GEMINI_API_KEY` | Ключ Gemini для AI-анализа |

### 4. Деплой

```bash
git push origin main
```

Workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) соберёт и выложит `dist/` автоматически.

## Gemini на GitHub Pages — важно

Ключ вшивается при сборке (`VITE_GEMINI_API_KEY` в GitHub Secrets) **или** используется прокси (`VITE_GEMINI_PROXY_URL`).

### Если AI пишет «Не удалось получить анализ» — чаще всего referrer

В [Google AI Studio](https://aistudio.google.com/apikey) откройте ключ → **Application restrictions** → **HTTP referrers** и добавьте:

```
https://bearbroyes.github.io/*
http://localhost:*/*
```

Сохраните и подождите 1–5 минут. Затем **Ctrl+Shift+R** на сайте.

Убедитесь, что в GitHub → **Settings → Secrets → Actions** есть секрет `VITE_GEMINI_API_KEY` (без пробелов) и после изменения секрета был push в `main` (чтобы Actions пересобрал сайт).

### Прокси (безопаснее)

Готовый Worker: [`cloudflare/gemini-proxy/worker.js`](cloudflare/gemini-proxy/worker.js). После деплоя добавьте секрет `VITE_GEMINI_PROXY_URL` = URL worker. Ключ Gemini храните только в переменных Worker (`GEMINI_API_KEY`).

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Разработка |
| `npm run build` | Сборка в `dist/` |
| `npm run preview` | Просмотр сборки |
| `npm run test` | Тесты |
