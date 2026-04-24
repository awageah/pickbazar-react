import { useMutation } from 'react-query';

/**
 * Cloudinary client-side upload.
 *
 * Kolshi's backend stores URL strings only — it does not accept multipart
 * uploads. Every former `POST /attachments` call (avatars, product images,
 * shop logos, category icons) is replaced with a direct POST to Cloudinary's
 * unsigned upload endpoint; the returned `secure_url` is then persisted
 * through the relevant Kolshi `PUT/POST`.
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
  /** Optional folder (whitelisted by the preset), e.g. `kolshi/products`. */
  folder?: string;
}

async function uploadOne(
  file: File,
  folder?: string,
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary env is missing — set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET (see ENV_SETUP.md).',
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
 * Returns the parsed upload results in the same order as the input array.
 */
export function useCloudinaryUpload(options: UseCloudinaryUploadOptions = {}) {
  return useMutation<CloudinaryUploadResult[], Error, File[]>(
    (files) => Promise.all(files.map((f) => uploadOne(f, options.folder))),
  );
}

/**
 * Imperative helper for call sites that do not want the React-Query wrapper
 * (e.g. one-shot uploads inside event handlers).
 */
export async function uploadFilesToCloudinary(
  files: File[],
  options: UseCloudinaryUploadOptions = {},
): Promise<CloudinaryUploadResult[]> {
  return Promise.all(files.map((f) => uploadOne(f, options.folder)));
}
