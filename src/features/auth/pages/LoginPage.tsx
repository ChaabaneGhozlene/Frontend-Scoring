import { useState, useEffect, useRef } from 'react'
import { useNavigate }                  from 'react-router-dom'
import { loginRequest }                 from '../authSlice'
import type { RootState }               from '../../../app/store'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { ROUTES }                       from '../../../constants/routes'
import logo                             from '../../../assets/logo.png'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error, token } = useAppSelector((state: RootState) => state.auth)

  const [login,    setLogin]    = useState('')
  const [password, setPassword] = useState('')
  const [visible,  setVisible]  = useState(false)
  const [ready,    setReady]    = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setTimeout(() => setReady(true), 80) }, [])
  useEffect(() => { if (ready) inputRef.current?.focus() }, [ready])
  useEffect(() => { if (token) navigate(ROUTES.DASHBOARD, { replace: true }) }, [token, navigate])

  const handleSubmit = () => {
    if (!login.trim() || !password.trim()) return
    dispatch(loginRequest({ Login: login.trim(), Password: password }))
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap');

        body { font-family: 'DM Sans', sans-serif; }

        @keyframes blobPulse {
          0%,100% { transform: translate(-50%,-50%) scale(1); opacity: .9; }
          50%      { transform: translate(-50%,-50%) scale(1.18); opacity: .55; }
        }
        @keyframes blobPulse2 {
          0%,100% { transform: translate(-20%,-70%) scale(1); opacity: .35; }
          50%      { transform: translate(-20%,-70%) scale(1.25); opacity: .15; }
        }
        @keyframes rotateSlow {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes rotateSlow2 {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(-360deg); }
        }
        @keyframes floatA {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes floatB {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes floatC {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes barSlide {
          0%   { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        @keyframes secPulse {
          0%,100% { box-shadow: 0 0 0 3px rgba(34,197,94,.18); }
          50%      { box-shadow: 0 0 0 6px rgba(34,197,94,.07); }
        }
        @keyframes errShake {
          0%,100% { transform: translateX(0); }
          20%,60% { transform: translateX(-4px); }
          40%,80% { transform: translateX(4px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lineGrow {
          from { height: 0; opacity: 0; }
          to   { height: 55%; opacity: .55; }
        }

        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-dm       { font-family: 'DM Sans', sans-serif; }

        .bar-animated {
          height: 3.5px;
          background: linear-gradient(90deg, #991b1b, #dc2626, #ef4444, #fca5a5, #ef4444, #dc2626, #991b1b);
          background-size: 300% 100%;
          animation: barSlide 4s linear infinite;
        }
        .blob-main {
          position: absolute; width: 560px; height: 560px; border-radius: 50%;
          background: radial-gradient(circle at 40% 40%, rgba(220,38,38,.18) 0%, transparent 65%);
          top: 50%; left: 50%;
          animation: blobPulse 7s ease-in-out infinite;
        }
        .blob-secondary {
          position: absolute; width: 320px; height: 320px; border-radius: 50%;
          background: radial-gradient(circle at 60% 60%, rgba(239,68,68,.12) 0%, transparent 60%);
          top: 20%; left: 10%;
          animation: blobPulse2 9s ease-in-out infinite;
        }
        .ring-spin {
          position: absolute; width: 420px; height: 420px; border-radius: 50%;
          border: 1px dashed rgba(220,38,38,.14);
          top: 50%; left: 50%;
          animation: rotateSlow 30s linear infinite;
        }
        .ring-spin2 {
          position: absolute; width: 300px; height: 300px; border-radius: 50%;
          border: 1px dashed rgba(220,38,38,.09);
          top: 50%; left: 50%;
          animation: rotateSlow2 20s linear infinite;
        }
        .lp-vignette {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse at 50% 115%, rgba(0,0,0,.65) 0%, transparent 60%);
        }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(0,0,0,.07) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .secure-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #22c55e;
          box-shadow: 0 0 0 3px rgba(34,197,94,.18);
          animation: secPulse 2.5s ease infinite;
          flex-shrink: 0;
        }
        .err-shake { animation: errShake .4s ease; }
        .fade-up { opacity: 0; }
        .fade-up.ready { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) forwards; }
        .field-lift:focus-within { transform: translateY(-1px); }
        .field-lift:focus-within .field-icon { color: #dc2626; }
        .title-underline { position: relative; display: inline-block; }
        .title-underline::after {
          content: ''; position: absolute; bottom: 2px; left: 0; right: 0;
          height: 3px; background: linear-gradient(90deg, #dc2626, #fca5a5);
          border-radius: 2px; opacity: .35;
        }
        .eyebrow-line::before {
          content: ''; display: inline-block; width: 18px; height: 2px;
          background: #dc2626; border-radius: 2px;
          margin-right: 7px; vertical-align: middle;
        }
        .badge-float-a { animation: floatA 4s ease-in-out infinite; }
        .badge-float-b { animation: floatB 5s ease-in-out infinite; animation-delay: .8s; }
        .badge-float-c { animation: floatC 4.5s ease-in-out infinite; animation-delay: 1.5s; }

        /* ── Mobile top banner ── */
        .mobile-banner {
          background: #0e0e0e;
          position: relative; overflow: hidden;
        }
        .mobile-blob {
          position: absolute; width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle at 40% 40%, rgba(220,38,38,.2) 0%, transparent 65%);
          top: 50%; left: 50%; transform: translate(-50%, -50%);
          animation: blobPulse 7s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen w-screen flex flex-col lg:flex-row font-dm overflow-x-hidden">

        {/* ══════════════════════════════════════
            MOBILE TOP BANNER  (< lg only)
        ══════════════════════════════════════ */}
        <div className="mobile-banner lg:hidden w-full py-8 px-6 flex flex-col items-center gap-4">
          <div className="mobile-blob" />
          {/* subtle grid — inline style car opacity fractionnaire */}
          <div className="absolute inset-0 pointer-events-none opacity-60" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />

          {/* Logo */}
          <div className="relative z-10 bg-white rounded-xl px-5 py-3 inline-flex items-center justify-center"
            style={{ boxShadow: '0 6px 24px rgba(0,0,0,.5)' }}>
            <img src={logo} alt="Recordingtool" className="h-8 sm:h-10 w-auto object-contain" />
          </div>

          {/* Tagline */}
          <div className="relative z-10 text-center">
            <h2 className="font-playfair text-xl sm:text-2xl font-extrabold text-white leading-tight">
              L'outil qui <em className="text-red-400 not-italic">enregistre</em>,<br className="hidden sm:block" /> vous qui décidez.
            </h2>
            <p className="text-[11px] text-white/35 mt-1.5 tracking-wide">Plateforme professionnelle de gestion</p>
          </div>

          {/* Mini stats row */}
          <div className="relative z-10 flex gap-5 sm:gap-8 mt-1">
            {[
              { num: '99', unit: '%', label: 'Dispo' },
              { num: '256', unit: 'b', label: 'SSL' },
              { num: '24', unit: '/7', label: 'Support' },
            ].map(({ num, unit, label }) => (
              <div key={label} className="text-center">
                <div className="font-playfair text-base font-bold text-white">
                  {num}<span className="text-red-400">{unit}</span>
                </div>
                <div className="text-[9px] tracking-widest uppercase text-white/25 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════
            LEFT PANEL  (lg+ only)
        ══════════════════════════════════════ */}
        <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] h-screen bg-[#0e0e0e] flex-col items-center justify-center relative overflow-hidden shrink-0">

          {/* Background grid — inline car valeurs fractionnaires */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }} />
          <div className="blob-main" />
          <div className="blob-secondary" />
          <div className="ring-spin" />
          <div className="ring-spin2" />

          {/* Cercles décoratifs — inline car tailles arbitraires sans équivalent Tailwind */}
          <div className="absolute rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: 510, height: 510, border: '1px solid rgba(255,255,255,.03)' }} />
          <div className="absolute rounded-full border border-red-600/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: 200, height: 200 }} />

          {/* Diagonal accent lines */}
          <div className="absolute opacity-50" style={{
            width: '1.5px', height: '55%',
            background: 'linear-gradient(to bottom, transparent, #dc2626 25%, #ef4444 75%, transparent)',
            transform: 'rotate(22deg)', left: '63%', top: '22%', filter: 'blur(.4px)',
          }} />
          <div className="absolute opacity-25" style={{
            width: '1px', height: '35%',
            background: 'linear-gradient(to bottom, transparent, #f87171 40%, transparent)',
            transform: 'rotate(22deg)', left: '67%', top: '32%',
          }} />

          {/* Corner glows */}
          <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 100% 0%, rgba(220,38,38,.12) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 0% 100%, rgba(185,28,28,.1) 0%, transparent 65%)' }} />
          <div className="lp-vignette" />

          {/* ── Floating badges ── */}

          {/* Badge SSL — bg/border inline car opacités fractionnaires */}
          <div className="badge-float-a absolute left-7 top-[18%] flex items-center gap-2.5 backdrop-blur-sm rounded-2xl px-4 py-2.5"
            style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)' }}>
            <div className="w-7 h-7 rounded-lg bg-red-600/20 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-white/80 leading-none">Sécurisé SSL</div>
              <div className="text-[10px] text-white/35 mt-0.5">Chiffrement 256-bit</div>
            </div>
          </div>

          {/* Badge Temps réel */}
          <div className="badge-float-b absolute right-6 bottom-[22%] flex items-center gap-2.5 backdrop-blur-sm rounded-2xl px-4 py-2.5"
            style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)' }}>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-white/80 leading-none">Temps réel</div>
              <div className="text-[10px] text-white/35 mt-0.5">Sync instantanée</div>
            </div>
          </div>

          {/* Badge En ligne */}
          <div className="badge-float-c absolute right-8 top-[14%] flex items-center gap-2 bg-red-600/10 border border-red-500/20 rounded-xl px-3 py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[10px] text-red-300/80 font-medium tracking-wide">En ligne</span>
          </div>

          {/* ── Main content ── */}
          <div className="relative z-10 flex flex-col items-center text-center px-10 xl:px-14">

            {/* Logo card */}
            <div className="bg-white rounded-2xl px-7 mb-10 inline-flex items-center justify-center transition-all duration-300 hover:-translate-y-1 group"
              style={{
                paddingTop: 18, paddingBottom: 18,
                boxShadow: '0 0 0 1px rgba(255,255,255,.05), 0 8px 32px rgba(0,0,0,.6), 0 2px 8px rgba(0,0,0,.4)',
              }}>
              {/* w-[150px] xl:w-[165px] → style inline car pas d'équivalent Tailwind exact */}
              <img src={logo} alt="Recordingtool"
                className="h-auto object-contain block transition-transform duration-300 group-hover:scale-[1.02]"
                style={{ width: 150 }}
              />
            </div>

            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-8" style={{ background: 'linear-gradient(to right, transparent, rgba(239,68,68,.5))' }} />
              <p className="text-[10px] tracking-[3px] uppercase text-red-400/60 font-semibold">Plateforme pro</p>
              <div className="h-px w-8" style={{ background: 'linear-gradient(to left, transparent, rgba(239,68,68,.5))' }} />
            </div>

            {/* Title */}
            <h2 className="font-playfair text-[28px] xl:text-[32px] font-extrabold text-white leading-tight tracking-tight">
              L'outil qui{' '}
              <span className="text-red-400 italic">enregistre</span>,
              <br />
              <span className="text-white/90">vous qui décidez.</span>
            </h2>

            {/* Subtitle — max-w-[230px] → inline car pas d'équivalent exact */}
            <p className="mt-3.5 text-[12.5px] text-white/35 font-light tracking-wide leading-relaxed"
              style={{ maxWidth: 230 }}>
              Gestion professionnelle de vos enregistrements en toute sécurité.
            </p>

            {/* Divider */}
            <div className="flex items-center gap-3 mt-6">
              <div className="h-px w-10" style={{ background: 'linear-gradient(to right, transparent, rgba(220,38,38,.4))' }} />
              <div className="w-1 h-1 rounded-full bg-red-500/60" />
              <div className="h-px w-10" style={{ background: 'linear-gradient(to left, transparent, rgba(220,38,38,.4))' }} />
            </div>

            {/* Stats */}
            <div className="flex gap-7 mt-7">
              {[
                { num: '99', unit: '%', label: 'Disponibilité' },
                { num: '256', unit: 'b', label: 'Chiffrement' },
                { num: '24', unit: '/7', label: 'Support' },
              ].map(({ num, unit, label }) => (
                <div key={label} className="text-center group cursor-default">
                  <div className="font-playfair text-[22px] font-bold text-white group-hover:text-red-300 transition-colors duration-300">
                    {num}<span className="text-red-400">{unit}</span>
                  </div>
                  <div className="text-[9px] tracking-[2px] uppercase text-white/25 mt-1 group-hover:text-white/40 transition-colors duration-300">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Copyright */}
            <p className="mt-8 text-[10px] text-white/20 tracking-widest uppercase font-light">
              © 2026 · Recordingtool
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════
            RIGHT PANEL — FORM
        ══════════════════════════════════════ */}
        <div className="flex-1 flex items-center justify-center bg-[#f0f0f0] relative
          px-4 py-8
          sm:px-8 sm:py-10
          lg:px-8 lg:py-0 lg:h-screen lg:overflow-y-auto">

          {/* Dot grid */}
          <div className="dot-grid absolute inset-0 opacity-50 pointer-events-none" />

          {/* Form wrapper — sm:max-w-[400px] → sm:max-w-md (448px, différence minime) */}
          <div className={`fade-up w-full relative z-10 max-w-sm sm:max-w-md ${ready ? 'ready' : ''}`}>

            {/* Card */}
            <div className="bg-white rounded-2xl sm:rounded-[22px] overflow-hidden"
              style={{ boxShadow: '0 1px 0 rgba(255,255,255,.8) inset, 0 4px 6px rgba(0,0,0,.04), 0 16px 48px rgba(0,0,0,.10), 0 32px 80px rgba(0,0,0,.06)' }}>

              {/* Animated gradient bar */}
              <div className="bar-animated" />

              <div className="px-6 pt-7 pb-6 sm:px-9 sm:pt-9 sm:pb-8">

                {/* Logo inside form */}
                <div className="flex items-center justify-center mb-5 sm:mb-6 pb-4 sm:pb-5 border-b border-gray-100">
                  <img src={logo} alt="Recordingtool"
                    className="h-10 sm:h-14 w-auto object-contain" />
                </div>

                {/* Header */}
                <p className="eyebrow-line text-[10px] font-semibold tracking-[2.5px] uppercase text-red-600 mb-2 sm:mb-2.5 flex items-center">
                  Authentification
                </p>
                <p className="text-[12px] sm:text-[13px] text-gray-400 mb-5 sm:mb-6">
                  Connectez-vous à votre espace
                </p>

                {/* Error */}
                {error && (
                  <div className="err-shake flex items-start gap-2.5 border border-red-200 border-l-[3px] border-l-red-600 rounded-xl px-3 sm:px-3.5 py-3 mb-4 sm:mb-5"
                    style={{ background: 'linear-gradient(to bottom right, #fef2f2, #ffffff)' }}>
                    <svg className="shrink-0 mt-px text-red-600" width="15" height="15" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                    <p className="text-[13px] text-red-700 leading-snug">{error}</p>
                  </div>
                )}

                {/* Identifiant */}
                <div className="mb-3 sm:mb-3.5">
                  <label className="block text-[10px] sm:text-[11px] font-semibold tracking-[1.8px] uppercase text-gray-400 mb-1.5 sm:mb-2">
                    Identifiant
                  </label>
                  <div className="field-lift relative transition-transform duration-150">
                    <span className="field-icon absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none text-gray-300 transition-colors duration-200"
                      style={{ ['--sm-left' as string]: '15px' }}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      placeholder="Votre identifiant"
                      className={`w-full border-[1.5px] rounded-xl sm:rounded-[13px] pl-10 sm:pl-11 pr-3.5 py-3 sm:py-3.5 font-dm text-sm text-[#111] bg-gray-50 outline-none transition-all duration-200 placeholder:text-gray-300
                        focus:border-red-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(220,38,38,.09)]
                        ${error ? 'border-red-200' : 'border-gray-200'}`}
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div className="mb-3 sm:mb-3.5">
                  <label className="block text-[10px] sm:text-[11px] font-semibold tracking-[1.8px] uppercase text-gray-400 mb-1.5 sm:mb-2">
                    Mot de passe
                  </label>
                  <div className="field-lift relative transition-transform duration-150">
                    <span className="field-icon absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none text-gray-300 transition-colors duration-200">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                    </span>
                    <input
                      type={visible ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      placeholder="••••••••••"
                      className={`w-full border-[1.5px] rounded-xl sm:rounded-[13px] pl-10 sm:pl-11 pr-11 py-3 sm:py-3.5 font-dm text-sm text-[#111] bg-gray-50 outline-none transition-all duration-200 placeholder:text-gray-300
                        focus:border-red-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(220,38,38,.09)]
                        ${error ? 'border-red-200' : 'border-gray-200'}`}
                    />
                    <button
                      onClick={() => setVisible(!visible)}
                      tabIndex={-1}
                      className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-all duration-200"
                    >
                      {visible ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !login.trim() || !password.trim()}
                  className="w-full mt-4 sm:mt-5 flex items-center justify-center gap-2.5 rounded-xl sm:rounded-[13px] border-none cursor-pointer font-dm text-sm sm:text-[14.5px] font-semibold text-white
                    transition-all duration-200
                    hover:enabled:-translate-y-0.5
                    active:enabled:translate-y-0
                    disabled:bg-none disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
                  style={{
                    paddingTop: 14, paddingBottom: 14,
                    background: loading || !login.trim() || !password.trim()
                      ? undefined
                      : 'linear-gradient(to bottom right, #dc2626, #b91c1c)',
                    boxShadow: loading || !login.trim() || !password.trim()
                      ? 'none'
                      : '0 4px 16px rgba(220,38,38,.35), 0 1px 0 rgba(255,255,255,.12) inset',
                  }}
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Connexion en cours…
                    </>
                  ) : (
                    <>
                      Se connecter
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                      </svg>
                    </>
                  )}
                </button>

                {/* Footer */}
                <div className="mt-4 sm:mt-5 pt-3.5 sm:pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] text-gray-300">© 2026 Recordingtool</span>
                  <div className="flex items-center gap-1.5">
                    <div className="secure-dot" />
                    <span className="text-[10px] sm:text-[11px] text-gray-400">Connexion sécurisée</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}