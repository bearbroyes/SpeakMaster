import type { Lang } from "../types";

export type TranslationKey =
  | "appSubtitle"
  | "activeSession"
  | "englishPractice"
  | "micConnected"
  | "allowMic"
  | "selectTopic"
  | "heroDesc"
  | "stepChoose"
  | "stepPrepare"
  | "stepReady"
  | "stepRecord"
  | "micError"
  | "searchPlaceholder"
  | "surpriseMe"
  | "selectedCount"
  | "examThemes"
  | "allIssues"
  | "beginTest"
  | "noResults"
  | "noResultsDesc"
  | "resetFilters"
  | "prepPhase"
  | "prepDesc"
  | "includeAspects"
  | "prepTimer"
  | "prepTimerDesc"
  | "startEarly"
  | "cancelExit"
  | "linkerTip"
  | "introPhrase"
  | "outroPhrase"
  | "grammarTip"
  | "bufferState"
  | "getReady"
  | "bufferDesc"
  | "bufferNote"
  | "liveRecording"
  | "recordDesc"
  | "aspectsTracker"
  | "aspectsVerified"
  | "limitRemaining"
  | "stopRecord"
  | "cancelAttempt"
  | "outlineTips"
  | "storageNote"
  | "completed"
  | "completedDesc"
  | "generatedFile"
  | "downloadAgain"
  | "listenEvaluate"
  | "playbackDesc"
  | "playbackOffline"
  | "examGuidelines"
  | "guideline1"
  | "guideline2"
  | "guideline3"
  | "rubricTitle"
  | "rubricDesc"
  | "rubric1Title"
  | "rubric1Desc"
  | "rubric2Title"
  | "rubric2Desc"
  | "rubric3Title"
  | "rubric3Desc"
  | "rubric4Title"
  | "rubric4Desc"
  | "rubric5Title"
  | "rubric5Desc"
  | "retryPractice"
  | "chooseDifferent"
  | "footer"
  | "studentProfileTitle"
  | "studentProfileDesc"
  | "fullName"
  | "classGroup"
  | "saveProfile"
  | "skipProfile"
  | "submitToTeacher"
  | "submitInstructions"
  | "shareViaPhone"
  | "submitSuccess"
  | "submitError"
  | "progressCount"
  | "showUncompleted"
  | "statusNotStarted"
  | "statusRecorded"
  | "statusSubmitted"
  | "trainingMode"
  | "examMode"
  | "examModeDesc"
  | "attemptHistory"
  | "transcript"
  | "transcriptEmpty"
  | "spokenWordsTitle"
  | "spokenWordsDesc"
  | "spokenWordsStats"
  | "liveTranscript"
  | "liveTranscriptWaiting"
  | "speechUnsupported"
  | "fillerWords"
  | "cheatSheet"
  | "coreRubrics"
  | "speechAnalysisTitle"
  | "speechAnalysisDesc"
  | "metricWords"
  | "metricWordsHint"
  | "metricWpm"
  | "metricWpmHint"
  | "metricSentenceLen"
  | "metricSentenceHint"
  | "metricPauses"
  | "metricPausesHint"
  | "metricDuration"
  | "metricDurationValue"
  | "metricDurationHint"
  | "metricGrammar"
  | "metricGrammarHint"
  | "fillerChartTitle"
  | "fillerChartDesc"
  | "fillerBucketLabel"
  | "fillerListTitle"
  | "fillerListEmpty";

