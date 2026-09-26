import crypto from "crypto";

export function getTranscriptHash(transcript: string): string {
  return crypto.createHash("sha256").update(transcript.trim()).digest("hex");
}