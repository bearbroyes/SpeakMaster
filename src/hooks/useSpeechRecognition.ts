import { useCallback, useRef, useState } from "react";
import { countFillerWords, findFillersInChunk, getSpeechRecognition } from "../utils/speech";
import type { FillerEvent } from "../utils/speechAnalysis";
import {
  appendFinalChunk,
  mergeWithInterim,
  filterEventsByDuration,
} from "../utils/speechAnalysis";
import { analyzeTranscript } from "../utils/gemini";

const LONG_PAUSE_SEC = 3;

export interface SpeechSessionSnapshot {
  transcript: string;
  fillerCount: number;
  fillerTimeline: FillerEvent[];
  pauseEvents: number[];
}

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [fillerCount, setFillerCount] = useState(0);
  const [fillerTimeline, setFillerTimeline] = useState<FillerEvent[]>([]);
  const [pauseEvents, setPauseEvents] = useState<number[]>([]);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionSnapshot, setSessionSnapshot] = useState<SpeechSessionSnapshot | null>(null);

  const acceptingRef = useRef(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTextRef = useRef("");
  const lastFinalAtRef = useRef(0);
  const timelineRef = useRef<FillerEvent[]>([]);
  const pausesRef = useRef<number[]>([]);
  const getElapsedRef = useRef<(() => number) | undefined>(undefined);
  const maxDurationRef = useRef(120);

  const syncFromRefs = useCallback(() => {
    const combined = finalTextRef.current.trim();
    setTranscript(combined);
    setFillerCount(countFillerWords(combined));
    setFillerTimeline([...timelineRef.current]);
    setPauseEvents([...pausesRef.current]);
  }, []);

  const startLiveRecognition = useCallback(
    (getElapsed?: () => number, maxDurationSeconds = 120) => {
      const recognition = getSpeechRecognition();
      if (!recognition) return false;

      acceptingRef.current = true;
      getElapsedRef.current = getElapsed;
      maxDurationRef.current = maxDurationSeconds;
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      finalTextRef.current = "";
      lastFinalAtRef.current = Date.now();
      timelineRef.current = [];
      pausesRef.current = [];
      setFillerTimeline([]);
      setPauseEvents([]);
      setSessionSnapshot(null);

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (!acceptingRef.current) return;

        let interim = "";
        const now = Date.now();
        const elapsed = () => {
          const raw = Math.max(0, Math.round(getElapsedRef.current?.() ?? 0));
          return Math.min(raw, maxDurationRef.current);
        };

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            const gapSec = (now - lastFinalAtRef.current) / 1000;
            if (gapSec >= LONG_PAUSE_SEC && finalTextRef.current.length > 0) {
              pausesRef.current.push(elapsed());
            }
            lastFinalAtRef.current = now;

            finalTextRef.current = appendFinalChunk(finalTextRef.current, text);

            for (const word of findFillersInChunk(text)) {
              timelineRef.current.push({ second: elapsed(), word });
            }
          } else {
            interim += text;
          }
        }

        const combined = mergeWithInterim(finalTextRef.current, interim).trim();
        if (combined) finalTextRef.current = combined;
        syncFromRefs();
      };

      recognition.onerror = () => {
        if (acceptingRef.current) setIsListening(false);
      };

      recognition.onend = () => {
        if (acceptingRef.current) setIsListening(false);
      };

      recognition.start();
      setIsListening(true);
      setTranscript("");
      setFillerCount(0);
      return true;
    },
    [syncFromRefs]
  );

  const finalizeSession = useCallback((): SpeechSessionSnapshot => {
    acceptingRef.current = false;

    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      try {
        recognition.abort();
      } catch {
        try {
          recognition.stop();
        } catch {
          /* already stopped */
        }
      }
      recognitionRef.current = null;
    }

    setIsListening(false);

    const duration = maxDurationRef.current;
    const snapshot: SpeechSessionSnapshot = {
      transcript: finalTextRef.current.trim(),
      fillerCount: countFillerWords(finalTextRef.current),
      fillerTimeline: filterEventsByDuration(timelineRef.current, duration),
      pauseEvents: filterEventsByDuration(
        pausesRef.current.map((s) => ({ second: s })),
        duration
      ).map((e) => e.second),
    };

    setSessionSnapshot(snapshot);
    setTranscript(snapshot.transcript);
    setFillerCount(snapshot.fillerCount);
    setFillerTimeline(snapshot.fillerTimeline);
    setPauseEvents(snapshot.pauseEvents);

    return snapshot;
  }, []);

  const stopRecognition = useCallback(() => {
    finalizeSession();
  }, [finalizeSession]);

  const analyzeWithAI = useCallback(async (text: string, theme: string, points: string[]) => {
    if (!text.trim()) return;
    if (!import.meta.env.VITE_GEMINI_API_KEY) return;

    setIsAnalyzing(true);
    setAiFeedback(null);
    try {
      const feedback = await analyzeTranscript(text, theme, points);
      setAiFeedback(feedback);
    } catch {
      setAiFeedback("Не удалось получить анализ. Проверьте ключ API и ограничения в Google Cloud.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    acceptingRef.current = false;
    const recognition = recognitionRef.current;
    if (recognition) {
      try {
        recognition.abort();
      } catch {
        /* noop */
      }
      recognitionRef.current = null;
    }

    finalTextRef.current = "";
    timelineRef.current = [];
    pausesRef.current = [];
    lastFinalAtRef.current = 0;

    setTranscript("");
    setFillerCount(0);
    setFillerTimeline([]);
    setPauseEvents([]);
    setSessionSnapshot(null);
    setAiFeedback(null);
    setIsAnalyzing(false);
    setIsListening(false);
  }, []);

  return {
    transcript,
    isListening,
    fillerCount,
    fillerTimeline,
    pauseEvents,
    sessionSnapshot,
    aiFeedback,
    isAnalyzing,
    startLiveRecognition,
    stopRecognition,
    finalizeSession,
    analyzeWithAI,
    reset,
  };
}