const en: Record<TranslationKey, string> = {
  appSubtitle: "Exam Monologue rehearsal deck",
  activeSession: "Active Session",
  englishPractice: "English Speaking Practice",
  micConnected: "Mic Connected",
  allowMic: "Allow Microphone",
  selectTopic: "Select a Speech Topic",
  heroDesc:
    "Prepare your thoughts in 90 seconds, then record a monologue up to 2 minutes addressing all prompt criteria. Play back your voice, self-assess using the rubric, and send audio to your teacher.",
  stepChoose: "Choose Topic",
  stepPrepare: "Prepare Notes",
  stepReady: "Get Ready",
  stepRecord: "Record & Send",
  micError: "Microphone Authorization Requested:",
  searchPlaceholder: "Search title, themes, or exact points...",
  surpriseMe: "Surprise me!",
  selectedCount: "Selected: {count} card templates",
  examThemes: "Exam Study Themes:",
  allIssues: "All Issues",
  beginTest: "Begin Speaking Test",
  noResults: "No Monologues found",
  noResultsDesc: "Try searching with alternative terms or clear filters.",
  resetFilters: "Reset All Filters",
  prepPhase: "Preparation phase",
  prepDesc:
    "You have exactly 90 seconds to study the task outline and plan your monologue. Draft a mental map of your transitions. Do not start speaking yet.",
  includeAspects: "Include the following aspects in your talk:",
  prepTimer: "Preparation Timer",
  prepTimerDesc: "Timer will automatically navigate to speech buffer upon completion.",
  startEarly: "Start Monologue Early",
  cancelExit: "Cancel practice & exit",
  linkerTip: 'Connect thoughts using "Moreover", "On the other hand", & "To sum up..."',
  introPhrase: 'Intro: "I am going to give a talk about..."',
  outroPhrase: 'Outro: "That is all I wanted to say. Thank you for listening."',
  grammarTip: "Use Present Simple for facts, Past Simple for experiences, Future for plans.",
  bufferState: "Buffer state",
  getReady: "Get Ready to Speak",
  bufferDesc: "Recorder will start when the clock ticks down. Breathe deeply.",
  bufferNote: "Recording will begin automatically. Speak clearly and audibly.",
  liveRecording: "Live Speech Rehearsal",
  recordDesc:
    "You have up to 2 minutes. Check aspects as you cover them vocally to assess coverage!",
  aspectsTracker: "Aspects Coverage Tracker:",
  aspectsVerified: "{done} / {total} aspects verified",
  limitRemaining: "limit remaining",
  stopRecord: "Stop & Save Speech",
  cancelAttempt: "Cancel Attempt & Back",
  outlineTips: "Standard Outline Tips:",
  storageNote: "Saving audio with your name for teacher",
  completed: "Monologue Completed!",
  completedDesc:
    'Good job! Your recording for "{theme}" was saved. Listen back, self-assess, and send to your teacher.',
  generatedFile: "Generated Speech File:",
  downloadAgain: "Download File Again",
  listenEvaluate: "Listen & Evaluate",
  playbackDesc: "Play back your response to check pronunciation and delivery:",
  playbackOffline: "Your browser didn't produce a playback URL. The file was downloaded.",
  examGuidelines: "Exam speaking guidelines:",
  guideline1: "Your monologue should be continuous (no long breaks longer than 3 seconds).",
  guideline2: "Keep sentences grammatically simple to minimize syntax errors.",
  guideline3: "Aim to construct 10 to 12 total phrases of conversational English.",
  rubricTitle: "State Speaking Rubric Audit",
  rubricDesc: "Grade your recording according to the official state assessment criteria:",
  rubric1Title: "1. Content Completeness (Aspects Covered)",
  rubric1Desc: "Did you fully address all 4 aspects outlined in the card?",
  rubric2Title: "2. Speech Coherence & Linkers",
  rubric2Desc: "Used proper links such as 'moreover', 'as for', 'finally' with correct pauses.",
  rubric3Title: "3. Structured Introduction & Outro",
  rubric3Desc: 'Initiated with intro and concluded with "That is all I wanted to say. Thank you."',
  rubric4Title: "4. Grammar, Lexis, & Pronunciation",
  rubric4Desc: "Contained no more than 3 phonetic or basic grammar mistakes.",
  rubric5Title: "5. Time Management",
  rubric5Desc: "Response was under the 2-minute limit without interruptions.",
  retryPractice: "Retry Dialogue Practice",
  chooseDifferent: "Choose Different Topic",
  footer: "Designed for Exam Preparation · Frosted Glass Studio · © 2026",
  studentProfileTitle: "Student Profile",
  studentProfileDesc: "Enter your name and class so the teacher can identify your recording.",
  fullName: "Full Name (ФИО)",
  classGroup: "Class / Group",
  saveProfile: "Save & Continue",
  skipProfile: "Skip",
  submitToTeacher: "Send to Teacher",
  submitInstructions:
    "Save the file and upload it to your class chat, Google Classroom, or Yandex.Disk folder shared by your teacher.",
  shareViaPhone: "Share via Phone",
  submitSuccess: "Recording sent successfully!",
  submitError: "Could not send. Download the file and upload manually.",
  progressCount: "{done} of {total} topics practiced",
  showUncompleted: "Show uncompleted only",
  statusNotStarted: "Not started",
  statusRecorded: "Recorded",
  statusSubmitted: "Sent to teacher",
  trainingMode: "Training",
  examMode: "Exam",
  examModeDesc: "Exam mode: no early start, no hints, no cancel during recording.",
  attemptHistory: "Attempt history",
  transcript: "Speech transcript",
  transcriptEmpty: "Speech was not recognized. Use Chrome or Edge with microphone access, speak clearly in English.",
  spokenWordsTitle: "Your spoken words",
  spokenWordsDesc: "Everything you said during the recording — sentence by sentence.",
  spokenWordsStats: "{words} words · {sec}s",
  liveTranscript: "Live transcript",
  liveTranscriptWaiting: "Listening… speak in English",
  speechUnsupported: "Speech recognition is not available in this browser. Use Chrome or Edge.",
  fillerWords: "Filler words detected: {count}",
  cheatSheet: "Exam phrases cheat sheet",
  coreRubrics: "Core rubrics ({count}):",
  speechAnalysisTitle: "Offline speech analysis",
  speechAnalysisDesc: "Metrics from your recording only — frozen when you stop. No AI required.",
  metricWords: "Words",
  metricWordsHint: "Typical monologue: 100–150 words",
  metricWpm: "Pace (WPM)",
  metricWpmHint: "Comfortable range: 90–160 WPM",
  metricSentenceLen: "Avg. sentence",
  metricSentenceHint: "{count} sentences total",
  metricPauses: "Long pauses",
  metricPausesHint: "Pauses over 3 seconds",
  metricDuration: "Duration",
  metricDurationValue: "{sec}s",
  metricDurationHint: "Recording length",
  metricGrammar: "Grammar flags",
  metricGrammarHint: "Heuristic check — review yourself",
  fillerChartTitle: "Filler words over time",
  fillerChartDesc: "Total fillers: {total}. Each bar = 10 seconds of speech.",
  fillerBucketLabel: "{start}s–{start}s+10: {count} fillers",
  fillerListTitle: "Filler words found",
  fillerListEmpty: "No filler words detected — great fluency!",
};

