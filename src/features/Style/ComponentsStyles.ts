import type { CSSProperties } from "react"

// Modaux
export const modalOverlay: CSSProperties  = { position:'fixed',inset:0,background:'rgba(0,0,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200 }
export const modalBase: CSSProperties     = { background:'#fff',borderRadius:10,maxWidth:'94vw',boxShadow:'0 24px 64px rgba(0,0,0,.22)',overflow:'hidden' }
export const modalHeader: CSSProperties   = { display:'flex',alignItems:'center',gap:10,padding:'15px 20px',borderBottom:'1px solid #f0f0f0',background:'#fafafa' }
export const modalHeaderTitle: CSSProperties = { fontSize:14,fontWeight:700,color:'#111',flex:1 }
export const modalHeaderIcon: CSSProperties  = { width:32,height:32,color:'#fff',borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700 }
export const modalFooter: CSSProperties   = { display:'flex',justifyContent:'flex-end',gap:8,padding:'14px 20px',borderTop:'1px solid #f0f0f0',background:'#fafafa' }
export const modalCloseBtn: CSSProperties = { background:'none',border:'none',fontSize:16,cursor:'pointer',color:'#aaa',padding:4 }
export const modalBody: CSSProperties     = { padding:'20px',display:'flex',flexDirection:'column',gap:14 }

// Formulaires (communs aux 3)
export const fieldGroup: CSSProperties   = { display:'flex',flexDirection:'column',gap:4 }
export const fieldLabel: CSSProperties   = { fontSize:11,fontWeight:600,color:'#555',textTransform:'uppercase' as const,letterSpacing:.4 }
export const fieldInput: CSSProperties   = { padding:'8px 10px',border:'1px solid #d1d5db',borderRadius:6,fontSize:13,color:'#333',outline:'none',background:'#fff',width:'100%',boxSizing:'border-box' as const }
export const fieldInputErr: CSSProperties = { border:'1px solid #DC2626' }
export const fieldErrTxt: CSSProperties  = { fontSize:11,color:'#DC2626' }

// Boutons
export const btnCancel: CSSProperties    = { padding:'8px 20px',background:'#f5f5f5',color:'#555',border:'1px solid #e0e0e0',borderRadius:6,fontSize:13,cursor:'pointer' }
export const btnPrimary: CSSProperties   = { padding:'8px 22px',color:'#fff',border:'none',borderRadius:6,fontSize:13,fontWeight:600,cursor:'pointer' }
export const btnDanger: CSSProperties    = { ...btnPrimary, background:'#DC2626' }
export const btnPurple: CSSProperties    = { ...btnPrimary, background:'#7C3AED' }

// ── Modaux de confirmation (ConfirmModal, DeleteGroupModal…) ─────────
export const confirmModal: CSSProperties      = { background:'#fff',borderRadius:12,width:360,padding:'28px 24px',boxShadow:'0 24px 64px rgba(0,0,0,.22)',textAlign:'center' as const }
export const confirmIconWrap: CSSProperties   = { marginBottom:12 }
export const confirmIconCircle: CSSProperties = { width:56,height:56,background:'#FEF2F2',borderRadius:'50%',margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center' }
export const confirmTitle: CSSProperties      = { fontSize:15,fontWeight:700,color:'#111',margin:'0 0 8px' }
export const confirmMsg: CSSProperties        = { fontSize:13,color:'#6b7280',marginBottom:22,lineHeight:1.6 }
export const confirmFooter: CSSProperties     = { display:'flex',gap:10,justifyContent:'center' }
export const confirmBtnCancel: CSSProperties  = { padding:'9px 24px',background:'#f5f5f5',color:'#555',border:'1px solid #e0e0e0',borderRadius:7,fontSize:13,cursor:'pointer',fontWeight:500 }
export const confirmBtnDanger: CSSProperties  = { padding:'9px 24px',background:'#DC2626',color:'#fff',border:'none',borderRadius:7,fontSize:13,cursor:'pointer',fontWeight:600 }

// ── Modaux avec tabs (TemplateModal, EditGroupModal, NewGroupModal) ──────────

// Shell
export const tabModal: CSSProperties       = { background:'#fff',borderRadius:6,maxWidth:'97vw',maxHeight:'92vh',boxShadow:'0 20px 60px rgba(0,0,0,.25)',display:'flex',flexDirection:'column',overflow:'hidden' }
export const tabTitleBar: CSSProperties    = { display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 16px',background:'#e8e8e8',borderBottom:'1px solid #ccc' }
export const tabTitleTxt: CSSProperties    = { fontSize:13,fontWeight:600,color:'#333' }
export const tabsBar: CSSProperties        = { display:'flex',background:'#f0f0f0',borderBottom:'1px solid #ccc',padding:'6px 10px 0' }
export const tabActive: CSSProperties      = { padding:'6px 16px',border:'1px solid #ccc',borderBottom:'2px solid #fff',background:'#fff',fontSize:12,fontWeight:700,color:'#333',cursor:'pointer',borderRadius:'4px 4px 0 0',marginRight:2,position:'relative' as const,top:1 }
export const tabInactive: CSSProperties    = { padding:'6px 16px',border:'1px solid transparent',background:'transparent',fontSize:12,color:'#666',cursor:'pointer',borderRadius:'4px 4px 0 0',marginRight:2 }
export const tabBody: CSSProperties        = { flex:1,padding:'20px',overflowY:'auto' as const,minHeight:300,background:'#fff' }

// Formulaire label-à-gauche (formRow layout)
export const formGrid: CSSProperties       = { display:'flex',flexDirection:'column',gap:14 }
export const formRow: CSSProperties        = { display:'flex',alignItems:'center',gap:12 }
export const formLabel: CSSProperties      = { fontSize:13,color:'#333',width:100,textAlign:'right' as const,flexShrink:0 }
export const formField: CSSProperties      = { flex:1,display:'flex',flexDirection:'column',gap:3 }
export const formInp: CSSProperties        = { padding:'5px 8px',border:'1px solid #bbb',borderRadius:4,fontSize:13,outline:'none',width:'100%',boxSizing:'border-box' as const }
export const formInpNum: CSSProperties     = { ...formInp,width:160 }

// Transfer list (agents ou campagnes)
export const transferWrap: CSSProperties   = { display:'flex',alignItems:'flex-start',gap:12 }
export const transferCol: CSSProperties    = { flex:1,display:'flex',flexDirection:'column',gap:6 }
export const transferColTitle: CSSProperties = { fontSize:12,color:'#444',fontWeight:500 }
export const transferList: CSSProperties   = { width:'100%',height:220,border:'1px solid #bbb',borderRadius:4,fontSize:12,padding:4,outline:'none' }
export const transferBtnsCol: CSSProperties = { display:'flex',flexDirection:'column' as const,gap:6,justifyContent:'center',paddingTop:24 }
export const transferBtn: CSSProperties    = { padding:'5px 12px',background:'#f0f0f0',border:'1px solid #bbb',borderRadius:4,fontSize:12,cursor:'pointer',color:'#555',whiteSpace:'nowrap' as const }
export const transferBtnBold: CSSProperties = { ...transferBtn,background:'#e0e0e0',fontWeight:600,color:'#333' }

// Champ readonly
export const readonlyInput: CSSProperties  = { padding:'5px 8px',border:'1px solid #bbb',borderRadius:4,fontSize:13,outline:'none',width:'100%',boxSizing:'border-box' as const,background:'#f0f0f0',color:'#999' }

// Error box
export const errorBox: CSSProperties       = { background:'#fff0f0',border:'1px solid #f5a0a0',padding:'8px 12px',fontSize:12,color:'#c00',marginTop:12,borderRadius:4 }
// ── Modaux historique (ListenHistoryModal, ScreenHistoryModal) ───────────────

// Shell large
export const historyModal: CSSProperties = {
  background:'#fff', borderRadius:10, width:'760px', maxWidth:'96vw',
  maxHeight:'88vh', boxShadow:'0 24px 64px rgba(0,0,0,.22)',
  display:'flex', flexDirection:'column', overflow:'hidden',
}
export const historyBody: CSSProperties = {
  flex:1, padding:'16px 20px', overflowY:'auto',
}

// États vides / erreur / chargement
export const historyCenter: CSSProperties = {
  display:'flex', flexDirection:'column', alignItems:'center',
  justifyContent:'center', gap:8, padding:'40px 0', color:'#999', fontSize:13,
}
export const historyError: CSSProperties = {
  textAlign:'center', padding:'24px 0', fontSize:13, color:'#DC2626',
}

// Ligne maître (groupe utilisateur)
export const masterRow: CSSProperties = {
  display:'flex', gap:24, padding:'7px 12px', marginBottom:4,
  background:'#f3f4f6', borderRadius:5, borderLeft:'3px solid #3b82f6',
}
export const masterCell: CSSProperties     = { minWidth:80 }
export const masterCellLabel: CSSProperties = {
  fontSize:10, fontWeight:600, color:'#9ca3af',
  textTransform:'uppercase' as const, letterSpacing:.4, marginBottom:2,
}
export const masterCellValue: CSSProperties = { fontSize:12, fontWeight:600, color:'#111' }

// Table de détail
export const detailTable: CSSProperties = {
  width:'100%', borderCollapse:'collapse', marginLeft:12,
  marginBottom:10, fontSize:11,
}
export const detailThead: CSSProperties = { background:'#f9fafb' }
export const detailTh: CSSProperties = {
  padding:'5px 8px', textAlign:'left' as const, fontWeight:500,
  fontSize:11, color:'#6b7280', borderBottom:'1px solid #e5e7eb',
  borderTop:'1px solid #e5e7eb',
}
export const detailTd: CSSProperties = {
  padding:'4px 8px', borderBottom:'1px solid #f0f0f0', color:'#333',
}
export const detailMono: CSSProperties  = { ...detailTd, fontFamily:'monospace' }
export const detailGroup: CSSProperties = { marginBottom:12 }

// Tableau plat (ScreenHistoryModal)
export const flatTable: CSSProperties = {
  width:'100%', borderCollapse:'collapse', fontSize:12,
}
export const flatTh: CSSProperties = {
  padding:'7px 10px', textAlign:'left' as const, fontSize:11, fontWeight:600,
  color:'#6b7280', background:'#f3f4f6',
  borderBottom:'2px solid #e5e7eb', whiteSpace:'nowrap' as const,
}
export const flatTd: CSSProperties = {
  padding:'6px 10px', borderBottom:'1px solid #f0f0f0', color:'#333', fontSize:12,
}
export const flatTdMono: CSSProperties = { ...flatTd, fontFamily:'monospace', fontSize:11 }
export const flatTrEven: CSSProperties = { background:'#fafafa' }

// Badge action
export const actionBadge = (color: string): CSSProperties => ({
  display:'inline-block', padding:'2px 8px', borderRadius:10, fontSize:10,
  fontWeight:600, textTransform:'uppercase' as const, letterSpacing:.3,
  background: color + '18', color,
})
export const pageWrap: CSSProperties = {
  padding: '24px',
  background: '#f3f4f6',
  minHeight: '100%',
}

export const mainCard: CSSProperties = {
  background: '#fff',
  borderRadius: 10,
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  overflow: 'hidden',
  border: '1px solid #e5e7eb',
}

export const sectionHeader: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 24px',
  borderBottom: '1px solid #eee',
  background: '#fff',
}

export const sectionTitle: CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 600,
  color: '#374151',
}

export const filtersWrap: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12,
  padding: '20px 24px 10px',
}

