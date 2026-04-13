import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadConfigRequest, saveConfigRequest,
  toggleEditMode, addWidget, updateWidgetFilter,
} from './DashboardSlice';
import type { RootState } from '../../app/store';
import { WIDGET_REGISTRY } from './WidgetRegistry';
import type { ReportType } from './Statistiquetypes';
import GenericWidget from './GenericWidget';
import Toolbar from '../Toolbar';
import { pageWrap, pageHeader, headerLeft, gearIcon, pageTitle, pageCrumb } from '../Pagestyles';

// ✅ Fonction pour formater la date en YYYY-MM-DD sans décalage UTC
const formatLocalDate = (date: Date | null): string => {
  if (!date) {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// ✅ Fonction pour convertir une date en string ISO sans perdre le jour (retourne toujours string)
const toISODateString = (date: Date | null): string => {
  return formatLocalDate(date);
};

const DashboardBuilder: React.FC = () => {
  const dispatch = useDispatch();
  const { config, editMode, loading, saveLoading } = useSelector(
    (s: RootState) => s.dashboardBuilder
  );

  const today = new Date();
  const [startDate, setStartDate] = useState<Date | null>(today);
  const [endDate, setEndDate] = useState<Date | null>(today);
  
  // Utiliser des refs pour éviter les boucles infinies
  const isInitialized = useRef(false);
  const prevStartDateRef = useRef<string | null>(null);
  const prevEndDateRef = useRef<string | null>(null);

  // Charger la config une seule fois au montage
  useEffect(() => {
    dispatch(loadConfigRequest());
  }, [dispatch]);

  // ✅ Initialiser les dates des widgets une seule fois après chargement
  useEffect(() => {
    if (!config || isInitialized.current) return;
    
    console.log('🎯 Initialisation des dates des widgets');
    
    const startStr = toISODateString(startDate);
    const endStr = toISODateString(endDate);
    
    console.log('📅 Dates initiales formatées:', { startStr, endStr });
    
    config.widgets.forEach(w => {
      dispatch(updateWidgetFilter({
        id: w.id,
        filters: {
          ...w.filters,
          dateFrom: startStr,  // ✅ toujours string, jamais null
          dateTo: endStr,      // ✅ toujours string, jamais null
        },
      }));
    });
    
    isInitialized.current = true;
    prevStartDateRef.current = startStr;
    prevEndDateRef.current = endStr;
  }, [config, startDate, endDate, dispatch]);

  // ✅ Met à jour UNIQUEMENT quand les dates changent réellement
  useEffect(() => {
    if (!isInitialized.current || !config) return;
    
    const currentStart = toISODateString(startDate);
    const currentEnd = toISODateString(endDate);
    
    // Vérifier si les dates ont vraiment changé
    if (currentStart === prevStartDateRef.current && currentEnd === prevEndDateRef.current) {
      return;
    }
    
    console.log('📅 Mise à jour des dates globales:', {
      startDate: currentStart,
      endDate: currentEnd,
      widgetsCount: config.widgets.length
    });
    
    // Mettre à jour les refs
    prevStartDateRef.current = currentStart;
    prevEndDateRef.current = currentEnd;
    
    // Mettre à jour tous les widgets
    config.widgets.forEach(w => {
      dispatch(updateWidgetFilter({
        id: w.id,
        filters: {
          ...w.filters,
          dateFrom: currentStart,  // ✅ toujours string, jamais null
          dateTo: currentEnd,      // ✅ toujours string, jamais null
        },
      }));
    });
  }, [startDate, endDate, config, dispatch]);

  // ✅ Refresh manuel
  const handleRefresh = useCallback(() => {
    if (!config) return;
    
    const currentStart = toISODateString(startDate);
    const currentEnd = toISODateString(endDate);
    
    console.log('🔄 Refresh manuel forcé:', { currentStart, currentEnd });
    
    config.widgets.forEach(w => {
      dispatch(updateWidgetFilter({
        id: w.id,
        filters: {
          ...w.filters,
          dateFrom: currentStart,  // ✅ toujours string, jamais null
          dateTo: currentEnd,      // ✅ toujours string, jamais null
        },
      }));
    });
  }, [config, startDate, endDate, dispatch]);

  if (loading) return (
    <div style={pageWrap}>
      <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
        Chargement…
      </div>
    </div>
  );

  return (
    <div style={pageWrap}>
      <div style={pageHeader}>
        <div style={headerLeft}>
          <div style={gearIcon}>📊</div>
          <div>
            <div style={pageTitle}>Statistiques</div>
            <div style={pageCrumb}>Dashboard personnalisable</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => dispatch(toggleEditMode())}
            style={{
              padding: '7px 16px',
              background: editMode ? '#16a34a' : '#DC2626',
              color: '#fff', border: 'none', borderRadius: 6,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {editMode ? '✓ Terminer' : '✎ Personnaliser'}
          </button>

          {editMode && (
            <button
              disabled={saveLoading}
              onClick={() => dispatch(saveConfigRequest())}
              style={{
                padding: '7px 16px',
                background: saveLoading ? '#d1d5db' : '#DC2626',
                color: saveLoading ? '#9ca3af' : '#fff',
                border: 'none', borderRadius: 6,
                fontSize: 13, fontWeight: 600,
                cursor: saveLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {saveLoading ? 'Sauvegarde…' : '💾 Sauvegarder'}
            </button>
          )}
        </div>
      </div>

      <Toolbar
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onRefresh={handleRefresh}
      />

      {editMode && (
        <div style={{
          margin: '14px 24px', padding: 14, background: '#fff',
          border: '1px dashed #c4b5fd', borderRadius: 8,
        }}>
          <p style={{
            fontSize: 12, fontWeight: 700, color: '#7C3AED',
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10,
          }}>
            + Ajouter un widget
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.values(WIDGET_REGISTRY).map(def => (
              <button
                key={def.type}
                onClick={() => dispatch(addWidget({ widgetType: def.type as ReportType }))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', background: '#f5f3ff',
                  border: '1px solid #ddd6fe', borderRadius: 6,
                  fontSize: 12, fontWeight: 600, color: '#6d28d9', cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 14 }}>{def.icon}</span>
                {def.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr',
        gap: 20, padding: '16px 24px 40px',
      }}>
        {config?.widgets.map(widget => (
          <GenericWidget
            key={widget.id}
            widget={widget}
            editMode={editMode}
            globalStartDate={startDate}
            globalEndDate={endDate}
          />
        ))}

        {config?.widgets.length === 0 && !editMode && (
          <div style={{
            gridColumn: '1 / -1', textAlign: 'center',
            padding: '60px 0', color: '#9ca3af', fontSize: 13,
            border: '1px dashed #e5e7eb', borderRadius: 8, background: '#fff',
          }}>
            Aucun widget. Cliquez sur <b style={{ color: '#7C3AED' }}>Personnaliser</b> pour ajouter des rapports.
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardBuilder;