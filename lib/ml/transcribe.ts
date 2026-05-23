// Browser-native speech transcription via the Web Speech API.
// Chrome/Edge/Safari support this; Firefox does not. We degrade
// gracefully: when not available, transcript is null and the rest of
// the pipeline keeps working from acoustic features alone.
//
// In v2 this swaps to server-side Whisper (OpenAI or self-hosted) so we
// get language-agnostic transcription with prosody metadata. The
// SessionTranscriber contract stays the same.

"use client";

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<{
    isFinal: boolean;
    [index: number]: { transcript: string };
  }>;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

function getRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isTranscriptionAvailable(): boolean {
  return getRecognitionCtor() !== null;
}

export class SessionTranscriber {
  private rec: SpeechRecognitionInstance | null = null;
  private chunks: string[] = [];
  private running = false;

  start(language = "en-US") {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    this.chunks = [];
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = language;
    rec.onresult = (event) => {
      for (let i = 0; i < event.results.length; i += 1) {
        const r = event.results[i];
        if (r.isFinal) {
          this.chunks.push(r[0].transcript.trim());
        }
      }
    };
    rec.onerror = (e) => {
      // Aborting / no-speech errors are noisy; we just stop and rely
      // on the acoustic features for that task.
      if (e.error === "no-speech" || e.error === "aborted") return;
      console.warn("[glimpse] speech recognition error:", e.error);
    };
    rec.onend = () => {
      // Chrome stops automatically after a pause; restart if we're
      // supposed to still be listening.
      if (this.running) {
        try {
          rec.start();
        } catch {
          // Already running — ignore.
        }
      }
    };
    try {
      rec.start();
      this.rec = rec;
      this.running = true;
    } catch {
      this.rec = null;
    }
  }

  stop(): string | undefined {
    this.running = false;
    try {
      this.rec?.stop();
    } catch {
      // Ignore.
    }
    this.rec = null;
    const merged = this.chunks.join(" ").trim();
    return merged.length > 0 ? merged : undefined;
  }
}
