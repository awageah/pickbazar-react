import { useMutation } from 'react-query';

/**
 * Cloudinary client-side upload for the admin console.
 *
 * Kolshi's backend stores image URL strings only — it does not accept
 * multipart uploads via `/attachments`. Every former upload call (shop logos,
 * cover images, product images, category icons, avatars) is replaced with a
 * direct POST to Cloudinary's unsigned upload endpoint; the returned
 * `secure_url` is then persisted through the relevant Kolshi PUT/POST.
 *
 * Uses `fetch` rather than the app's axios instance so the `Authorization`
 * and `Accept-Language` interceptors cannot pollute the request (Cloudinary
 * rejects arbitrary `Bearer` headers with a 401).
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  resource_type: 'image' | 'video' | 'raw';
  bytes: number;
  format: string;
  width?: number;
  height?: number;
}

export interface UseCloudinaryUploadOptions {
  /** Optional folder (must be whitelisted in the Cloudinary preset). */
  folder?: string;
}

async function uploadOne(
  file: File,
  folder?: string,
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary env is missing — set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and ' +
        'NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in admin/.env.local (see ENV_SETUP.md §3).',
    );
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);
  if (folder) form.append('folder', folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: form },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed (${res.status}): ${text}`);
  }

  return (await res.json()) as CloudinaryUploadResult;
}

/**
 * React-Query mutation hook for uploading one or more files to Cloudinary.
 * Returns upload results in the same order as the input array.
 */
export function useCloudinaryUpload(options: UseCloudinaryUploadOptions = {}) {
  return useMutation<CloudinaryUploadResult[], Error, File[]>(
    (files) => Promise.all(files.map((f) => uploadOne(f, options.folder))),
  );
}

/**
 * Imperative helper for upload call sites that do not want the React-Query
 * wrapper (e.g. one-shot uploads inside submit handlers).
 */
export async function uploadFilesToCloudinary(
  files: File[],
  options: UseCloudinaryUploadOptions = {},
): Promise<CloudinaryUploadResult[]> {
  return Promise.all(files.map((f) => uploadOne(f, options.folder)));
}
