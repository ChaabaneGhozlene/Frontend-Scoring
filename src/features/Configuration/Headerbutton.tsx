import type { FC, ReactNode } from 'react'
import { actionBtn, actionLbl } from '../Pagestyles'

interface Props {
  label:   string
  onClick: () => void
  icon:    ReactNode
}

/** Bouton vertical (icône + label rouge) utilisé dans le header de chaque page. */
const HeaderButton: FC<Props> = ({ label, onClick, icon }) => (
  <button type="button" style={actionBtn} onClick={onClick}>
    {icon}
    <span style={actionLbl}>{label}</span>
  </button>
)

export default HeaderButton

// ── Icônes SVG ────────────────────────────────────────────────────────────────
const C = '#DC2626'

export const IconPlus = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={C} strokeWidth="1.8"/>
    <path d="M12 8v8M8 12h8" stroke={C} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const IconEdit = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={C} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={C} strokeWidth="1.8"/>
  </svg>
)

export const IconDelete = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <polyline points="3 6 5 6 21 6" stroke={C} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M19 6l-1 14H6L5 6" stroke={C} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M10 11v6M14 11v6" stroke={C} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M9 6V4h6v2" stroke={C} strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
)