import { createClient } from "@/lib/supabase/client";
import type { AttachmentType } from "@/lib/supabase/types";

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB — keep in sync with 0003_storage.sql
export const MAX_ATTACHMENT_BYTES = 50 * 1024 * 1024; // 50 MB — keep in sync with 0003_storage.sql

const AVATAR_MIME_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
const ATTACHMENT_IMAGE_MIME_TYPES = AVATAR_MIME_TYPES;
const ATTACHMENT_VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
  return `${(bytes / 1024).toFixed(0)}KB`;
}

export class FileValidationError extends Error {}

export function validateAvatarFile(file: File) {
  if (!AVATAR_MIME_TYPES.includes(file.type)) {
    throw new FileValidationError("Avatars must be a PNG, JPEG, GIF, or WebP image.");
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new FileValidationError(`Avatars must be ${formatBytes(MAX_AVATAR_BYTES)} or smaller.`);
  }
}

export function attachmentTypeFor(file: File): AttachmentType {
  if (ATTACHMENT_IMAGE_MIME_TYPES.includes(file.type)) return "image";
  if (ATTACHMENT_VIDEO_MIME_TYPES.includes(file.type)) return "video";
  throw new FileValidationError(
    "Attachments must be an image (PNG, JPEG, GIF, WebP) or a video (MP4, WebM, MOV)."
  );
}

export function validateAttachmentFile(file: File) {
  attachmentTypeFor(file);
  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new FileValidationError(
      `Attachments must be ${formatBytes(MAX_ATTACHMENT_BYTES)} or smaller.`
    );
  }
}

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  return file.type.split("/").pop() ?? "bin";
}

/** Uploads to the public `avatars` bucket at `{userId}/avatar.{ext}`, overwriting any previous avatar. */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  validateAvatarFile(file);

  const supabase = createClient();
  const path = `${userId}/avatar.${extensionFor(file)}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, cacheControl: "3600" });

  if (error) throw new FileValidationError(error.message);

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

/** Uploads to the public `attachments` bucket under the user's own folder. */
export async function uploadAttachment(
  userId: string,
  file: File
): Promise<{ url: string; type: AttachmentType }> {
  validateAttachmentFile(file);
  const type = attachmentTypeFor(file);

  const supabase = createClient();
  const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extensionFor(file)}`;

  const { error } = await supabase.storage
    .from("attachments")
    .upload(path, file, { cacheControl: "3600" });

  if (error) throw new FileValidationError(error.message);

  const { data } = supabase.storage.from("attachments").getPublicUrl(path);
  return { url: data.publicUrl, type };
}
