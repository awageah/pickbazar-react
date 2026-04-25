import { useState, useRef } from 'react';
import Card from '@/components/common/card';
import { DownloadIcon } from '@/components/icons/download-icon';
import { UploadIcon } from '@/components/icons/upload-icon';
import { useModalState } from '@/components/ui/modal/modal.context';
import { useTranslation } from 'next-i18next';
import Button from '@/components/ui/button';
import Alert from '@/components/ui/alert';
import { useImportProductsMutation } from '@/data/product';
import { ImportRowError } from '@/types';

const MAX_IMPORT_ROWS = 1000;
const API_BASE = process.env.NEXT_PUBLIC_REST_API_ENDPOINT ?? '';

const ExportImportView = () => {
  const { data: shopId } = useModalState();
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rowErrors, setRowErrors] = useState<ImportRowError[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  const { mutate: importProducts, isLoading } = useImportProductsMutation();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setRowErrors([]);
    setSuccessMsg('');

    importProducts(file, {
      onSuccess: (result) => {
        setSuccessMsg(`Imported ${result.imported} products.`);
        if (result.errors?.length) setRowErrors(result.errors);
      },
      onError: () => {
        // Global toast shown by hook; clear file input so user can retry.
      },
      onSettled: () => {
        if (fileRef.current) fileRef.current.value = '';
      },
    });
  }

  const exportUrl = shopId
    ? `${API_BASE}/products/export?shopId=${shopId}`
    : `${API_BASE}/products/export`;

  const templateUrl = `${API_BASE}/products/import-template`;

  return (
    <Card className="flex min-h-screen flex-col md:min-h-0">
      <div className="mb-5 w-full">
        <h1 className="text-lg font-semibold text-heading">
          {t('common:text-export-import')}
        </h1>
        <p className="mt-1 text-sm text-body">
          CSV import is capped at <strong>{MAX_IMPORT_ROWS} rows</strong> per
          file. Rows beyond that limit are silently ignored by the server.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
        {/* Import */}
        <label className="flex h-36 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-border-base p-5 hover:border-accent focus-within:border-accent-400 focus-within:outline-none">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          <UploadIcon className="w-10 text-muted-light" />
          <span className="mt-4 text-center text-sm font-semibold text-accent">
            {isLoading ? t('common:text-loading') : t('common:text-import-products')}
          </span>
        </label>

        {/* Export */}
        <a
          href={exportUrl}
          target="_blank"
          rel="noreferrer"
          className="flex h-36 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-border-base p-5 focus:border-accent-400 focus:outline-none"
        >
          <DownloadIcon className="w-10 text-muted-light" />
          <span className="mt-4 text-center text-sm font-semibold text-accent">
            {t('common:text-export-products')}
          </span>
        </a>

        {/* Template */}
        <a
          href={templateUrl}
          target="_blank"
          rel="noreferrer"
          className="flex h-36 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-border-base p-5 focus:border-accent-400 focus:outline-none"
        >
          <DownloadIcon className="w-10 text-muted-light" />
          <span className="mt-4 text-center text-sm font-semibold text-accent">
            {t('common:text-download-template')}
          </span>
        </a>
      </div>

      {successMsg && (
        <Alert
          message={successMsg}
          variant="success"
          closeable
          className="mt-5"
          onClose={() => setSuccessMsg('')}
        />
      )}

      {rowErrors.length > 0 && (
        <div className="mt-5">
          <h2 className="mb-2 text-sm font-semibold text-red-500">
            Import errors ({rowErrors.length} rows):
          </h2>
          <ul className="max-h-40 overflow-y-auto rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700 space-y-1">
            {rowErrors.map((e, i) => (
              <li key={i}>
                Row {e.row} — <strong>{e.field}</strong>: {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default ExportImportView;
