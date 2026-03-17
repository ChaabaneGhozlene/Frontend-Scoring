import React from 'react'

interface Props {
  title?: string
  message: string
  onConfirm: () => void
  onClose: () => void
}

const ConfirmModal: React.FC<Props> = ({ title = 'Confirmer la suppression', message, onConfirm, onClose }) => (
  <div style={overlay}>
    <div style={modal}>
      <div style={iconWrap}>
        <div style={iconCircle}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#DC2626" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>
      </div>
      <h3 style={ttl}>{title}</h3>
      <p style={msg}>{message}</p>
      <div style={footer}>
        <button style={btnCancel} onClick={onClose}>Annuler</button>
        <button style={btnDanger} onClick={onConfirm}>Confirmer</button>
      </div>
    </div>
  </div>
)

const overlay: React.CSSProperties  = { position:'fixed',inset:0,background:'rgba(0,0,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:300 }
const modal: React.CSSProperties    = { background:'#fff',borderRadius:12,width:360,padding:'28px 24px',boxShadow:'0 24px 64px rgba(0,0,0,.22)',textAlign:'center' }
const iconWrap: React.CSSProperties = { marginBottom:12 }
const iconCircle: React.CSSProperties={ width:56,height:56,background:'#FEF2F2',borderRadius:'50%',margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center' }
const ttl: React.CSSProperties      = { fontSize:15,fontWeight:700,color:'#111',margin:'0 0 8px' }
const msg: React.CSSProperties      = { fontSize:13,color:'#6b7280',marginBottom:22,lineHeight:1.6 }
const footer: React.CSSProperties   = { display:'flex',gap:10,justifyContent:'center' }
const btnCancel: React.CSSProperties= { padding:'9px 24px',background:'#f5f5f5',color:'#555',border:'1px solid #e0e0e0',borderRadius:7,fontSize:13,cursor:'pointer',fontWeight:500 }
const btnDanger: React.CSSProperties= { padding:'9px 24px',background:'#DC2626',color:'#fff',border:'none',borderRadius:7,fontSize:13,cursor:'pointer',fontWeight:600 }

export default ConfirmModal