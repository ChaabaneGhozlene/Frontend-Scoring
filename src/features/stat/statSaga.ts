import { call, put, takeLatest } from "redux-saga/effects";
import { StatistiqueService } from "./Statistiqueservice";
import {
  fetchDataRequest, fetchDataSuccess, fetchDataFailure,
  fetchAgentsRequest, fetchAgentsSuccess, fetchAgentsFailure,
  fetchCampaignsRequest, fetchCampaignsSuccess, fetchCampaignsFailure,
  exportRequest, exportSuccess, exportFailure,
} from "./Statistiqueslice";
import type { AgentDto, CampaignDto, ExportPayload, FetchAgentsPayload, FetchCampaignsPayload, FetchStatistiquePayload, StatistiqueRowDto, StatistiqueRowViewModel } from "./StatiTypes";
import type { PayloadAction } from "@reduxjs/toolkit";

const MONTHS_FR = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

function enrichRow(row: StatistiqueRowDto): StatistiqueRowViewModel {
  const d = new Date(row.createDate);
  const month = d.getMonth();
  const year = d.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const weekNo = Math.ceil(
    ((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  );
  return {
    ...row,
    monthYear: `${MONTHS_FR[month]} ${year}`,
    year,
    weekYear: `S${String(weekNo).padStart(2, "0")} ${year}`,
  };
}

function* handleFetchData(action: PayloadAction<FetchStatistiquePayload>) {
  try {
    const raw: StatistiqueRowDto[] = yield call(StatistiqueService.getData, action.payload.filter);
    yield put(fetchDataSuccess(raw.map(enrichRow)));
  } catch (err: any) {
    yield put(fetchDataFailure(err?.response?.data?.message ?? err?.message ?? "Erreur chargement données."));
  }
}

function* handleFetchAgents(action: PayloadAction<FetchAgentsPayload>) {
  try {
    const agents: AgentDto[] = yield call(
      StatistiqueService.getAgents,
      action.payload.userId, action.payload.userRole,
      action.payload.siteId, action.payload.allSupervisors
    );
    yield put(fetchAgentsSuccess(agents));
  } catch (err: any) {
    yield put(fetchAgentsFailure(err?.response?.data?.message ?? err?.message ?? "Erreur chargement agents."));
  }
}

function* handleFetchCampaigns(action: PayloadAction<FetchCampaignsPayload>) {
  try {
    const campaigns: CampaignDto[] = yield call(
      StatistiqueService.getCampaigns,
      action.payload.userId, action.payload.siteId
    );
    yield put(fetchCampaignsSuccess(campaigns));
  } catch (err: any) {
    yield put(fetchCampaignsFailure(err?.response?.data?.message ?? err?.message ?? "Erreur chargement campagnes."));
  }
}

function* handleExport(action: PayloadAction<ExportPayload>) {
  try {
    yield call(StatistiqueService.export, { filter: action.payload.filter, format: action.payload.format });
    yield put(exportSuccess());
  } catch (err: any) {
    yield put(exportFailure(err?.response?.data?.message ?? err?.message ?? "Erreur export."));
  }
}

// ✅ Un seul export nommé
export function* statSaga() {
  yield takeLatest(fetchDataRequest.type, handleFetchData);
  yield takeLatest(fetchAgentsRequest.type, handleFetchAgents);
  yield takeLatest(fetchCampaignsRequest.type, handleFetchCampaigns);
  yield takeLatest(exportRequest.type, handleExport);
}