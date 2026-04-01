import type { FC, ReactNode } from 'react'

import { pageWrap, pageHeader, headerLeft, gearIcon, pageTitle, pageCrumb, headerActions, toastBase } from './Pagestyles'
import type { Toast } from './Usesettingspage'

interface Props {
  title:    string
  crumb:    string
  toast:    Toast | null
  actions?: ReactNode   // boutons dans le coin droit du header
  toolbar?: ReactNode   // barre sous le header (sélecteur, mini-boutons…)
  children: ReactNode
  icon?: ReactNode 
}

/**
 * Enveloppe commune à toutes les pages Settings.
 * Fournit header + toast + toolbar optionnelle + zone de contenu.
 */
const PageLayout: FC<Props> = ({ title, crumb, toast, actions, toolbar, children, icon}) => (
  <div style={pageWrap}>

    {/* ── Toast ──────────────────────────────────────────────────────── */}
    {toast && (
      <div style={{ ...toastBase, background: toast.type === 'success' ? '#16a34a' : '#DC2626' }}>
        {toast.type === 'success' ? '✓' : '✕'}&nbsp;{toast.msg}
      </div>
    )}

    {/* ── Header ─────────────────────────────────────────────────────── */}
    <div style={pageHeader}>
      <div style={headerLeft}>
        <div style={{
          ...gearIcon,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon ?? '⚙️'}
        </div>
        <div>
          <div style={pageTitle}>{title}</div>
          <div style={pageCrumb}>{crumb}</div>
        </div>
      </div>
      {actions && <div style={headerActions}>{actions}</div>}
    </div>

    {/* ── Toolbar optionnelle ─────────────────────────────────────────── */}
    {toolbar}

    {/* ── Contenu ────────────────────────────────────────────────────── */}
    {children}

  </div>
)

export default PageLayout