import { call, put, takeLatest } from 'redux-saga/effects'
import type { PayloadAction } from '@reduxjs/toolkit'
import { ConfigurationService } from './ConfigurationCampagnesservice'
import {
  fetchTemplates,         fetchTemplatesSuccess,  fetchTemplatesFailure,
  createTemplate,         createTemplateSuccess,  createTemplateFailure,
  updateTemplate,         updateTemplateSuccess,  updateTemplateFailure,
  deleteTemplate,         deleteTemplateSuccess,  deleteTemplateFailure,
  changeModel,            changeModelSuccess,     changeModelFailure,
  fetchCampaigns,         fetchCampaignsSuccess,  fetchCampaignsFailure,
  createCampaign,         createCampaignSuccess,  createCampaignFailure,
  updateCampaign,         updateCampaignSuccess,  updateCampaignFailure,
  deleteCampaign,         deleteCampaignSuccess,  deleteCampaignFailure,
  fetchPeriodes,          fetchPeriodesSuccess,
  fetchCustomers,         fetchCustomersSuccess,
  fetchAvailableBySite,   fetchAvailableBySiteSuccess,
} from './ConfigurationCampagnesslice'
import type {
  CreateLsTemplateDto, UpdateLsTemplateDto, ChangeModelDto,
  CreateCalledCampaignDto, UpdateCalledCampaignDto,
} from './ConfigurationCampagnestypes'

// ── Helpers ───────────────────────────────────────────────────────────────────
const getErrMsg = (e: unknown) =>
  (e as any)?.response?.data?.message ?? (e as Error)?.message ?? 'Erreur inconnue'

// ════════════════════════════════════════════════════════════════════════════
// TEMPLATES
// ════════════════════════════════════════════════════════════════════════════

function* handleFetchTemplates() {
  try {
    const res: Awaited<ReturnType<typeof ConfigurationService.getTemplates>> =
      yield call(ConfigurationService.getTemplates)
    yield put(fetchTemplatesSuccess(res.data))
  } catch (e) {
    yield put(fetchTemplatesFailure(getErrMsg(e)))
  }
}

function* handleCreateTemplate(action: PayloadAction<CreateLsTemplateDto>) {
  try {
    yield call(ConfigurationService.createTemplate, action.payload)
    yield put(createTemplateSuccess())
    yield put(fetchTemplates())                    // refresh liste
  } catch (e) {
    yield put(createTemplateFailure(getErrMsg(e)))
  }
}

function* handleUpdateTemplate(
  action: PayloadAction<{ id: number; dto: UpdateLsTemplateDto }>
) {
  try {
    yield call(ConfigurationService.updateTemplate, action.payload.id, action.payload.dto)
    yield put(updateTemplateSuccess())
    yield put(fetchTemplates())
  } catch (e) {
    yield put(updateTemplateFailure(getErrMsg(e)))
  }
}

function* handleDeleteTemplate(action: PayloadAction<number>) {
  try {
    yield call(ConfigurationService.deleteTemplate, action.payload)
    yield put(deleteTemplateSuccess(action.payload))
    yield put(fetchTemplates())
  } catch (e) {
    yield put(deleteTemplateFailure(getErrMsg(e)))
  }
}

function* handleChangeModel(
  action: PayloadAction<{ id: number; dto: ChangeModelDto }>
) {
  try {
    yield call(ConfigurationService.changeModel, action.payload.id, action.payload.dto)
    yield put(changeModelSuccess())
    yield put(fetchTemplates())
  } catch (e) {
    yield put(changeModelFailure(getErrMsg(e)))
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CAMPAIGNS
// ════════════════════════════════════════════════════════════════════════════

function* handleFetchCampaigns(action: PayloadAction<number>) {
  try {
    const res: Awaited<ReturnType<typeof ConfigurationService.getCampaignsByTemplate>> =
 yield call(ConfigurationService.getCampaignsByTemplate, action.payload)
    yield put(fetchCampaignsSuccess(res.data))
  } catch (e) { 
    yield put(fetchCampaignsFailure(getErrMsg(e)))
  }
}

function* handleCreateCampaign(action: PayloadAction<CreateCalledCampaignDto>) {
  try {
    yield call(ConfigurationService.createCampaign, action.payload)
    yield put(createCampaignSuccess())
    yield put(fetchCampaigns(action.payload.lsTemplateId))
  } catch (e) {
    yield put(createCampaignFailure(getErrMsg(e)))
  }
}

function* handleUpdateCampaign(
  action: PayloadAction<{ id: number; dto: UpdateCalledCampaignDto }>
) {
  try {
    yield call(ConfigurationService.updateCampaign, action.payload.id, action.payload.dto)
    yield put(updateCampaignSuccess())
    yield put(fetchCampaigns(action.payload.dto.lsTemplateId))
  } catch (e) {
    yield put(updateCampaignFailure(getErrMsg(e)))
  }
}

function* handleDeleteCampaign(
  action: PayloadAction<{ id: number; templateId: number }>
) {
  try {
    yield call(ConfigurationService.deleteCampaign, action.payload.id)
    yield put(deleteCampaignSuccess())
    yield put(fetchCampaigns(action.payload.templateId))
  } catch (e) {
    yield put(deleteCampaignFailure(getErrMsg(e)))
  }
}

// ════════════════════════════════════════════════════════════════════════════
// LOOKUPS
// ════════════════════════════════════════════════════════════════════════════

function* handleFetchPeriodes() {
  try {
    const res: Awaited<ReturnType<typeof ConfigurationService.getPeriodes>> =
      yield call(ConfigurationService.getPeriodes)
    yield put(fetchPeriodesSuccess(res.data))
  } catch (e) { /* silencieux pour les lookups */ }
}

function* handleFetchCustomers() {
  try {
    const res: Awaited<ReturnType<typeof ConfigurationService.getCustomers>> =
      yield call(ConfigurationService.getCustomers)
    yield put(fetchCustomersSuccess(res.data))
  } catch (e) { /* silencieux pour les lookups */ }
}

function* handleFetchAvailableBySite(action: PayloadAction<number>) {
  try {
    const res: Awaited<ReturnType<typeof ConfigurationService.getAvailableCampaignsBySite>> =
      yield call(ConfigurationService.getAvailableCampaignsBySite, action.payload)
    yield put(fetchAvailableBySiteSuccess(res.data))
  } catch (e) { /* silencieux */ }
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT SAGA
// ════════════════════════════════════════════════════════════════════════════

export function* configurationSaga() {
  // Templates
  yield takeLatest(fetchTemplates.type,  handleFetchTemplates)
  yield takeLatest(createTemplate.type,  handleCreateTemplate)
  yield takeLatest(updateTemplate.type,  handleUpdateTemplate)
  yield takeLatest(deleteTemplate.type,  handleDeleteTemplate)
  yield takeLatest(changeModel.type,     handleChangeModel)

  // Campaigns
  yield takeLatest(fetchCampaigns.type,  handleFetchCampaigns)
  yield takeLatest(createCampaign.type,  handleCreateCampaign)
  yield takeLatest(updateCampaign.type,  handleUpdateCampaign)
  yield takeLatest(deleteCampaign.type,  handleDeleteCampaign)

  // Lookups
  yield takeLatest(fetchPeriodes.type,       handleFetchPeriodes)
  yield takeLatest(fetchCustomers.type,      handleFetchCustomers)
  yield takeLatest(fetchAvailableBySite.type, handleFetchAvailableBySite)
}