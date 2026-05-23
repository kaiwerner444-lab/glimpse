"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraPreviewProps {
  enabled: boolean;
  audio: boolean;
  video: boolean;
  onStreamReady?: (stream: MediaStream | null) => void;
  className?: string;
}

// Renders a small mirror-style camera preview in the corner so the user
// can see what's being captured. Mic/video are gated by props so we don't
// hold devices longer than needed. The stream is *not* recorded to disk
// in v1 — feature extraction will replace this in v2.
export function CameraPreview({
  enabled,
  audio,
  video,
  onStreamReady,
  className,
}: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!enabled) {
        stop();
        return;
      }
      if (!audio && !video) {
        stop();
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio,
          video: video ? { facingMode: "user" } : false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current && video) {
          videoRef.current.srcObject = stream;
        }
        setGranted(true);
        setError(null);
        onStreamReady?.(stream);
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Could not access camera or mic";
        setError(msg);
        setGranted(false);
        onStreamReady?.(null);
      }
    }
    function stop() {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setGranted(false);
      onStreamReady?.(null);
    }
    start();
    return () => {
      cancelled = true;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, audio, video]);

  if (!enabled) return null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-black/10 bg-ink/95 shadow-card",
        className,
      )}
    >
      {video ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          // Mirror the preview so it feels like looking into a mirror.
          className="block w-full h-full object-cover scale-x-[-1]"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/70 text-sm p-4 text-center">
          Audio-only baseline
        </div>
      )}

      {/* Status chips */}
      <div className="absolute top-2 left-2 flex gap-1.5">
        {granted && (audio || video) ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-alert/90 text-white text-[10px] uppercase tracking-wider px-2 py-0.5 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Capturing
          </span>
        ) : null}
      </div>
      <div className="absolute bottom-2 left-2 flex gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full text-[10px] uppercase tracking-wider px-2 py-0.5 font-medium",
            audio && granted
              ? "bg-white/90 text-ink"
              : "bg-black/40 text-white/70",
          )}
        >
          {audio && granted ? (
            <Mic className="h-2.5 w-2.5" />
          ) : (
            <MicOff className="h-2.5 w-2.5" />
          )}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full text-[10px] uppercase tracking-wider px-2 py-0.5 font-medium",
            video && granted
              ? "bg-white/90 text-ink"
              : "bg-black/40 text-white/70",
          )}
        >
          {video && granted ? (
            <Video className="h-2.5 w-2.5" />
          ) : (
            <VideoOff className="h-2.5 w-2.5" />
          )}
        </span>
      </div>

      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-ink/80 text-white text-xs p-4 text-center">
          {error}
        </div>
      ) : null}
    </div>
  );
}
