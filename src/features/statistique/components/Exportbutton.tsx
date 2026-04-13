import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import axiosInstance from '../../../services/axiosInstance';
import type { ExportFormat, ReportType,  SortDirection, StatFilter } from '../Statistiquetypes';

interface ExportButtonProps {
  widgetType:     ReportType;
  filter:         StatFilter;
  agentId?:       number;
  sortDirection?: SortDirection;
  chartRef?:      React.RefObject<HTMLDivElement | null>;
}

const FORMATS: { format: ExportFormat; label: string; icon: string }[] = [
  { format: 'PDF', label: 'PDF',   icon: '📕' },
  { format: 'XLS', label: 'Excel', icon: '📊' },
  { format: 'CSV', label: 'CSV',   icon: '📄' },
  { format: 'RTF', label: 'RTF',   icon: '📝' },
];

const ExportButton: React.FC<ExportButtonProps> = ({
  widgetType,
  filter,
  agentId,
  sortDirection,
  chartRef,
}) => {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState<ExportFormat | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleExport = async (format: ExportFormat) => {
    setOpen(false);
    setLoading(format);

    try {
      // 1. Capturer le graphique en base64 (PDF uniquement)
      let chartImage: string | undefined;
      if (format === 'PDF' && chartRef?.current) {
        try {
          const canvas = await html2canvas(chartRef.current, {
            scale: 1,               // scale=1 pour réduire la taille base64
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
          });
          chartImage = canvas.toDataURL('image/jpeg', 0.7); // JPEG 70% bien plus léger que PNG
        } catch (err) {
          console.warn('[Export] Capture graphique échouée:', err);
          // on continue sans image
        }
      }

      // 2. Construire le body
      const body = {
        reportType:    widgetType,
        format,
        filter: {
          ...filter,
          dateFrom: filter.dateFrom?.split('T')[0] ?? filter.dateFrom,
          dateTo:   filter.dateTo?.split('T')[0]   ?? filter.dateTo,
        },
        agentId:        agentId ?? 0,
        allSupervisors: filter.allSupervisors ?? true,
        sortDirection:  sortDirection ?? filter.sortDirection ?? 'Descending',
        chartImage,     // undefined sauf pour PDF
      };

      console.log('[Export] Envoi requête:', { format, reportType: widgetType });

      // 3. Appel axios avec responseType blob
      const response = await axiosInstance.post('/statistique/export', body, {
        responseType: 'blob',
        timeout: 60000, // 60s pour les gros exports
      });

      console.log('[Export] Réponse reçue:', {
        status:      response.status,
        contentType: response.headers['content-type'],
        size:        response.data?.size,
      });

      // 4. Vérifier que le blob n'est pas un message d'erreur JSON
      const blob = response.data as Blob;
      if (blob.size === 0) {
        console.error('[Export] Blob vide reçu');
        alert('Export échoué : fichier vide reçu du serveur.');
        return;
      }

      // Si le serveur a renvoyé du JSON (erreur), le lire et afficher
      if (blob.type.includes('application/json') || blob.type.includes('text/plain')) {
        const text = await blob.text();
        console.error('[Export] Erreur serveur:', text);
        alert(`Export échoué : ${text}`);
        return;
      }

      // 5. Déterminer l'extension
      const extMap: Record<ExportFormat, string> = {
        PDF: 'pdf',
        XLS: 'xls',
        CSV: 'csv',
        RTF: 'rtf',
      };
      const ext      = extMap[format];
      const date     = new Date().toISOString().split('T')[0];
      const filename = `${widgetType}_${date}.${ext}`;

      // 6. Déclencher le téléchargement
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href     = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      // Nettoyage après un court délai
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 500);

      console.log('[Export] Téléchargement déclenché:', filename);

    } catch (err: any) {
      console.error('[Export] Erreur:', err);

      // Tenter de lire le message d'erreur depuis le blob de réponse
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await (err.response.data as Blob).text();
          const parsed = JSON.parse(text);
          alert(`Export échoué : ${parsed.message ?? text}`);
        } catch {
          alert('Export échoué. Vérifiez la console pour plus de détails.');
        }
      } else {
        alert(`Export échoué : ${err?.message ?? 'Erreur inconnue'}`);
      }
    } finally {
      setLoading(null);
    }
  };

  const isLoading = loading !== null;

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => !isLoading && setOpen(o => !o)}
        disabled={isLoading}
        title="Exporter"
        style={{
          width: 30, height: 30,
          border: `1px solid ${isLoading ? '#d1d5db' : open ? '#534AB7' : '#e5e7eb'}`,
          borderRadius: 6,
          background: open ? '#EEEDFE' : '#fff',
          color: isLoading ? '#d1d5db' : open ? '#534AB7' : '#6b7280',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        {isLoading ? '⏳' : '⬇'}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 4,
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,.10)',
          zIndex: 1000,
          minWidth: 150,
          overflow: 'hidden',
        }}>
          {FORMATS.map(({ format, label, icon }) => (
            <button
              key={format}
              onClick={() => handleExport(format)}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 14px',
                background: 'transparent',
                border: 'none',
                borderBottom: format !== 'RTF' ? '1px solid #f3f4f6' : 'none',
                fontSize: 13,
                color: '#374151',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: 15 }}>{icon}</span>
              <span style={{ fontWeight: 500 }}>{label}</span>
              {format === 'PDF' && chartRef?.current && (
                <span style={{
                  marginLeft: 'auto', fontSize: 9, fontWeight: 600,
                  background: '#EEEDFE', color: '#534AB7',
                  borderRadius: 4, padding: '1px 5px',
                }}>
                  + graphique
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExportButton;