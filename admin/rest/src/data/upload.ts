/**
 * A4 — Wire the upload mutation to Cloudinary (direct browser upload).
 *
 * The existing `Uploader` component calls `useUploadMutation` on drop.
 * Previously it posted to `/attachments` (multipart). Kolshi has no file
 * hosting endpoint, so we redirect all uploads through the Cloudinary
 * unsigned preset configured by NEXT_PUBLIC_CLOUDINARY_*.
 *
 * The mutation returns an array of Attachment-shaped objects so that
 * the Uploader component (which expects `{ thumbnail, original, id }`) keeps
 * working without modification.
 */
import { useMutation } from 'react-query';
import { uploadFilesToCloudinary } from '@/utils/cloudinary';
import type { Attachment } from '@/types';

export const useUploadMutation = () =>
  useMutation(async (files: File[]): Promise<Attachment[]> => {
    const results = await uploadFilesToCloudinary(files);
    return results.map((r) => ({
      id: r.public_id,
      thumbnail: r.secure_url,
      original: r.secure_url,
    }));
  });
