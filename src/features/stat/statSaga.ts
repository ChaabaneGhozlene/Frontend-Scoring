import { call, put, takeLatest } from "redux-saga/effects";
import { StatistiqueService } from "./Statistiqueservice";
import {
  fetchDataRequest, fetchDataSuccess, fetchDataFailure,
  fetchAgentsRequest, fetchAgentsSuccess, fetchAgentsFailure,
  fetchCampaignsRequest, fetchCampaignsSuccess, fetchCampaignsFailure,
  exportRequest, exportSuccess, exportFailure,
} from "./Statistiqueslice";
import type {
  AgentDto, CampaignDto, ExportPayload,
  FetchAgentsPayload, FetchCampaignsPayload,
  FetchStatistiquePayload, StatistiqueRowDto, StatistiqueRowViewModel
} from "./StatiTypes";
import type { PayloadAction } from "@reduxjs/toolkit";

const MONTHS_FR = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

function enrichRow(row: any): StatistiqueRowViewModel {
  // ✅ Le backend renvoie scorePercent, sectionId, section, agent, agentId, campaign
  // On mappe vers StatistiqueRowViewModel
  const createDate = row.createDate ?? new Date().toISOString();
  const d     = new Date(createDate);
  const month = d.getMonth();
  const year  = d.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const weekNo = Math.ceil(
    ((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  );
  return {
    // Champs StatistiqueRowDto de base
    surveyId:    row.surveyId    ?? 0,
    createDate,
    score:       row.scorePercent ?? row.score ?? 0,  // ✅ scorePercent → score
    memo:        row.memo        ?? null,
    agentId:     typeof row.agentId === "number" ? row.agentId : 0,
    agent:       row.agent       ?? "",
    auditorId:   row.auditorId   ?? 0,
    auditor:     row.auditor     ?? "",
    campaignId:  row.campaignId  ?? null,
    campaign:    row.campaign    ?? null,
    fullPeriode: row.fullPeriode ?? null,
    recordLink:  row.recordLink  ?? null,
    itemId:      row.itemId      ?? null,
    itemValue:   row.itemValue   ?? null,
    itemMemo:    row.itemMemo    ?? null,
    question:    row.question    ?? null,
    section:     row.section     ?? null,
    sectionId:   row.sectionId   ?? null,
    // Champs enrichis
    monthYear: `${MONTHS_FR[month]} ${year}`,
    year,
    weekYear:  `S${String(weekNo).padStart(2, "0")} ${year}`,
  };
}

function* handleFetchData(action: PayloadAction<FetchStatistiquePayload>) {
  try {
    const raw: any[] = yield call(StatistiqueService.getData, action.payload.filter);
    const safe = Array.isArray(raw) ? raw : [];
    yield put(fetchDataSuccess(safe.map(enrichRow)));
  } catch (err: any) {
    yield put(fetchDataFailure(
      err?.response?.data?.message ?? err?.message ?? "Erreur chargement données."
    ));
  }
}

function* handleFetchAgents(action: PayloadAction<FetchAgentsPayload>) {
  try {
    const agents: AgentDto[] = yield call(
      StatistiqueService.getAgents,
      action.payload.allSupervisors  // seulement allSupervisors
    );
    yield put(fetchAgentsSuccess(Array.isArray(agents) ? agents : []));
  } catch (err: any) {
    yield put(fetchAgentsFailure(err?.message ?? "Erreur agents."));
  }
}

// ✅ CORRIGÉ : Ne plus passer userId, siteId
function* handleFetchCampaigns(action: PayloadAction<FetchCampaignsPayload>) {
  try {
    const campaigns: CampaignDto[] = yield call(StatistiqueService.getCampaigns);
    yield put(fetchCampaignsSuccess(Array.isArray(campaigns) ? campaigns : []));
  } catch (err: any) {
    yield put(fetchCampaignsFailure(err?.message ?? "Erreur campagnes."));
  }
}


function* handleExport(action: PayloadAction<ExportPayload>) {
  try {
    yield call(StatistiqueService.export, {
      filter: action.payload.filter,
      format: action.payload.format,
    });
    yield put(exportSuccess());
  } catch (err: any) {
    yield put(exportFailure(err?.message ?? "Erreur export."));
  }
}

export function* statSaga() {
  yield takeLatest(fetchDataRequest.type,      handleFetchData);
  yield takeLatest(fetchAgentsRequest.type,    handleFetchAgents);
  yield takeLatest(fetchCampaignsRequest.type, handleFetchCampaigns);
  yield takeLatest(exportRequest.type,         handleExport);
}