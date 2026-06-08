/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback, type MouseEvent } from "react";
import { AnimatePresence } from "motion/react";
import { Star } from "lucide-react";
import { motion } from "motion/react";
import { MONOLOGUES } from "./data";
import type { Monologue, Phase, PracticeMode, RubricAnswers } from "./types";
import { ROOT_BG_STYLES } from "./themes";
import { useTheme } from "./hooks/useTheme";
import { useI18n } from "./hooks/useI18n";
import { useRecording } from "./hooks/useRecording";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { Header } from "./components/Header";
import { GridDashboard } from "./components/GridDashboard";
import { PreparationPhase } from "./components/PreparationPhase";
import { BufferPhase } from "./components/BufferPhase";
import { RecordingPhase } from "./components/RecordingPhase";
import { ResultPhase } from "./components/ResultPhase";
import {
  loadAllProgress,
  recordAttempt,
  buildAttemptFromSession,
  getTopicProgress,
} from "./utils/progress";
import { triggerDownload, shareRecording } from "./utils/download";
import type { TopicProgress } from "./types";

export default function App() {
  const { theme, setTheme, ST } = useTheme();
  const { lang, setLang, t } = useI18n();

  const [activeMonologue, setActiveMonologue] = useState<Monologue | null>(null);
  const [phase, setPhase] = useState<Phase>("GRID");
  const [prepTimeLeft, setPrepTimeLeft] = useState(90);
  const [bufferTimeLeft, setBufferTimeLeft] = useState(5);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("training");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThemeFilter, setSelectedThemeFilter] = useState<string | null>(null);
  const [showUncompletedOnly, setShowUncompletedOnly] = useState(false);
  const [progress, setProgress] = useState<Record<number, TopicProgress>>(loadAllProgress);
  const [rubricAnswers, setRubricAnswers] = useState<RubricAnswers>({
    coveredAllPoints: false,
    fluencyFillerWords: false,
    introOutroClear: false,
    underGrammarLimit: false,
    timeOk: false,
  });
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; tx: number; ty: number; size: number; color: string; rotation: number }[]
  >([]);

  const speech = useSpeechRecognition();

  const handleRecordingComplete = useCallback(
    (data: {
      blob: Blob;
      url: string;
      rubric: RubricAnswers;
      checkedPoints: Record<number, boolean>;
      durationSeconds: number;
    }) => {
      const rubric = {
        ...data.rubric,
        fluencyFillerWords: speech.fillerCount <= 2,
      };
      setRubricAnswers(rubric);
      if (activeMonologue) {
        const updated = recordAttempt(
          activeMonologue.id,
          buildAttemptFromSession(
            rubric,
            data.checkedPoints,
            data.durationSeconds,
            speech.transcript || undefined,
            speech.fillerCount || undefined
          )
        );
        setProgress((prev) => ({ ...prev, [activeMonologue.id]: updated }));
      }
      speech.stopRecognition();
      if (speech.transcript && activeMonologue) {
        speech.analyzeWithAI(speech.transcript, activeMonologue.theme, activeMonologue.points);
      }
      setPhase("RESULT");
    },
    [activeMonologue, speech]
  );

  const recording = useRecording(handleRecordingComplete);

  const themes = useMemo(() => {
    const list = MONOLOGUES.map((m) => m.theme.trim().toLowerCase());
    return Array.from(new Set(list)).sort();
  }, []);

  const filteredMonologues = useMemo(() => {
    return MONOLOGUES.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.points.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTheme = selectedThemeFilter
        ? m.theme.trim().toLowerCase() === selectedThemeFilter.toLowerCase()
        : true;
      return matchesSearch && matchesTheme;
    });
  }, [searchQuery, selectedThemeFilter]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (phase === "PREPARATION") {
      interval = setInterval(() => {
        setPrepTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            setPhase("BUFFER");
            setBufferTimeLeft(5);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [phase]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (phase === "BUFFER") {
      interval = setInterval(() => {
        setBufferTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            beginRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [phase]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (phase === "RECORDING") {
      interval = setInterval(() => {
        recording.setRecordingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            recording.stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [phase]);

  const beginRecording = async () => {
    if (!activeMonologue) return;
    speech.reset();
    speech.startLiveRecognition();
    try {
      await recording.startRecording(activeMonologue);
      setPhase("RECORDING");
    } catch {
      setPhase("GRID");
    }
  };

  const startPrepWorkflow = async (monologue: Monologue) => {
    let hasAccess = recording.micPermission === "granted";
    if (!hasAccess) {
      hasAccess = await recording.requestMicAccess();
    }
    if (!hasAccess) return;
    setActiveMonologue(monologue);
    setPrepTimeLeft(90);
    recording.resetRecording();
    setPhase("PREPARATION");
  };

  const handleFinishPrepEarly = () => {
    if (practiceMode === "exam") return;
    setPhase("BUFFER");
    setBufferTimeLeft(5);
  };

  const handleBackToDashboard = () => {
    recording.cleanup();
    speech.reset();
    setActiveMonologue(null);
    setPhase("GRID");
  };

  const handleRetrySameTopic = () => {
    recording.resetRecording();
    speech.reset();
    if (activeMonologue) {
      setPrepTimeLeft(90);
      setPhase("PREPARATION");
    }
  };

  const handleSurpriseMe = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const colors = ["#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6"];
    setParticles(
      Array.from({ length: 30 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * 200;
        return {
          id: Date.now() + i,
          x: startX,
          y: startY,
          tx: Math.cos(angle) * dist,
          ty: Math.sin(angle) * dist,
          size: 15 + Math.random() * 20,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
        };
      })
    );
    const random = MONOLOGUES[Math.floor(Math.random() * MONOLOGUES.length)];
    setTimeout(() => {
      startPrepWorkflow(random);
      setParticles([]);
    }, 900);
  };

  const handleShare = async () => {
    if (!recording.recordingBlob || !activeMonologue) return;
    const shared = await shareRecording(recording.recordingBlob, activeMonologue, t("shareViaPhone"));
    if (!shared) {
      triggerDownload(recording.recordingBlob, activeMonologue);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      id="app_root"
      className={`min-h-screen mesh-bg-animated ${ST.rootBg} ${ST.selectionAccent} font-sans antialiased flex flex-col transition-colors duration-500`}
      style={ROOT_BG_STYLES[theme]}
    >
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: p.x, y: p.y, scale: 0, opacity: 1 }}
              animate={{ x: p.x + p.tx, y: p.y + p.ty, scale: [0, 1.2, 0], opacity: [1, 1, 0] }}
              transition={{ duration: 0.9 }}
              style={{ position: "fixed", left: 0, top: 0, color: p.color }}
            >
              <Star style={{ width: p.size, height: p.size }} className="fill-current" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Header
        ST={ST}
        theme={theme}
        setTheme={setTheme}
        lang={lang}
        setLang={setLang}
        micPermission={recording.micPermission}
        onRequestMic={recording.requestMicAccess}
        onBack={handleBackToDashboard}
        t={t}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-center z-10">
        <AnimatePresence mode="wait">
          {phase === "GRID" && (
            <GridDashboard
              ST={ST}
              t={t}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedThemeFilter={selectedThemeFilter}
              setSelectedThemeFilter={setSelectedThemeFilter}
              filteredMonologues={filteredMonologues}
              themes={themes}
              progress={progress}
              showUncompletedOnly={showUncompletedOnly}
              setShowUncompletedOnly={setShowUncompletedOnly}
              practiceMode={practiceMode}
              setPracticeMode={setPracticeMode}
              micPermissionError={recording.micPermissionError}
              onSelect={startPrepWorkflow}
              onSurpriseMe={handleSurpriseMe}
            />
          )}

          {phase === "PREPARATION" && activeMonologue && (
            <PreparationPhase
              ST={ST}
              t={t}
              monologue={activeMonologue}
              prepTimeLeft={prepTimeLeft}
              practiceMode={practiceMode}
              formatTime={formatTime}
              onFinishEarly={handleFinishPrepEarly}
              onCancel={handleBackToDashboard}
            />
          )}

          {phase === "BUFFER" && <BufferPhase ST={ST} t={t} bufferTimeLeft={bufferTimeLeft} />}

          {phase === "RECORDING" && activeMonologue && (
            <RecordingPhase
              ST={ST}
              t={t}
              monologue={activeMonologue}
              recordingSeconds={recording.recordingSeconds}
              checkedPoints={recording.checkedPoints}
              setCheckedPoints={recording.setCheckedPoints}
              practiceMode={practiceMode}
              formatTime={formatTime}
              onStop={recording.stopRecording}
              onCancel={practiceMode === "training" ? handleBackToDashboard : undefined}
            />
          )}

          {phase === "RESULT" && activeMonologue && (
            <ResultPhase
              ST={ST}
              t={t}
              monologue={activeMonologue}
              audioUrl={recording.audioUrl}
              recordingBlob={recording.recordingBlob}
              rubricAnswers={rubricAnswers}
              setRubricAnswers={setRubricAnswers}
              topicProgress={getTopicProgress(activeMonologue.id)}
              transcript={speech.transcript}
              fillerCount={speech.fillerCount}
              aiFeedback={speech.aiFeedback}
              isAnalyzing={speech.isAnalyzing}
              onDownload={() =>
                recording.recordingBlob && triggerDownload(recording.recordingBlob, activeMonologue)
              }
              onShare={handleShare}
              onRetry={handleRetrySameTopic}
              onBack={handleBackToDashboard}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className={`h-14 flex items-center justify-center px-4 border-t text-[9px] uppercase tracking-widest mt-8 ${ST.footer}`}>
        <span>{t("footer")}</span>
      </footer>
    </div>
  );
}
