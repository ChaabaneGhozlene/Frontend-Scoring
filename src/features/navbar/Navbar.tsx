import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation }            from 'react-router-dom'
import { useAppDispatch, useAppSelector }      from '../../app/hooks'
import { logout }                              from '../auth/authSlice'
import { ROUTES }                              from '../../constants/routes'
import { resetDates } from '../recordings/Recordingslice'
import logo                                    from '../../assets/logo.png'

interface DropdownItem { label: string; route: string,  roles: string[]   // ← ajouter
}
interface NavItem {
  label:     string
  route?:    string
  dropdown?: DropdownItem[]
    roles?:    string[]          // ← ajouter

}

// Définir quels rôles peuvent voir chaque item
// (undefined = tout le monde)
const NAV_ITEMS: NavItem[] = [
  { 
    label: 'Tableau de Bord',           
    route: ROUTES.DASHBOARD,
    roles: ['SuperAdmin','Admin','Supervisor','Agent']
  },
  { 
    label: 'Liste des Enregistrements', 
    route: ROUTES.RECORDINGS,
    roles: ['SuperAdmin','Admin','Supervisor','Agent']
  },
  { 
    label: 'Evaluation',                
    route: ROUTES.EVALUATION,
    roles: ['SuperAdmin','SuperUser','Admin','Supervisor']
  },
  { 
    label: "Liste d'Evaluations",       
    route: ROUTES.EVALUATIONS_LIST,
    roles: ['SuperAdmin','SuperUser','Admin','Supervisor']
  },
  {
    label: 'Statistiques',
    roles: ['SuperAdmin','SuperUser','Admin','Supervisor'],
    dropdown: [
      { label: 'Vue Générale',                route: ROUTES.STATISTICS , roles: ['SuperAdmin','SuperUser','Admin','Supervisor'] },
      { label: 'Statistiques Personnalisées', route: ROUTES.STATISTICS_CUSTOM, roles: ['SuperAdmin','SuperUser','Admin','Supervisor'] },
    ],
  },
  {
    label: 'Configuration',
    roles: ['SuperAdmin','Supervisor','Admin'],
    dropdown: [
  {
      label: 'Configuration campagnes',
      route: ROUTES.CONFIGURATION_CAMPAIGNS,
    roles: ['SuperAdmin','Admin'],
  },
          { label: 'Configuration équipes',        route: ROUTES.CONFIGURATION_AGENTS,    roles: ['SuperAdmin','Supervisor','Admin'],
            },

      { label: 'Configuration détails agent',   route: ROUTES.CONFIGURATION_AGENTS_DETAILS ,    roles: ['SuperAdmin','Supervisor','Admin'],
        },

    ],
  },
  { 
    label: 'Users', 
    route: ROUTES.USERS,
    roles: ['SuperAdmin']  // ← Admin+ seulement
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Clé unique pour identifier un item avec dropdown (on utilise la route du 1er sous-item) */
const dropdownKey = (item: NavItem) =>
  item.dropdown ? item.dropdown[0].route : null

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    style={{
      width: 10, height: 10,
      transition: 'transform .2s',
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      opacity: .55, flexShrink: 0,
    }}
    fill="currentColor" viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
)

const LogoutIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

// ── Component ─────────────────────────────────────────────────────────────────

const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((s) => s.auth)

  // On stocke la clé du dropdown ouvert (= route du 1er sous-item), pas le label
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [logoError,    setLogoError]    = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node))
        setOpenDropdown(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNavClick = (item: NavItem) => {
    if (item.dropdown) {
      const key = dropdownKey(item)!
      setOpenDropdown(openDropdown === key ? null : key)
    } else if (item.route) {
      navigate(item.route)
      setOpenDropdown(null)
    }
  }

  const isActive = (item: NavItem) => {
    if (item.route)    return location.pathname === item.route
    if (item.dropdown) return item.dropdown.some(d => location.pathname === d.route)
    return false
  }

  const initials = user?.userLogin ? user.userLogin.slice(0, 2).toUpperCase() : '?'
 const userRole = user?.userRole ?? 'Agent'  // fallback sécurisé

// Filtrer les items visibles
const visibleItems = NAV_ITEMS.filter(item => 
  !item.roles || item.roles.includes(userRole)
)
  return (
    <header style={{
      position:   'sticky',
      top:        0,
      zIndex:     50,
      width:      '100%',
      background: '#ffffff',
      boxShadow:  '0 1px 0 #e5e7eb, 0 4px 16px rgba(0,0,0,.07)',
      boxSizing:  'border-box',
    }}>

      {/* ── Top bar ── */}
      <div style={{
        width:          '100%',
        boxSizing:      'border-box',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '10px 28px',
        borderBottom:   '1px solid #f0f0f0',
      }}>

        {/* Logo */}
        <div
          style={{ display:'flex', alignItems:'center', gap:12, cursor:'pointer', userSelect:'none', flexShrink:0 }}
          onClick={() => navigate(ROUTES.DASHBOARD)}
        >
          {!logoError ? (
            <img
              src={logo}
              alt="Recordingtool logo"
              style={{ height:64, width:'auto', objectFit:'contain', display:'block' }}
              onError={() => setLogoError(true)}
            />
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="7" fill="#DC2626"/>
                <circle cx="16" cy="16" r="6" stroke="white" strokeWidth="2.2"/>
                <circle cx="16" cy="16" r="2.5" fill="white"/>
                <path d="M16 5v4M16 23v4M5 16h4M23 16h4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize:16, fontWeight:700, color:'#111827', letterSpacing:'-0.3px' }}>
                Recording<span style={{ color:'#DC2626' }}>tool</span>
              </span>
            </div>
          )}
        </div>

        {/* Right — avatar + logout */}
        <div style={{ display:'flex', alignItems:'center', gap:18, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:36, height:36, borderRadius:'50%',
              background:'linear-gradient(135deg,#FEE2E2,#FECACA)',
              color:'#DC2626', display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:13, fontWeight:700,
              border:'2px solid #FECACA', flexShrink:0,
            }}>
              {initials}
            </div>
            <span style={{ fontSize:13, color:'#6b7280', whiteSpace:'nowrap' }}>
              Bienvenue&nbsp;<strong style={{ color:'#111827', fontWeight:600 }}>{user?.userLogin ?? '—'}</strong>
            </span>
          </div>

          <div style={{ width:1, height:22, background:'#e5e7eb', flexShrink:0 }} />

          <button
            style={{ display:'flex', alignItems:'center', gap:7, fontSize:13, color:'#6b7280', cursor:'pointer', background:'none', border:'none', padding:'6px 12px', borderRadius:7, transition:'all .15s', whiteSpace:'nowrap' }}
            onMouseEnter={e => { const b = e.currentTarget; b.style.color='#DC2626'; b.style.background='#FFF5F5' }}
            onMouseLeave={e => { const b = e.currentTarget; b.style.color='#6b7280'; b.style.background='none' }}
            onClick={() => {
              dispatch(logout())
              dispatch(resetDates())
              navigate(ROUTES.LOGIN)
            }}
          >
            <LogoutIcon />
            Déconnexion
          </button>
        </div>
      </div>

      {/* ── Nav bar ── */}
      <div ref={navRef} style={{
        width:      '100%',
        boxSizing:  'border-box',
        display:    'flex',
        alignItems: 'center',
        padding:    '0 16px',
  overflow:   'visible',   // ✅ ajouter
        background: '#fff',
      }}>
        {visibleItems.map(item => {
          const active = isActive(item)
          // On compare la clé unique (route du 1er sous-item) au lieu du label
          const open   = item.dropdown ? openDropdown === dropdownKey(item) : false

          return (
            <div key={item.label} style={{ position:'relative', flexShrink:0 }}>
              <button
                onClick={() => handleNavClick(item)}
                style={{
                  display:'flex', alignItems:'center', gap:5,
                  padding:'13px 16px', fontSize:13,
                  fontWeight: active ? 600 : 500,
                  whiteSpace:'nowrap', cursor:'pointer',
                  background: active ? '#FFF5F5' : 'none',
                  border:'none',
                  borderBottom: active ? '2px solid #DC2626' : '2px solid transparent',
                  color: active ? '#DC2626' : '#4b5563',
                  transition:'all .15s', userSelect:'none',
                }}
                onMouseEnter={e => { if (!active) { const b = e.currentTarget; b.style.color='#DC2626'; b.style.background='#FFF5F5' }}}
                onMouseLeave={e => { if (!active) { const b = e.currentTarget; b.style.color='#4b5563'; b.style.background='none' }}}
              >
                {item.label}
                {item.dropdown && <Chevron open={open} />}
              </button>

              {item.dropdown && open && (
                <div style={{
                  position:'absolute', top:'100%', left:0, zIndex:100,
                  minWidth:200, background:'#fff',
                  border:'1px solid #e5e7eb', borderTop:'none',
                  borderRadius:'0 0 8px 8px',
                  boxShadow:'0 8px 28px rgba(0,0,0,.10)',
                  overflow:'hidden',
                }}>
                  {item.dropdown
                  .filter(sub => !sub.roles || sub.roles.includes(userRole))
                  .map(sub => {
                    const subActive = location.pathname === sub.route
                    return (
                      <button
                        key={sub.route}
                        style={{
                          display:'block', width:'100%', textAlign:'left',
                          padding:'11px 20px', fontSize:13,
                          fontWeight: subActive ? 600 : 400,
                          color: subActive ? '#DC2626' : '#374151',
                          background: subActive ? '#FFF5F5' : 'none',
                          border:'none', cursor:'pointer', transition:'background .1s',
                        }}
                        onMouseEnter={e => { if (!subActive) (e.currentTarget as HTMLButtonElement).style.background='#f9fafb' }}
                        onMouseLeave={e => { if (!subActive) (e.currentTarget as HTMLButtonElement).style.background='none' }}
                        onClick={() => { navigate(sub.route); setOpenDropdown(null) }}
                      >
                        {sub.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

    </header>
  )
}

export default Navbar