import { useCallback, useRef, useState } from "react";
import { countFillerWords, findFillersInChunk, getSpeechRecognition } from "../utils/speech";
import type { FillerEvent } from "../utils/speechAnalysis";
import {
  mergeWithInterim,
  filterEventsByDuration,
  prepareTranscriptForAnalysis,
} from "../utils/speechAnalysis";

const LONG_PAUSE_SEC = 3;

export interface SpeechSessionSnapshot {
  transcript: string;
  fillerCount: number;
  fillerTimeline: FillerEvent[];
  pauseEvents: number[];
}

function rebuildTranscriptFromResults(event: SpeechRecognitionEvent): {
  final: string;
  interim: string;
} {
  let final = "";
  let interim = "";

  for (let i = 0; i < event.results.length; i++) {
    const text = event.results[i][0].transcript;
    if (event.results[i].isFinal) {
      final += text;
    } else {
      interim += text;
    }
  }

  return {
    final: final.replace(/\s+/g, " ").trim(),
    interim: interim.replace(/\s+/g, " ").trim(),
  };
}

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [fillerCount, setFillerCount] = useState(0);
  const [fillerTimeline, setFillerTimeline] = useState<FillerEvent[]>([]);
  const [pauseEvents, setPauseEvents] = useState<number[]>([]);
  const [sessionSnapshot, setSessionSnapshot] = useState<SpeechSessionSnapshot | null>(null);
  const [isSupported] = useState(() => !!getSpeechRecognition());

  const acceptingRef = useRef(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTextRef = useRef("");
  const interimTextRef = useRef("");
  const lastFinalAtRef = useRef(0);
  const timelineRef = useRef<FillerEvent[]>([]);
  const pausesRef = useRef<number[]>([]);
  const getElapsedRef = useRef<(() => number) | undefined>(undefined);
  const maxDurationRef = useRef(120);
  const restartingRef = useRef(false);

  const syncLiveDisplay = useCallback(() => {
    const display = mergeWithInterim(finalTextRef.current, interimTextRef.current).trim();
    setTranscript(display);
    setFillerCount(countFillerWords(display));
    setFillerTimeline([...timelineRef.current]);
    setPauseEvents([...pausesRef.current]);
  }, []);

  const attachRecognitionHandlers = useCallback(
    (recognition: SpeechRecognition) => {
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (!acceptingRef.current) return;

        const now = Date.now();
        const elapsed = () => {
          const raw = Math.max(0, Math.round(getElapsedRef.current?.() ?? 0));
          return Math.min(raw, maxDurationRef.current);
        };

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (!event.results[i].isFinal) continue;
          const text = event.results[i][0].transcript;
          const gapSec = (now - lastFinalAtRef.current) / 1000;
          if (gapSec >= LONG_PAUSE_SEC && finalTextRef.current.length > 0) {
            pausesRef.current.push(elapsed());
          }
          lastFinalAtRef.current = now;

          for (const word of findFillersInChunk(text)) {
            timelineRef.current.push({ second: elapsed(), word });
          }
        }

        const rebuilt = rebuildTranscriptFromResults(event);
        finalTextRef.current = rebuilt.final;
        interimTextRef.current = rebuilt.interim;
        syncLiveDisplay();
      };

      recognition.onerror = (event: Event) => {
        if (!acceptingRef.current) return;
        const code = (event as SpeechRecognitionErrorEvent).error;
        if (code === "no-speech" || code === "aborted") return;
        if (code === "not-allowed" || code === "service-not-allowed") {
          acceptingRef.current = false;
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (!acceptingRef.current) {
          setIsListening(false);
          return;
        }
        if (restartingRef.current) return;
        restartingRef.current = true;
        window.setTimeout(() => {
          restartingRef.current = false;
          if (!acceptingRef.current || !recognitionRef.current) return;
          try {
            recognitionRef.current.start();
            setIsListening(true);
          } catch {
            setIsListening(false);
          }
        }, 120);
      };
    },
    [syncLiveDisplay]
  );

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
      interimTextRef.current = "";
      lastFinalAtRef.current = Date.now();
      timelineRef.current = [];
      pausesRef.current = [];
      setFillerTimeline([]);
      setPauseEvents([]);
      setSessionSnapshot(null);

      attachRecognitionHandlers(recognition);

      try {
        recognition.start();
      } catch {
        return false;
      }

      setIsListening(true);
      setTranscript("");
      setFillerCount(0);
      return true;
    },
    [attachRecognitionHandlers]
  );

  const finalizeSession = useCallback((durationSeconds?: number): SpeechSessionSnapshot => {
    const merged = mergeWithInterim(finalTextRef.current, interimTextRef.current).trim();
    finalTextRef.current = merged;
    interimTextRef.current = "";

    acceptingRef.current = false;

    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      try {
        recognition.stop();
      } catch {
        try {
          recognition.abort();
        } catch {
          /* already stopped */
        }
      }
      recognitionRef.current = null;
    }

    setIsListening(false);

    const elapsedFallback = Math.max(
      1,
      Math.round(getElapsedRef.current?.() ?? maxDurationRef.current)
    );
    const duration =
      durationSeconds != null && durationSeconds > 0
        ? Math.round(durationSeconds)
        : Math.min(elapsedFallback, maxDurationRef.current);

    const cleanedTranscript = prepareTranscriptForAnalysis(merged, duration);

    const snapshot: SpeechSessionSnapshot = {
      transcript: cleanedTranscript || merged,
      fillerCount: countFillerWords(cleanedTranscript || merged),
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

  const reset = useCallback(() => {
    acceptingRef.current = false;
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      try {
        recognition.abort();
      } catch {
        /* noop */
      }
      recognitionRef.current = null;
    }

    finalTextRef.current = "";
    interimTextRef.current = "";
    timelineRef.current = [];
    pausesRef.current = [];
    lastFinalAtRef.current = 0;

    setTranscript("");
    setFillerCount(0);
    setFillerTimeline([]);
    setPauseEvents([]);
    setSessionSnapshot(null);
    setIsListening(false);
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    fillerCount,
    fillerTimeline,
    pauseEvents,
    sessionSnapshot,
    startLiveRecognition,
    stopRecognition,
    finalizeSession,
    reset,
  };
};
