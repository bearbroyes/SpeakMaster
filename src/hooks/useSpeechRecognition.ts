import { useCallback, useState } from "react";
import { countFillerWords, getSpeechRecognition } from "../utils/speech";
import { analyzeTranscript } from "../utils/gemini";

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [fillerCount, setFillerCount] = useState(0);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const startLiveRecognition = useCallback(() => {
    const recognition = getSpeechRecognition();
    if (!recognition) return false;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalText = "";
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += text + " ";
        else interim += text;
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
    setAiFeedback(null);
    setIsAnalyzing(false);
  }, []);

  return {
    transcript,
    isListening,
    fillerCount,
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
