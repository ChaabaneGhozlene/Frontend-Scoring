import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { moveField, removeFieldFromZone } from "./Statistiqueslice";
import { fieldMeta } from "./Pivotutils";
import type { RootState } from "../../app/store";
import type { PivotZones, SectionStatState } from "./StatiTypes"; // ✅ corrigé

type ZoneKey = keyof PivotZones;

const ZONE_LABELS: Record<ZoneKey, string> = {
  rows:      "Lignes",
  cols:      "Colonnes",
  available: "Champs disponibles",
};

interface ChipProps {
  fieldKey: string;
  zone: ZoneKey;
  onDragStart: (field: string, zone: ZoneKey) => void;
}

const FieldChip: React.FC<ChipProps> = ({ fieldKey, zone, onDragStart }) => {
  const dispatch = useDispatch();
  const meta = fieldMeta(fieldKey);
  const isDim = meta.type === "dim";

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zone === "rows" || zone === "cols") {
      dispatch(removeFieldFromZone({ field: fieldKey, zone }));
    }
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(fieldKey, zone)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "3px 8px", borderRadius: 12, fontSize: 12,
        cursor: "grab", userSelect: "none", margin: 2,
        border: isDim ? "1px solid #1890ff" : "1px solid #52c41a",
        color: isDim ? "#1890ff" : "#52c41a",
        background: isDim ? "#e6f7ff" : "#f6ffed",
      }}
    >
      {meta.label}
      {(zone === "rows" || zone === "cols") && (
        <span onClick={handleRemove} style={{ cursor: "pointer", fontSize: 13, lineHeight: 1, opacity: 0.7 }}>
          ×
        </span>
      )}
    </div>
  );
};

interface DropZoneProps {
  zone: ZoneKey;
  fields: string[];
  onDragStart: (field: string, zone: ZoneKey) => void;
  onDrop: (toZone: ZoneKey) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ zone, fields, onDragStart, onDrop }) => {
  const [over, setOver] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={() => { setOver(false); onDrop(zone); }}
      style={{
        flex: zone === "available" ? 2 : 1,
        minHeight: 52, minWidth: 140,
        border: over ? "1.5px dashed #1890ff" : "1px dashed #d9d9d9",
        borderRadius: 6, padding: "6px 8px",
        background: over ? "#e6f7ff" : "#fafafa",
        transition: "all .15s",
      }}
    >
      <div style={{ fontSize: 11, color: "#999", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {ZONE_LABELS[zone]}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {fields.length === 0 ? (
          <span style={{ fontSize: 11, color: "#bbb", fontStyle: "italic" }}>Glisser un champ ici</span>
        ) : (
          fields.map((f) => (
            <FieldChip key={f} fieldKey={f} zone={zone} onDragStart={onDragStart} />
          ))
        )}
      </div>
    </div>
  );
};

const PivotBuilder: React.FC = () => {
  const dispatch = useDispatch();

  // ✅ lecture depuis sectionStat (slice local à features/stat/)
  const zones = useSelector((s: RootState) => (s.sectionStat as SectionStatState).zones);

  const dragging = useRef<{ field: string; fromZone: ZoneKey } | null>(null);

  const onDragStart = (field: string, fromZone: ZoneKey) => {
    dragging.current = { field, fromZone };
  };

  const onDrop = (toZone: ZoneKey) => {
    if (!dragging.current) return;
    const { field, fromZone } = dragging.current;
    dispatch(moveField({ field, fromZone, toZone }));
    dragging.current = null;
  };

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "8px 16px", marginBottom: 8 }}>
      {(["available", "rows", "cols"] as ZoneKey[]).map((zone) => (
        <DropZone
          key={zone}
          zone={zone}
          fields={zones[zone]}
          onDragStart={onDragStart}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
};

export default PivotBuilder;