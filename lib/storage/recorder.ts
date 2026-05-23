// Lightweight wrapper around MediaRecorder. One instance per task; we
// stop, collect chunks, and hand back a single Blob ready to upload.

"use client";

interface RecorderOptions {
  stream: MediaStream;
  mimeType?: string;
}

export class TaskRecorder {
  private recorder: MediaRecorder | null = null;
  private chunks: BlobPart[] = [];
  private mimeType: string;

  constructor(options: RecorderOptions) {
    this.mimeType = pickSupportedMime(options.mimeType);
    try {
      this.recorder = new MediaRecorder(options.stream, {
        mimeType: this.mimeType,
        videoBitsPerSecond: 1_200_000,
        audioBitsPerSecond: 96_000,
      });
    } catch (err) {
      console.warn("[glimpse] MediaRecorder unsupported:", err);
      this.recorder = null;
    }
    if (this.recorder) {
      this.recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) this.chunks.push(e.data);
      };
    }
  }

  start() {
    this.chunks = [];
    this.recorder?.start(1000);
  }

  async stop(): Promise<Blob | null> {
    if (!this.recorder) return null;
    return new Promise((resolve) => {
      this.recorder!.onstop = () => {
        resolve(new Blob(this.chunks, { type: this.mimeType }));
      };
      this.recorder!.stop();
    });
  }
}

function pickSupportedMime(preferred?: string): string {
  const candidates = [
    preferred,
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ].filter(Boolean) as string[];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) {
      return c;
    }
  }
  return "video/webm";
}