const ru: Record<TranslationKey, string> = {
  appSubtitle: "Тренажёр монологов для ОГЭ",
  activeSession: "Текущая сессия",
  englishPractice: "Устная практика — английский",
  micConnected: "Микрофон подключён",
  allowMic: "Разрешить микрофон",
  selectTopic: "Выберите тему монолога",
  heroDesc:
    "Подготовьтесь 90 секунд, затем запишите монолог до 2 минут, раскрыв все пункты плана. Прослушайте запись, оцените себя по рубрике и отправьте аудио учителю.",
  stepChoose: "Выбор темы",
  stepPrepare: "Подготовка",
  stepReady: "Готовность",
  stepRecord: "Запись и отправка",
  micError: "Требуется доступ к микрофону:",
  searchPlaceholder: "Поиск по теме или пунктам плана...",
  surpriseMe: "Случайная тема!",
  selectedCount: "Найдено: {count} карточек",
  examThemes: "Темы экзамена:",
  allIssues: "Все темы",
  beginTest: "Начать speaking",
  noResults: "Монологи не найдены",
  noResultsDesc: "Попробуйте другие слова или сбросьте фильтры.",
  resetFilters: "Сбросить фильтры",
  prepPhase: "Фаза подготовки",
  prepDesc:
    "У вас ровно 90 секунд, чтобы изучить план и продумать монолог. Не начинайте говорить раньше времени.",
  includeAspects: "Включите в высказывание следующие аспекты:",
  prepTimer: "Таймер подготовки",
  prepTimerDesc: "По окончании таймера начнётся запись.",
  startEarly: "Начать монолог раньше",
  cancelExit: "Отменить и выйти",
  linkerTip: 'Связывайте мысли: "Moreover", "On the other hand", "To sum up..."',
  introPhrase: 'Вступление: "I am going to give a talk about..."',
  outroPhrase: 'Заключение: "That is all I wanted to say. Thank you for listening."',
  grammarTip: "Present Simple — факты, Past Simple — опыт, Future — планы.",
  bufferState: "Пауза перед записью",
  getReady: "Приготовьтесь говорить",
  bufferDesc: "Запись начнётся автоматически. Сделайте глубокий вдох.",
  bufferNote: "Говорите чётко и громко. Запись начнётся автоматически.",
  liveRecording: "Идёт запись",
  recordDesc: "До 2 минут. Отмечайте пункты плана по мере их раскрытия.",
  aspectsTracker: "Трекер аспектов:",
  aspectsVerified: "{done} / {total} аспектов отмечено",
  limitRemaining: "осталось",
  stopRecord: "Остановить и сохранить",
  cancelAttempt: "Отменить попытку",
  outlineTips: "Стандартные фразы:",
  storageNote: "Файл сохраняется с вашим именем для учителя",
  completed: "Монолог записан!",
  completedDesc:
    'Отлично! Запись по теме "{theme}" сохранена. Прослушайте, оцените себя и отправьте учителю.',
  generatedFile: "Файл записи:",
  downloadAgain: "Скачать снова",
  listenEvaluate: "Прослушать и оценить",
  playbackDesc: "Прослушайте ответ и проверьте произношение:",
  playbackOffline: "Нет URL для воспроизведения. Файл уже скачан.",
  examGuidelines: "Рекомендации к экзамену:",
  guideline1: "Монолог должен быть непрерывным (паузы не более 3 секунд).",
  guideline2: "Используйте простые грамматические конструкции.",
  guideline3: "Стремитесь к 10–12 фразам разговорного английского.",
  rubricTitle: "Самооценка по рубрике ОГЭ",
  rubricDesc: "Оцените запись по официальным критериям:",
  rubric1Title: "1. Решение коммуникативной задачи",
  rubric1Desc: "Все 4 аспекта плана раскрыты полно и точно?",
  rubric2Title: "2. Организация высказывания",
  rubric2Desc: "Использованы связки: moreover, as for, finally и т.д.",
  rubric3Title: "3. Вступление и заключение",
  rubric3Desc: 'Есть вступление и фраза "That is all I wanted to say. Thank you."',
  rubric4Title: "4. Языковое оформление",
  rubric4Desc: "Не более 3 фонетических или грамматических ошибок.",
  rubric5Title: "5. Управление временем",
  rubric5Desc: "Высказывание уложилось в 2 минуты.",
  retryPractice: "Повторить эту тему",
  chooseDifferent: "Выбрать другую тему",
  footer: "Подготовка к ОГЭ · Frosted Glass Studio · © 2026",
  studentProfileTitle: "Профиль ученика",
  studentProfileDesc: "Введите ФИО и класс — учитель сможет найти вашу запись.",
  fullName: "ФИО",
  classGroup: "Класс / группа",
  saveProfile: "Сохранить и продолжить",
  skipProfile: "Пропустить",
  submitToTeacher: "Отправить учителю",
  submitInstructions:
    "Сохраните файл и загрузите в чат класса, Google Classroom или папку Яндекс.Диска, которую дал учитель.",
  shareViaPhone: "Поделиться с телефона",
  submitSuccess: "Запись успешно отправлена!",
  submitError: "Не удалось отправить. Скачайте файл и загрузите вручную.",
  progressCount: "Отработано {done} из {total} тем",
  showUncompleted: "Только непройденные",
  statusNotStarted: "Не начато",
  statusRecorded: "Записано",
  statusSubmitted: "Отправлено",
  trainingMode: "Тренировка",
  examMode: "Экзамен",
  examModeDesc: "Режим экзамена: без досрочного старта, подсказок и отмены.",
  attemptHistory: "История попыток",
  transcript: "Транскрипт речи",
  transcriptEmpty: "Речь не распознана. Используйте Chrome или Edge с доступом к микрофону и говорите чётко по-английски.",
  spokenWordsTitle: "Текст вашего монолога",
  spokenWordsDesc: "Все слова, которые вы произнесли во время записи — по предложениям.",
  spokenWordsStats: "{words} слов · {sec} с",
  liveTranscript: "Транскрипт в реальном времени",
  liveTranscriptWaiting: "Слушаю… говорите по-английски",
  speechUnsupported: "Распознавание речи недоступно в этом браузере. Используйте Chrome или Edge.",
  fillerWords: "Слов-паразитов: {count}",
  cheatSheet: "Шпаргалка фраз для экзамена",
  coreRubrics: "Пункты плана ({count}):",
  speechAnalysisTitle: "Анализ речи (офлайн)",
  speechAnalysisDesc: "Метрики только за время записи — фиксируются при остановке. Без ИИ.",
  metricWords: "Слов",
  metricWordsHint: "Обычный монолог: 100–150 слов",
  metricWpm: "Темп (сл/мин)",
  metricWpmHint: "Комфортно: 90–160 слов/мин",
  metricSentenceLen: "Средн. фраза",
  metricSentenceHint: "Всего предложений: {count}",
  metricPauses: "Длинные паузы",
  metricPausesHint: "Паузы более 3 секунд",
  metricDuration: "Длительность",
  metricDurationValue: "{sec} с",
  metricDurationHint: "Время записи",
  metricGrammar: "Грамматика",
  metricGrammarHint: "Эвристика — проверьте сами",
  fillerChartTitle: "Слова-паразиты по времени",
  fillerChartDesc: "Всего паразитов: {total}. Каждый столбец — 10 секунд речи.",
  fillerBucketLabel: "{start}–{start}+10 с: {count} шт.",
  fillerListTitle: "Какие слова-паразиты были",
  fillerListEmpty: "Слов-паразитов не найдено — отличная беглость!",
};

export const translations: Record<Lang, Record<TranslationKey, string>> = { en, ru };

export function t(lang: Lang, key: TranslationKey, vars?: Record<string, string | number>): string {
  let text = translations[lang][key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}