export const summaryWrap: CSSProperties = {
  display: 'flex',
  gap: 16,
  padding: '0 24px 20px',
  flexWrap: 'wrap',
}

export const summaryCard: CSSProperties = {
  minWidth: 180,
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: '14px 16px',
}

export const summaryLabel: CSSProperties = {
  fontSize: 12,
  color: '#6b7280',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
}

export const summaryValue: CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  color: '#111827',
}

export const tableWrap: CSSProperties = {
  padding: '0 24px 24px',
  overflowX: 'auto',
}

export const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  background: '#fff',
}

export const thStyle: CSSProperties = {
  padding: '12px 10px',
  borderBottom: '2px solid #ececec',
  textAlign: 'left',
  fontSize: 14,
  fontWeight: 700,
  color: '#111827',
  whiteSpace: 'nowrap',
}

export const tdStyle: CSSProperties = {
  padding: '12px 10px',
  borderBottom: '1px solid #f1f1f1',
  fontSize: 14,
  color: '#374151',
  verticalAlign: 'top',
}

export const errorStyle: CSSProperties = {
  margin: '0 24px 20px',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#dc2626',
  padding: '12px 14px',
  borderRadius: 8,
  fontSize: 14,
}

export const loadingStyle: CSSProperties = {
  padding: '20px 24px',
  color: '#6b7280',
  fontSize: 14,
}

export const btnPrimaryRed: CSSProperties = {
  padding: '8px 22px',
  background: '#ff5a5f',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
}

export const btnLight: CSSProperties = {
  padding: '8px 20px',
  background: '#f5f5f5',
  color: '#555',
  border: '1px solid #e0e0e0',
  borderRadius: 6,
  fontSize: 13,
  cursor: 'pointer',
}