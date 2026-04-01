import React, { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { LsCalledCampaignDto, CustomerDto, AvailableCampaignDto, CreateCalledCampaignDto, UpdateCalledCampaignDto } from '../ConfigurationCampagnestypes'
import axiosInstance from '../../../../services/axiosInstance'
import {
  modalOverlay, modalBase, modalHeader, modalHeaderTitle, modalHeaderIcon,
  modalFooter, modalCloseBtn, modalBody, fieldGroup, fieldLabel,
  fieldInput, fieldInputErr, fieldErrTxt, btnCancel, btnDanger,
} from '../../../Style/ComponentsStyles'

interface Props {
  mode: 'create' | 'edit'
  campaign?: LsCalledCampaignDto | null
  templateId: number
  customers: CustomerDto[]
  onConfirm: (dto: CreateCalledCampaignDto | UpdateCalledCampaignDto) => void
  onClose: () => void
}

const CampaignModal: React.FC<Props> = ({ mode, campaign, templateId, customers, onConfirm, onClose }) => {
  const [description,        setDescription]        = useState('')
  const [customerId,         setCustomerId]          = useState<number>(0)
  const [campagneParam,      setCampagneParam]       = useState('')
  const [status,             setStatus]              = useState<number>(1)
  const [availableCampaigns, setAvailableCampaigns]  = useState<AvailableCampaignDto[]>([])
  const [loadingCamps,       setLoadingCamps]        = useState(false)
  const [errors,             setErrors]              = useState<Record<string, string>>({})

  const loadBySite = async (id: number, tmplId?: number, defaultParam?: string) => {
    if (!id) return
    setLoadingCamps(true)
    try {
      const url = tmplId
        ? `/configuration/available-campaigns/by-site/${id}?templateId=${tmplId}`
        : `/configuration/available-campaigns/by-site/${id}`
      const res = await axiosInstance.get<AvailableCampaignDto[]>(url)
      setAvailableCampaigns(res.data)
      if (defaultParam) {
        let match = res.data.find(c => c.param === defaultParam)
        if (!match) {
          const parts = defaultParam.split(',')
          const fallback: AvailableCampaignDto = { param: defaultParam, display: parts[2] || defaultParam }
          setAvailableCampaigns([fallback, ...res.data])
          match = fallback
        }
        setCampagneParam(match.param)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingCamps(false)
    }
  }

  useEffect(() => {
    if (mode === 'edit' && campaign) {
      setDescription(campaign.description)
      setCustomerId(campaign.site)
      setStatus(campaign.status)
      loadBySite(campaign.site, undefined, `${campaign.site},${campaign.campagneDid},${campaign.campagneDescription}`)
    }
  }, [mode, campaign])

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value)
    setCustomerId(id)
    setCampagneParam('')
    setAvailableCampaigns([])
    if (id) loadBySite(id, mode === 'edit' ? templateId : undefined)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!customerId)    e.customer = 'Champ requis'
    if (!campagneParam) e.campagne = 'Champ requis'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const parts = campagneParam.split(',')
    onConfirm({ description: description || parts[2] || '', site: customerId, campagneParam, status, lsTemplateId: templateId })
  }

  return (
    <div style={modalOverlay}>
      <div style={modal}>
        <div style={modalHeader}>
          <div style={headerIcon}>{mode === 'create' ? '＋' : '✏️'}</div>
          <span style={modalHeaderTitle}>
            {mode === 'create' ? 'Nouvelle Campagne Qualité' : 'Modifier la Campagne'}
          </span>
          <button style={modalCloseBtn} onClick={onClose}>✕</button>
        </div>

        <div style={modalBody}>
          <div style={fieldGroup}>
            <label style={fieldLabel}>Description</label>
            <input style={fieldInput} value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Nom de la campagne qualité" />
          </div>

          <div style={fieldGroup}>
            <label style={fieldLabel}>Site (Client) <span style={req}>*</span></label>
            <select style={{ ...fieldInput, ...(errors.customer ? fieldInputErr : {}) }}
              value={customerId} onChange={handleCustomerChange}>
              <option value={0}>-- Sélectionner un site --</option>
              {customers.map(c => <option key={c.customerId} value={c.customerId}>{c.description}</option>)}
            </select>
            {errors.customer && <span style={fieldErrTxt}>{errors.customer}</span>}
          </div>

          <div style={fieldGroup}>
            <label style={fieldLabel}>Campagne <span style={req}>*</span></label>
            <select style={{ ...fieldInput, ...(errors.campagne ? fieldInputErr : {}) }}
              value={campagneParam} onChange={e => setCampagneParam(e.target.value)}
              disabled={!customerId || loadingCamps}>
              <option value="">-- Sélectionner une campagne --</option>
              {availableCampaigns.map(c => <option key={c.param} value={c.param}>{c.display}</option>)}
            </select>
            {loadingCamps && <span style={loadingTxt}>⟳ Chargement...</span>}
            {errors.campagne && <span style={fieldErrTxt}>{errors.campagne}</span>}
          </div>

          <div style={fieldGroup}>
            <label style={fieldLabel}>Statut</label>
            <select style={fieldInput} value={status} onChange={e => setStatus(Number(e.target.value))}>
              <option value={1}>Actif</option>
              <option value={0}>Inactif</option>
            </select>
          </div>
        </div>

        <div style={modalFooter}>
          <button style={btnCancel} onClick={onClose}>Annuler</button>
          <button style={btnDanger} onClick={handleSubmit}>
            {mode === 'create' ? 'Ajouter la campagne' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Spécifique à ce modal uniquement ─────────────────────────────────
const modal:      CSSProperties = { ...modalBase,       width: 460 }
const headerIcon: CSSProperties = { ...modalHeaderIcon, background: '#DC2626' }
const req:        CSSProperties = { color: '#DC2626' }
const loadingTxt: CSSProperties = { fontSize: 11, color: '#888' }

export default CampaignModal