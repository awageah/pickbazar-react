import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';
import { UploadIcon } from '@/components/icons/upload-icon';
import Spinner from '@/components/ui/loaders/spinner/spinner';
import { useCloudinaryUpload } from '@/framework/utils/cloudinary';

/**
 * Kolshi S6 — generic image uploader.
 *
 * Kolshi has no multipart upload endpoint; clients must POST directly to
 * Cloudinary (see `framework/utils/cloudinary.ts`). The uploader now
 * performs that upload in-place and feeds the resulting `secure_url`
 * back to the form as `{ original, thumbnail }` attachments so existing
 * payload builders (e.g. `toKolshiReviewPayload`) pick up the URL
 * unchanged.
 *
 * The previous `useUploads` flow (which went through a rejected
 * `client.settings.upload` stub) is removed.
 */
type Attachment = {
  id?: string | number;
  original?: string;
  thumbnail?: string;
  [key: string]: unknown;
};

interface UploaderProps {
  onChange: (attachments: Attachment[]) => void;
  value?: Attachment[] | null;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  multiple?: boolean;
  /** Cloudinary folder, defaults to `kolshi/uploads`. */
  folder?: string;
}

export default function Uploader({
  onChange,
  value,
  name,
  onBlur,
  multiple = false,
  folder = 'kolshi/uploads',
}: UploaderProps) {
  const { t } = useTranslation('common');
  const initial = useMemo<Attachment[]>(
    () => (Array.isArray(value) ? value.filter(Boolean) : []),
    [value],
  );
  const [attachments, setAttachments] = useState<Attachment[]>(initial);

  // Keep the controlled value in sync when the form resets externally.
  useEffect(() => {
    setAttachments(initial);
  }, [initial]);

  const { mutate: uploadToCloudinary, isLoading } = useCloudinaryUpload({
    folder,
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      uploadToCloudinary(acceptedFiles, {
        onSuccess: (results) => {
          const uploaded: Attachment[] = results.map((r) => ({
            id: r.public_id,
            original: r.secure_url,
            thumbnail: r.secure_url,
          }));
          const next = multiple ? [...attachments, ...uploaded] : uploaded;
          setAttachments(next);
          onChange(next);
        },
        onError: (err) => {
          toast.error(
            err?.message ?? (t('error-upload-failed') as unknown as string),
          );
        },
      });
    },
    [attachments, multiple, onChange, t, uploadToCloudinary],
  );

  const { getRootProps, getInputProps } = useDropzone({
    //@ts-ignore
    accept: 'image/*',
    multiple,
    onDrop,
    disabled: isLoading,
  });

  const thumbs = attachments.map((file, idx) => {
    const src = (file?.thumbnail ?? file?.original) as string | undefined;
    if (!src) return null;
    return (
      <div
        className="relative inline-flex flex-col mt-2 overflow-hidden border rounded border-border-100 ltr:mr-2 rtl:ml-2"
        key={`${file.id ?? idx}-${idx}`}
      >
        <div className="flex items-center justify-center w-16 h-16 min-w-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={`upload-${idx}`} />
        </div>
      </div>
    );
  });

  return (
    <section className="upload">
      <div
        {...getRootProps({
          className:
            'border-dashed border-2 border-border-base h-36 rounded flex flex-col justify-center items-center cursor-pointer focus:border-accent-400 focus:outline-none',
        })}
      >
        <input
          {...getInputProps({
            name,
            onBlur,
          })}
        />
        <UploadIcon className="text-muted-light" />
        <p className="mt-4 text-sm text-center text-body">
          <span className="font-semibold text-accent">
            {t('text-upload-highlight')}
          </span>{' '}
          {t('text-upload-message')} <br />
          <span className="text-xs text-body">{t('text-img-format')}</span>
        </p>
      </div>

      <aside className="flex flex-wrap mt-2">
        {thumbs}
        {isLoading && (
          <div className="flex items-center h-16 mt-2 ltr:ml-2 rtl:mr-2">
            <Spinner
              text={t('text-loading') as unknown as string}
              simple={true}
              className="w-6 h-6"
            />
          </div>
        )}
      </aside>
    </section>
  );
}
