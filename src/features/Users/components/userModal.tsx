import { useState, useEffect, type FC } from 'react'
import type { UserDto, SiteDto, CreateUserDto, UpdateUserDto } from '../userTypes'

// ═══════════════════════════════════════════════════════════════
// UserModal — Création / Modification d'un utilisateur
// ═══════════════════════════════════════════════════════════════

interface Props {
  mode:    'create' | 'edit'
  user?:   UserDto
  sites:   SiteDto[]
  saving:  boolean
  onSave:  (dto: CreateUserDto | UpdateUserDto) => void
  onClose: () => void
}

interface FormState {
  login:     string
  password:  string
  firstName: string
  lastName:  string
  isActive:  boolean
  siteId:    number
  siteName:  string
}

const EMPTY: FormState = {
  login: '', password: '', firstName: '', lastName: '',
  isActive: true, siteId: 0, siteName: '',
}

const UserModal: FC<Props> = ({ mode, user, sites, saving, onSave, onClose }) => {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  useEffect(() => {
    if (mode === 'edit' && user) {
      setForm({
        login:     user.login,
        password:  '',
        firstName: user.firstName,
        lastName:  user.lastName,
        isActive:  user.isActive,
        siteId:    user.siteId,
        siteName:  user.siteName,
      })
    } else {
      setForm(EMPTY)
    }
    setErrors({})
  }, [mode, user])

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: val }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  function handleSiteChange(id: number) {
    const site = sites.find(s => s.id === id)
    setForm(prev => ({ ...prev, siteId: id, siteName: site?.name ?? '' }))
    setErrors(prev => ({ ...prev, siteId: undefined }))
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {}
    if (!form.login.trim())     errs.login     = 'Login requis'
    if (mode === 'create' && !form.password.trim()) errs.password = 'Mot de passe requis'
    if (!form.firstName.trim()) errs.firstName = 'Prénom requis'
    if (!form.lastName.trim())  errs.lastName  = 'Nom requis'
    if (!form.siteId)           errs.siteId    = 'Site requis'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    const dto: CreateUserDto | UpdateUserDto = {
      login:     form.login,
      firstName: form.firstName,
      lastName:  form.lastName,
      isActive:  form.isActive,
      siteId:    form.siteId,
      siteName:  form.siteName,
      ...(form.password ? { password: form.password } : {}),
    }
    onSave(dto)
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* Header */}
        <div style={modalHeader}>
          <span style={modalTitle}>
            {mode === 'create' ? '➕ Nouvel utilisateur' : '✏️ Modifier l\'utilisateur'}
          </span>
          <button style={closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div style={modalBody}>
          <div style={grid2}>
            <Field label="Login *" error={errors.login}>
              <input style={input(!!errors.login)} value={form.login}
                onChange={e => set('login', e.target.value)} placeholder="ex: jdupont" />
            </Field>
            <Field label={mode === 'create' ? 'Mot de passe *' : 'Mot de passe (laisser vide = inchangé)'} error={errors.password}>
              <input style={input(!!errors.password)} type="password" value={form.password}
                onChange={e => set('password', e.target.value)} placeholder="••••••••" />
            </Field>
            <Field label="Prénom *" error={errors.firstName}>
              <input style={input(!!errors.firstName)} value={form.firstName}
                onChange={e => set('firstName', e.target.value)} placeholder="ex: Jean" />
            </Field>
            <Field label="Nom *" error={errors.lastName}>
              <input style={input(!!errors.lastName)} value={form.lastName}
                onChange={e => set('lastName', e.target.value)} placeholder="ex: Dupont" />
            </Field>
            <Field label="Site *" error={errors.siteId}>
              <select style={input(!!errors.siteId)} value={form.siteId}
                onChange={e => handleSiteChange(Number(e.target.value))}>
                <option value={0}>-- Sélectionner un site --</option>
                {sites.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Statut">
              <div style={toggleWrap}>
                <label style={toggleLabel}>
                  <input type="checkbox" checked={form.isActive}
                    onChange={e => set('isActive', e.target.checked)}
                    style={{ marginRight: 8 }} />
                  {form.isActive ? (
                    <span style={pillOn}>Actif</span>
                  ) : (
                    <span style={pillOff}>Inactif</span>
                  )}
                </label>
              </div>
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div style={modalFooter}>
          <button style={btnCancel} onClick={onClose} disabled={saving}>Annuler</button>
          <button style={btnSave} onClick={handleSubmit} disabled={saving}>
            {saving ? '⏳ Enregistrement…' : '💾 Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Field wrapper ────────────────────────────────────────────
const Field: FC<{ label: string; error?: string; children: React.ReactNode }> = ({ label, error, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{label}</label>
    {children}
    {error && <span style={{ fontSize: 11, color: '#DC2626' }}>{error}</span>}
  </div>
)

export default UserModal

// ── Styles ───────────────────────────────────────────────────
const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
}
const modal: React.CSSProperties = {
  background: '#fff', borderRadius: 10, width: 560, maxWidth: '95vw',
  boxShadow: '0 20px 60px rgba(0,0,0,.25)', display: 'flex', flexDirection: 'column',
}
const modalHeader: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
}
const modalTitle: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: '#111' }
const closeBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#888',
}
const modalBody: React.CSSProperties = { padding: '20px', overflowY: 'auto', maxHeight: '60vh' }
const modalFooter: React.CSSProperties = {
  display: 'flex', justifyContent: 'flex-end', gap: 8,
  padding: '14px 20px', borderTop: '1px solid #e5e7eb',
}
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }
const input = (err: boolean): React.CSSProperties => ({
  padding: '7px 10px', border: `1px solid ${err ? '#DC2626' : '#d1d5db'}`,
  borderRadius: 5, fontSize: 13, width: '100%', boxSizing: 'border-box',
  outline: 'none', background: '#fafafa',
})
const toggleWrap: React.CSSProperties = { display: 'flex', alignItems: 'center', height: 34 }
const toggleLabel: React.CSSProperties = { display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: 13 }
const pillOn:  React.CSSProperties = { padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#dcfce7', color: '#16a34a' }
const pillOff: React.CSSProperties = { padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#fee2e2', color: '#DC2626' }
const btnCancel: React.CSSProperties = {
  padding: '8px 18px', border: '1px solid #d1d5db', borderRadius: 6,
  background: '#fff', cursor: 'pointer', fontSize: 13, color: '#555',
}
const btnSave: React.CSSProperties = {
  padding: '8px 18px', border: 'none', borderRadius: 6,
  background: '#DC2626', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600,
}