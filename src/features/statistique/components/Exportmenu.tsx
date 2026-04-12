import React, { useState, useRef, useEffect } from 'react';
import type { ExportFormat } from '../Statistiquetypes';

interface ExportMenuProps {
  onExport: (format: ExportFormat) => void;
  loading: boolean;
}

const FORMATS: { format: ExportFormat; label: string; icon: string }[] = [
  { format: 'XLS', label: 'Excel',  icon: '📊' },
  { format: 'CSV', label: 'CSV',    icon: '📄' },
  { format: 'PDF', label: 'PDF',    icon: '📕' },
  { format: 'RTF', label: 'RTF',    icon: '📝' },
];

const ExportMenu: React.FC<ExportMenuProps> = ({ onExport, loading }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="export-menu" ref={ref}>
      <button
        className="btn-export"
        onClick={() => setOpen(o => !o)}
        disabled={loading}
      >
        {loading ? 'Exporting…' : '⬇ Export'}
      </button>

      {open && (
        <div className="export-dropdown">
          {FORMATS.map(({ format, label, icon }) => (
            <button
              key={format}
              className="export-option"
              onClick={() => { onExport(format); setOpen(false); }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExportMenu;