// Session video + features storage. Writes go to Supabase when the env is
// configured; otherwise stays local-only so the UX still works during a
// demo without a backend. Bucket: `session-videos`, folder structure
// `<user_id>/<session_id>/<task_id>.webm`. RLS policies in
// `supabase/schema.sql` scope reads/writes to the owner.

"use client";

import { supabase } from "@/lib/supabase/client";
import type { TaskFeatures } from "@/lib/ml/extractor";

export interface SessionRecord {
  id: string;
  userId: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
}

const VIDEO_BUCKET = "session-videos";

export async function startSession(): Promise<SessionRecord> {
  const id = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  let userId = "local";

  const sb = supabase();
  if (sb) {
    const { data } = await sb.auth.getUser();
    if (data.user) {
      userId = data.user.id;
      await sb.from("sessions").insert({
        id,
        user_id: userId,
        started_at: startedAt,
      });
    }
  }
  return { id, userId, startedAt, endedAt: "", durationSeconds: 0 };
}

export async function endSession(
  session: SessionRecord,
  durationSeconds: number,
): Promise<void> {
  const endedAt = new Date().toISOString();
  const sb = supabase();
  if (!sb || session.userId === "local") return;
  await sb
    .from("sessions")
    .update({ ended_at: endedAt, duration_seconds: durationSeconds })
    .eq("id", session.id);
}

export async function uploadTaskVideo(
  session: SessionRecord,
  taskId: string,
  blob: Blob,
): Promise<{ path: string | null; size: number }> {
  const sb = supabase();
  const size = blob.size;
  if (!sb || session.userId === "local") {
    return { path: null, size };
  }
  const path = `${session.userId}/${session.id}/${taskId}.webm`;
  const { error } = await sb.storage.from(VIDEO_BUCKET).upload(path, blob, {
    contentType: "video/webm",
    upsert: true,
  });
  if (error) {
    // Surface a soft error — the session continues. Storage may not be
    // provisioned yet, or RLS may need adjusting. Local features are
    // still saved below.
    console.warn("[glimpse] video upload failed:", error.message);
    return { path: null, size };
  }
  await sb.from("session_videos").insert({
    session_id: session.id,
    task_id: taskId,
    storage_path: path,
    size_bytes: size,
  });
  return { path, size };
}

export async function persistTaskFeatures(
  session: SessionRecord,
  features: TaskFeatures,
): Promise<void> {
  const sb = supabase();
  if (!sb || session.userId === "local") return;
  await sb.from("session_task_features").insert({
    session_id: session.id,
    task_id: features.taskId,
    features,
    frames_analysed: features.framesAnalysed,
    started_at: features.startedAt,
    ended_at: features.endedAt,
  });
}

// Convenience: generate a signed URL for sharing a single task clip.
export async function getSignedVideoUrl(
  storagePath: string,
  expiresInSeconds: number,
): Promise<string | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data, error } = await sb.storage
    .from(VIDEO_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);
  if (error) return null;
  return data.signedUrl;
}
