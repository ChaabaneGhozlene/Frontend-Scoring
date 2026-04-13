import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export type ExportFormat = 'PDF' | 'XLS' | 'CSV' | 'RTF';

interface ExportOptions {
  format:      ExportFormat;
  title:       string;        // ex: "Agent Scores"
  dateFrom:    string;
  dateTo:      string;
  data:        Record<string, unknown>[];
  columns:     { key: string; header: string; format?: (v: any) => string }[];
  chartRef?:   HTMLElement | null;  // référence DOM du chart
}

// ─── Capture chart → base64 PNG ───────────────────────────────────────────────
async function captureChart(el: HTMLElement): Promise<string | null> {
  try {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(el, {
      scale:           2,
      backgroundColor: '#ffffff',
      useCORS:         true,
      logging:         false,
    });
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

// ─── PDF ──────────────────────────────────────────────────────────────────────
async function exportPDF(opts: ExportOptions) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  // En-tête
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(opts.title, 14, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Du ${opts.dateFrom}  au  ${opts.dateTo}`, 14, 23);
  doc.setTextColor(0);

  let cursorY = 30;

  // Chart (si disponible)
  if (opts.chartRef) {
    const imgData = await captureChart(opts.chartRef);
    if (imgData) {
      const imgW  = pageW - 28;
      const imgH  = imgW * 0.42;          // ratio 2.38:1
      doc.addImage(imgData, 'PNG', 14, cursorY, imgW, imgH);
      cursorY += imgH + 8;
    }
  }

  // Tableau
  const head = [opts.columns.map(c => c.header)];
  const body = opts.data.map(row =>
    opts.columns.map(c => {
      const v = row[c.key];
      return c.format ? c.format(v) : String(v ?? '');
    })
  );

  autoTable(doc, {
    head,
    body,
    startY:    cursorY,
    styles:    { fontSize: 8, cellPadding: 2 },
    headStyles:{ fillColor: [83, 74, 183], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 243, 255] },
    margin:    { left: 14, right: 14 },
  });

  doc.save(`${opts.title.replace(/\s+/g, '_')}_${opts.dateFrom}_${opts.dateTo}.pdf`);
}

// ─── XLS ──────────────────────────────────────────────────────────────────────
async function exportXLS(opts: ExportOptions) {
  const wb = XLSX.utils.book_new();

  // Feuille données
  const wsData = [
    opts.columns.map(c => c.header),
    ...opts.data.map(row =>
      opts.columns.map(c => {
        const v = row[c.key];
        return c.format ? c.format(v) : (v ?? '');
      })
    ),
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Données');

  // Feuille chart (image PNG si dispo)
  if (opts.chartRef) {
    const imgData = await captureChart(opts.chartRef);
    if (imgData) {
      const wsChart = XLSX.utils.aoa_to_sheet([['Chart']]);
      XLSX.utils.book_append_sheet(wb, wsChart, 'Graphique');

      // Encode l'image en base64 sans le préfixe data:...
      const base64 = imgData.split(',')[1];
      if (!(wb as any).Workbook) (wb as any).Workbook = {};
      // Injection via SheetJS Pro ou fallback : on embed via cellule
      // Pour SheetJS community edition : on ajoute l'image en commentaire visuel
      // Pour une vraie embed, utiliser xlsx-js-style ou exceljs (voir note)
      wsChart['A1'] = { v: 'Voir le graphique ci-dessous (image non supportée en mode communautaire)' };
    }
  }

  XLSX.writeFile(wb, `${opts.title.replace(/\s+/g, '_')}_${opts.dateFrom}_${opts.dateTo}.xlsx`);
}

// ─── CSV ──────────────────────────────────────────────────────────────────────
function exportCSV(opts: ExportOptions) {
  const sep   = ';';
  const lines = [
    opts.columns.map(c => `"${c.header}"`).join(sep),
    ...opts.data.map(row =>
      opts.columns.map(c => {
        const v = row[c.key];
        const s = c.format ? c.format(v) : String(v ?? '');
        return `"${s.replace(/"/g, '""')}"`;
      }).join(sep)
    ),
  ];
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${opts.title.replace(/\s+/g, '_')}_${opts.dateFrom}_${opts.dateTo}.csv`);
}

// ─── RTF ──────────────────────────────────────────────────────────────────────
function exportRTF(opts: ExportOptions) {
  const lines: string[] = [
    '{\\rtf1\\ansi\\deff0',
    `{\\b ${opts.title}\\b0}\\par`,
    `Du ${opts.dateFrom} au ${opts.dateTo}\\par\\par`,
    opts.columns.map(c => `{\\b ${c.header}\\b0}`).join('  |  ') + '\\par',
    '\\par',
  ];
  opts.data.forEach(row => {
    const line = opts.columns
      .map(c => {
        const v = row[c.key];
        return c.format ? c.format(v) : String(v ?? '');
      })
      .join('  |  ');
    lines.push(line + '\\par');
  });
  lines.push('}');
  const blob = new Blob([lines.join('\n')], { type: 'application/rtf' });
  triggerDownload(blob, `${opts.title.replace(/\s+/g, '_')}_${opts.dateFrom}_${opts.dateTo}.rtf`);
}

// ─── Trigger download ─────────────────────────────────────────────────────────
function triggerDownload(blob: Blob, filename: string) {
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Entry point ──────────────────────────────────────────────────────────────
export async function exportWidget(opts: ExportOptions): Promise<void> {
  switch (opts.format) {
    case 'PDF': return exportPDF(opts);
    case 'XLS': return exportXLS(opts);
    case 'CSV': return exportCSV(opts);
    case 'RTF': return exportRTF(opts);
  }
}