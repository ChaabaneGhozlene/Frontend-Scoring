import type { CSSProperties } from 'react'

// ════════════════════════════════════════════════════════════════════
// STYLES PARTAGÉS — source unique pour toutes les pages Settings
// ════════════════════════════════════════════════════════════════════

export const pageWrap: CSSProperties      = { fontFamily:"'Segoe UI',sans-serif", background:'#f5f6fa', minHeight:'100vh', paddingBottom:40 }
export const pageHeader: CSSProperties    = { display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fff', padding:'14px 24px', borderBottom:'1px solid #e5e7eb', boxShadow:'0 1px 4px rgba(0,0,0,.06)' }
export const headerLeft: CSSProperties    = { display:'flex', alignItems:'center', gap:12 }
export const headerActions: CSSProperties = { display:'flex', gap:4 }
export const gearIcon: CSSProperties      = { width:40, height:40, background:'#f5f5f5', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, border:'1px solid #e5e7eb' }
export const pageTitle: CSSProperties     = { fontSize:17, fontWeight:700, color:'#111' }
export const pageCrumb: CSSProperties     = { fontSize:11, color:'#aaa', marginTop:2 }
export const actionBtn: CSSProperties     = { display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'4px 14px', background:'none', border:'none', cursor:'pointer', borderRadius:6 }
export const actionLbl: CSSProperties     = { fontSize:11, color:'#DC2626', fontWeight:600 }

// ── Toolbar (barre sous le header) ──────────────────────────────────
export const toolbarBar: CSSProperties      = { display:'flex', alignItems:'center', flexWrap:'wrap', gap:8, background:'#fff', padding:'10px 24px', borderBottom:'1px solid #e5e7eb' }
export const toolbarLbl: CSSProperties      = { fontSize:13, fontWeight:600, color:'#444' }
export const toolbarSelect: CSSProperties   = { padding:'5px 10px', border:'1px solid #d1d5db', borderRadius:5, fontSize:13, minWidth:180, background:'#fff', cursor:'pointer' }
export const toolbarBtnsWrap: CSSProperties = { display:'flex', gap:3 }
export const toolbarBtn: CSSProperties      = { width:26, height:26, border:'1px solid #d1d5db', borderRadius:4, background:'#fff', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', color:'#444' }

// ── Badges ────────────────────────────────────────────────────────────
export const infoBadge: CSSProperties = { display:'flex', alignItems:'center', gap:5, background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:6, padding:'3px 10px', fontSize:12, color:'#555' }
export const selBadge: CSSProperties  = { display:'flex', alignItems:'center', gap:5, background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:6, padding:'3px 10px', fontSize:12, color:'#1d4ed8', fontWeight:600 }
export const badgeLbl: CSSProperties  = { color:'#9ca3af', marginLeft:4 }

// ── Pills statut ────────────────────────────────────────────────────
export const pillActive: CSSProperties   = { padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:'#dcfce7', color:'#16a34a' }
export const pillInactive: CSSProperties = { padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:'#fee2e2', color:'#DC2626' }

// ── Misc ─────────────────────────────────────────────────────────────
export const tableWrap: CSSProperties = { margin:'18px 24px' }
export const toastBase: CSSProperties = { position:'fixed', bottom:24, right:24, zIndex:999, padding:'11px 22px', borderRadius:8, color:'#fff', fontSize:13, fontWeight:500, boxShadow:'0 4px 20px rgba(0,0,0,.2)', display:'flex', alignItems:'center', gap:8 }