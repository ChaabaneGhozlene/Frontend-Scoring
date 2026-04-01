import { download, generateCsv, mkConfig } from 'export-to-csv';

// ── Interface interne pour l'appel fetchBlob ───────────────────────────────
export interface ExportBlobParams {
  dateDebut:     string;
  dateFin:       string;
  filterId?:     number;
  columnFilters: unknown[];   // ← unknown[] ici, cast fait en interne
  page:          number;
  pageSize:      number;
}

export const exportRows = <T extends object>(
  rows:     T[],
  filename = 'export',
) => {
  const config = mkConfig({
    fieldSeparator:   ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
    filename,
  });
  download(config)(generateCsv(config)(rows as never));
};

export const exportAll = async <T extends object>(params: {
  dateDebut?:     string | null;
  dateFin?:       string | null;
  filterId?:      string | number | null;
  columnFilters?: unknown[];
  records?:       T[];
  filename?:      string;
  fetchBlob?:     (p: ExportBlobParams) => Promise<Blob>;
}) => {
  const {
    dateDebut, dateFin, filterId, records,
    columnFilters = [],
    filename      = 'export',
    fetchBlob,
  } = params;

  const fallbackConfig = mkConfig({
    fieldSeparator:   ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
    filename,
  });

  if (!fetchBlob) {
    if (records?.length) {
      download(fallbackConfig)(generateCsv(fallbackConfig)(records as never));
    }
    return;
  }

  try {
    const filterIdNumber =
      filterId != null && !isNaN(Number(filterId))
        ? Number(filterId)
        : undefined;

    const blob = await fetchBlob({
      dateDebut:     dateDebut ?? '',
      dateFin:       dateFin   ?? '',
      filterId:      filterIdNumber,
      columnFilters: columnFilters,
      page:          1,
      pageSize:      99999,
    });

    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (err) {
    console.error('Export error:', err);
    if (records?.length) {
      download(fallbackConfig)(generateCsv(fallbackConfig)(records as never));
    }
  }
};