"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

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

      <div className="absolute top-2 left-2 flex gap-1.5">
        {capturing ? (
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
