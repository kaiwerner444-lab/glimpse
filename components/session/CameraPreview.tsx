"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraPreviewProps {
  stream: MediaStream | null;
  audio: boolean;
  video: boolean;
  capturing: boolean;
  className?: string;
}

// Mirror-style preview tile. The owning component supplies the MediaStream
// (so feature extractors and recorders can share it). We just render.
export function CameraPreview({
  stream,
  audio,
  video,
  capturing,
  className,
}: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [micLevel, setMicLevel] = useState(0);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Live mic level meter — tells the user whether the mic is actually
  // hearing anything during a speech task. Sample at 30ms intervals;
  // share the existing audio tracks so we don't compete with the
  // feature extractor for the audio element.
  useEffect(() => {
    if (!stream || !audio) {
      setMicLevel(0);
      return;
    }
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;
    const Ctor =
      typeof window !== "undefined"
        ? (window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
        : null;
    if (!Ctor) return;
    const ctx = new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    const src = ctx.createMediaStreamSource(new MediaStream([audioTrack]));
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    src.connect(analyser);
    const buf = new Float32Array(analyser.fftSize);

    let raf = 0;
    const loop = () => {
      analyser.getFloatTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i += 1) sum += buf[i] * buf[i];
      const rms = Math.sqrt(sum / buf.length);
      // Map ~0..0.15 RMS into 0..1
      setMicLevel(Math.min(1, rms / 0.15));
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      src.disconnect();
      analyser.disconnect();
      void ctx.close();
    };
  }, [stream, audio]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-black/10 bg-ink/95 shadow-card",
        className,
      )}
    >
      {video && stream ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="block w-full h-full object-cover scale-x-[-1]"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/70 text-sm p-4 text-center">
          {stream ? "Audio-only baseline" : "Waiting for permissions"}
        </div>
      )}

      <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1.5">
        {capturing ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-alert/90 text-white text-[10px] uppercase tracking-wider px-2 py-0.5 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Capturing
          </span>
        ) : (
          <span />
        )}
        {audio && stream ? (
          <span
            className="inline-flex items-center gap-0.5 h-3"
            aria-label={`Mic level ${Math.round(micLevel * 100)}`}
          >
            {[0.2, 0.4, 0.6, 0.8, 1].map((threshold) => (
              <span
                key={threshold}
                className={cn(
                  "w-0.5 rounded-full transition-colors",
                  micLevel >= threshold ? "bg-success" : "bg-white/25",
                )}
                style={{ height: `${20 + threshold * 40}%` }}
              />
            ))}
          </span>
        ) : null}
      </div>
      <div className="absolute bottom-2 left-2 flex gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full text-[10px] uppercase tracking-wider px-2 py-0.5 font-medium",
            audio && stream
              ? "bg-white/90 text-ink"
              : "bg-black/40 text-white/70",
          )}
        >
          {audio && stream ? (
            <Mic className="h-2.5 w-2.5" />
          ) : (
            <MicOff className="h-2.5 w-2.5" />
          )}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full text-[10px] uppercase tracking-wider px-2 py-0.5 font-medium",
            video && stream
              ? "bg-white/90 text-ink"
              : "bg-black/40 text-white/70",
          )}
        >
          {video && stream ? (
            <Video className="h-2.5 w-2.5" />
          ) : (
            <VideoOff className="h-2.5 w-2.5" />
          )}
        </span>
      </div>
    </div>
  );
}
