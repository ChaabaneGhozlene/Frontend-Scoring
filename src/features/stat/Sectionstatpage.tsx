import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDataRequest,
  fetchAgentsRequest,
  fetchCampaignsRequest,
  resetError,
  setFilters,
} from "./Statistiqueslice";
import FilterPanel from "./Filterpanel";
import PivotBuilder from "./Pivotbuilder";
import PivotTable from "./Pivottable";
import PivotCharts from "./Pivotcharts";
import type { RootState } from "../../app/store";
import { MEASURE_LABELS } from "./Pivotutils";            // ✅ casse corrigée
import type { MeasureKey, SectionStatState } from "./StatiTypes";

const StatistiquePage: React.FC = () => {
  const dispatch = useDispatch();
const authUser = useSelector((s: RootState) => s.auth.user);

  // ✅ lecture depuis sectionStat
  const state = useSelector((s: RootState) => s.sectionStat as SectionStatState);

  const filters       = state?.filters;
  const measure       = state?.measure       ?? "score" as MeasureKey;
  const loading       = state?.loading       ?? false;
  const error         = state?.error         ?? null;

  // ── Chargement initial ────────────────────────────────────────────────────
useEffect(() => {
  if (!filters || !authUser?.userId) return; // ✅ attendre que authUser soit prêt
  const userId = Number(authUser.userId);
  const userRole = isNaN(Number(authUser?.userRole)) ? 1 : Number(authUser.userRole);
  const siteId = Number((authUser as any)?.siteId ?? 0);

  dispatch(setFilters({ userId, userRole, siteId }));
  const enrichedFilter = { ...filters, userId, userRole, siteId };

  dispatch(fetchAgentsRequest({ userId, userRole, siteId, allSupervisors: filters.allSupervisors ?? true }));
  dispatch(fetchCampaignsRequest({ userId, siteId })); // ✅ userId/siteId garantis non-zéro
  dispatch(fetchDataRequest({ filter: enrichedFilter }));
}, [authUser?.userId]); 

  if (!filters) return null; // ✅ garde si le state n'est pas encore prêt

  const measureLabel = MEASURE_LABELS[measure] ?? measure;

  return (
    <div style={pageStyle}>
      {/* En-tête */}
      <div style={headerStyle}>
        <div>
          <h2 style={titleStyle}>Statistiques qualité</h2>
          <span style={subtitleStyle}>
            Tableau pivot — mesure&nbsp;: <strong>{measureLabel}</strong>
          </span>
        </div>
      </div>

      {/* Bandeau d'erreur */}
      {error && (
        <div style={errorStyle}>
          <span>{error}</span>
          <button onClick={() => dispatch(resetError())} style={closeBtnStyle}>×</button>
        </div>
      )}

      {/* Filtres */}
      <FilterPanel />

      {/* Constructeur pivot */}
      <div style={sectionStyle}>
        <div style={sectionLabelStyle}>Configuration du tableau croisé</div>
        <PivotBuilder />
      </div>

      {/* Graphiques */}
      <div style={sectionStyle}>
        <div style={sectionLabelStyle}>Graphiques</div>
        <div style={{ padding: "0 16px 8px" }}>
          <PivotCharts />
        </div>
      </div>

      {/* Tableau */}
      <div style={sectionStyle}>
        <div style={sectionLabelStyle}>Tableau croisé</div>
        <div style={{ padding: "0 16px 16px" }}>
          {loading ? (
            <div style={loadingStyle}>Chargement des données…</div>
          ) : (
            <PivotTable />
          )}
        </div>
      </div>
    </div>
  );
};

const pageStyle: React.CSSProperties = {
  background: "#f5f5f5",
  minHeight: "100vh",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};
const headerStyle: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "16px 20px 12px", background: "#fff", borderBottom: "1px solid #e8e8e8",
};
const titleStyle: React.CSSProperties = { margin: 0, fontSize: 18, fontWeight: 600, color: "#262626" };
const subtitleStyle: React.CSSProperties = { fontSize: 12, color: "#888" };
const sectionStyle: React.CSSProperties = {
  background: "#fff", borderRadius: 6, margin: "12px 12px 0",
  boxShadow: "0 1px 3px rgba(0,0,0,.06)",
};
const sectionLabelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: "#888",
  textTransform: "uppercase", letterSpacing: "0.05em",
  padding: "10px 16px 4px", borderBottom: "1px solid #f0f0f0",
};
const errorStyle: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "8px 16px", background: "#fff1f0",
  border: "1px solid #ffccc7", borderRadius: 4,
  margin: "8px 12px", fontSize: 13, color: "#cf1322",
};
const closeBtnStyle: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#cf1322",
};
const loadingStyle: React.CSSProperties = {
  padding: "2rem", textAlign: "center", color: "#1890ff", fontSize: 13,
};

export default StatistiquePage;