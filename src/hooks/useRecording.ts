import { useEffect, useRef, useState } from "react";
import type { Monologue, RubricAnswers } from "../types";
import { triggerDownload } from "../utils/download";

export function useRecording(
  onComplete: (data: {
    blob: Blob;
    url: string;
    rubric: RubricAnswers;
    checkedPoints: Record<number, boolean>;
    durationSeconds: number;
    mimeType: string;
  }) => void
) {
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown");
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(120);
  const [checkedPoints, setCheckedPoints] = useState<Record<number, boolean>>({});

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef("audio/webm");
  const activeMonologueRef = useRef<Monologue | null>(null);
  const recordingSecondsRef = useRef(120);
  const checkedPointsRef = useRef<Record<number, boolean>>({});

  useEffect(() => {
    recordingSecondsRef.current = recordingSeconds;
  }, [recordingSeconds]);

  useEffect(() => {
    checkedPointsRef.current = checkedPoints;
  }, [checkedPoints]);

  useEffect(() => {
    checkPermissionStatus();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const checkPermissionStatus = async () => {
    try {
      if (navigator.permissions?.query) {
        const result = await navigator.permissions.query({ name: "microphone" as PermissionName });
        setMicPermission(result.state);
        result.onchange = () => setMicPermission(result.state);
      } else {
        setMicPermission("prompt");
      }
    } catch {
      setMicPermission("prompt");
    }
  };

  const requestMicAccess = async (): Promise<boolean> => {
    try {
      setMicPermissionError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission("granted");
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to access microphone.";
      setMicPermission("denied");
      setMicPermissionError(message);
      return false;
    }
  };

  const startRecording = async (monologue: Monologue) => {
    try {
      setMicPermissionError(null);
      activeMonologueRef.current = monologue;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let selectedMimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        if (MediaRecorder.isTypeSupported("audio/ogg")) selectedMimeType = "audio/ogg";
        else if (MediaRecorder.isTypeSupported("audio/mp4")) selectedMimeType = "audio/mp4";
        else selectedMimeType = "";
      }
      mimeTypeRef.current = selectedMimeType || "audio/webm";

      const options = selectedMimeType ? { mimeType: selectedMimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data?.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setRecordingBlob(audioBlob);

        const rubric: RubricAnswers = {
          coveredAllPoints:
            Object.values(checkedPointsRef.current).filter(Boolean).length === monologue.points.length,
          fluencyFillerWords: false,
          introOutroClear: false,
          underGrammarLimit: false,
          timeOk: recordingSecondsRef.current > 0 && recordingSecondsRef.current < 110,
        };

        if (monologue) triggerDownload(audioBlob, monologue);

        onComplete({
          blob: audioBlob,
          url,
          rubric,
          checkedPoints: { ...checkedPointsRef.current },
          durationSeconds: Math.max(1, 120 - recordingSecondsRef.current),
          mimeType: mimeTypeRef.current,
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(120);
      setCheckedPoints({});
      checkedPointsRef.current = {};
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Recording failed.";
      setMicPermission("denied");
      setMicPermissionError(message);
      throw err;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
  };

  const resetRecording = () => {
    setAudioUrl(null);
    setRecordingBlob(null);
    setCheckedPoints({});
    setRecordingSeconds(120);
    setIsRecording(false);
  };

  const cleanup = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
    resetRecording();
  };

  return {
    micPermission,
    micPermissionError,
    isRecording,
    audioUrl,
    recordingBlob,
    recordingSeconds,
    setRecordingSeconds,
    checkedPoints,
    setCheckedPoints,
    requestMicAccess,
    startRecording,
    stopRecording,
    resetRecording,
    cleanup,
  };
}
