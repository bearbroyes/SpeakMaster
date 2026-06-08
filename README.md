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

GitHub Pages отдаёт **только HTML/JS**. Отдельного сервера нет — Gemini вызывается **из браузера**, ключ вшивается в сборку при `npm run build`.

**Это значит:**

- Ключ **виден** в исходниках сайта (любой может его найти)
- Чтобы снизить риск: в [Google AI Studio](https://aistudio.google.com/apikey) ограничьте ключ:
  - **Application restrictions** → HTTP referrers
  - Добавьте: `https://ВАШ_ЛОГИН.github.io/*`

Без ограничения referrer ключ могут украсть и использовать с других сайтов.

**Альтернатива (безопаснее, но не «один сервер»):** бесплатный Cloudflare Worker / Vercel Function как прокси — ключ остаётся на сервере, Pages остаётся статическим.

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Разработка |
| `npm run build` | Сборка в `dist/` |
| `npm run preview` | Просмотр сборки |
| `npm run test` | Тесты |
