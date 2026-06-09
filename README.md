# SpeakMasterPro

Тренажёр монологов для устной части ОГЭ по английскому. **Только статический сайт** — один `npm run build`, без сервера.

## Возможности

- 30 карточек монологов ОГЭ
- Подготовка 90с → запись до 2 мин → самооценка
- Подсчёт слов-паразитов и транскрипт (Web Speech API)
- Офлайн-анализ речи: транскрипт, темп, паузы, слова-паразиты (Web Speech API)
- Темы оформления, RU/EN, прогресс в localStorage

## Локально

```bash
npm install --registry https://registry.npmjs.org
cp .env.example .env.local
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

### 4. Деплой

```bash
git push origin main
```

Workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) соберёт и выложит `dist/` автоматически.

## Распознавание речи

Транскрипт и метрики работают **офлайн в браузере** (Web Speech API). Лучше всего в **Chrome** или **Edge** с разрешённым микрофоном. Интернет для анализа не нужен.

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Разработка |
| `npm run build` | Сборка в `dist/` |
| `npm run preview` | Просмотр сборки |
| `npm run test` | Тесты |
