import { useCallback, useRef, useState } from "react";
import { countFillerWords, findFillersInChunk, getSpeechRecognition } from "../utils/speech";
import type { FillerEvent } from "../utils/speechAnalysis";
import { analyzeTranscript } from "../utils/gemini";

const LONG_PAUSE_SEC = 3;

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [fillerCount, setFillerCount] = useState(0);
  const [fillerTimeline, setFillerTimeline] = useState<FillerEvent[]>([]);
  const [pauseEvents, setPauseEvents] = useState<number[]>([]);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const lastFinalAtRef = useRef(0);
  const timelineRef = useRef<FillerEvent[]>([]);
  const pausesRef = useRef<number[]>([]);

  const startLiveRecognition = useCallback((getElapsed?: () => number) => {
    const recognition = getSpeechRecognition();
    if (!recognition) return false;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalText = "";
    lastFinalAtRef.current = Date.now();
    timelineRef.current = [];
    pausesRef.current = [];
    setFillerTimeline([]);
    setPauseEvents([]);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      const now = Date.now();
      const elapsed = () => Math.max(0, Math.round(getElapsed?.() ?? (now - lastFinalAtRef.current) / 1000));

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          const gapSec = (now - lastFinalAtRef.current) / 1000;
          if (gapSec >= LONG_PAUSE_SEC && finalText.length > 0) {
            pausesRef.current.push(elapsed());
            setPauseEvents([...pausesRef.current]);
          }
          lastFinalAtRef.current = now;

          for (const word of findFillersInChunk(text)) {
            timelineRef.current.push({ second: elapsed(), word });
          }
          setFillerTimeline([...timelineRef.current]);

          finalText += text + " ";
        } else {
          interim += text;
        }
      }
      const combined = (finalText + interim).trim();
      setTranscript(combined);
      setFillerCount(countFillerWords(combined));
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
    setTranscript("");
    return true;
  }, []);

  const stopRecognition = useCallback(() => {
    const recognition = getSpeechRecognition();
    if (recognition) {
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
    }
    setIsListening(false);
  }, []);

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
    setTranscript("");
    setFillerCount(0);
    setFillerTimeline([]);
    setPauseEvents([]);
    setAiFeedback(null);
    setIsAnalyzing(false);
    timelineRef.current = [];
    pausesRef.current = [];
    lastFinalAtRef.current = 0;
  }, []);

  return {
    transcript,
    isListening,
    fillerCount,
    fillerTimeline,
    pauseEvents,
    aiFeedback,
    isAnalyzing,
    startLiveRecognition,
    stopRecognition,
    analyzeWithAI,
    reset,
    setTranscript,
    setFillerCount,
  };
}
