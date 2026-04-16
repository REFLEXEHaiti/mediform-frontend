'use client';
// components/layout/Navbar.tsx — MediForm Haiti

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/lib/tenantContext';
import ClochNotifications from '@/components/notifications/ClochNotifications';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrateur', FORMATEUR: 'Formateur', APPRENANT: 'Professionnel', SPECTATEUR: 'Observateur',
};

export default function Navbar() {
  const { estConnecte, utilisateur, _hasHydrated } = useAuthStore();
  const { seDeconnecter } = useAuth();
  const { config } = useTenant();
  const pathname = usePathname();

  const [profilOuvert, setProfilOuvert] = useState(false);
  const [menuOuvert, setMenuOuvert]     = useState(false);
  const profilRef = useRef<HTMLDivElement>(null);

  const primaire    = config?.couleursTheme.primaire   ?? '#1B6B45';
  const secondaire  = config?.couleursTheme.secondaire ?? '#1E5FA8';
  const nom         = config?.nom ?? 'MediForm Haiti';
  const sloganCourt = config?.sloganCourt ?? 'SANTÉ & PARAMÉDICALE';

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (profilRef.current && !profilRef.current.contains(e.target as Node)) setProfilOuvert(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  // ✅ Quiz & Examens remplace Tournois — pas de Débats
  const liensNav = [
    { label: 'Formations',     href: '/formations' },
    { label: 'Quiz & Examens', href: '/quiz' },
    { label: 'Lives',          href: '/lives' },
    { label: 'Bibliothèque',   href: '/bibliotheque' },
  ];

  const navLinkStyle = (href: string): React.CSSProperties => ({
    fontFamily: "'Helvetica Neue',Arial,sans-serif",
    fontSize: 13,
    fontWeight: isActive(href) ? 700 : 400,
    color: isActive(href) ? primaire : '#64748B',
    textDecoration: 'none',
    padding: '6px 0',
    borderBottom: `2px solid ${isActive(href) ? primaire : 'transparent'}`,
    transition: 'color 0.15s, border-color 0.15s',
    whiteSpace: 'nowrap' as const,
  });

  const liensMenu = [
    { href: '/dashboard',                  label: '🏠 Tableau de bord' },
    { href: `/profil/${utilisateur?.id}`,  label: '👤 Mon profil' },
    { href: '/quiz',                       label: '🤖 Mes quiz & examens' },
    { href: '/premium',                    label: '⭐ Mon abonnement' },
    ...(utilisateur?.role === 'ADMIN' ? [{ href: '/admin', label: '⚙️ Administration' }] : []),
  ];

  return (
    <>
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, background: 'white', borderBottom: `1px solid #D1E7D9`, height: 64, display: 'flex', alignItems: 'center', padding: '0 clamp(16px,4vw,40px)' }}>
        <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 32 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, #0D2818, ${primaire})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: 14 }}>MF</div>
            <div>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700, color: primaire, lineHeight: 1 }}>{nom}</div>
              <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 9, color: '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{sloganCourt}</div>
            </div>
          </Link>

          {/* Nav desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1 }} className="nav-desktop">
            {liensNav.map(({ label, href }) => (
              <Link key={href} href={href} style={navLinkStyle(href)}>{label}</Link>
            ))}
          </div>

          {/* Actions droite */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto', flexShrink: 0 }}>
            <button onClick={() => setMenuOuvert(v => !v)} className="nav-burger"
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: primaire, padding: 4 }}>☰</button>

            {!_hasHydrated ? null : estConnecte ? (
              <>
                <ClochNotifications />
                <div style={{ position: 'relative' }} ref={profilRef}>
                  <button onClick={() => setProfilOuvert(v => !v)}
                    style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, #0D2818, ${primaire})`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: 14, color: 'white' }}>
                    {(utilisateur?.prenom?.[0] ?? '') + (utilisateur?.nom?.[0] ?? '')}
                  </button>
                  {profilOuvert && (
                    <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'white', border: '1px solid #D1E7D9', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', minWidth: 230, zIndex: 300, overflow: 'hidden' }}>
                      <div style={{ padding: '14px 16px', borderBottom: '1px solid #E8F5ED', background: '#F4FAF6' }}>
                        <div style={{ fontFamily: 'Georgia,serif', fontSize: 15, fontWeight: 700, color: '#0D2818' }}>{utilisateur?.prenom} {utilisateur?.nom}</div>
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{utilisateur?.email}</div>
                        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: primaire, fontWeight: 700, marginTop: 4 }}>{ROLE_LABEL[utilisateur?.role ?? ''] ?? utilisateur?.role}</div>
                      </div>
                      {liensMenu.map(({ href, label }) => (
                        <Link key={href} href={href} onClick={() => setProfilOuvert(false)}
                          style={{ display: 'block', padding: '11px 16px', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #F0FAF4' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F4FAF6'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                          {label}
                        </Link>
                      ))}
                      <button onClick={() => { setProfilOuvert(false); seDeconnecter(); }}
                        style={{ display: 'block', width: '100%', padding: '11px 16px', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/connexion" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 600, color: primaire, textDecoration: 'none', padding: '8px 16px', border: `2px solid ${primaire}`, borderRadius: 6 }}>Connexion</Link>
                <Link href="/auth/inscription" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 700, color: 'white', textDecoration: 'none', padding: '8px 16px', background: primaire, borderRadius: 6 }}>S'inscrire</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Menu mobile */}
      {menuOuvert && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.5)' }} onClick={() => setMenuOuvert(false)}>
          <div style={{ position: 'absolute', top: 64, left: 0, right: 0, background: 'white', borderBottom: '1px solid #D1E7D9', padding: '8px 24px 16px' }}
            onClick={e => e.stopPropagation()}>
            {liensNav.map(({ label, href }) => (
              <Link key={href} href={href} onClick={() => setMenuOuvert(false)}
                style={{ display: 'block', padding: '13px 0', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, fontWeight: isActive(href) ? 700 : 400, color: isActive(href) ? primaire : '#374151', textDecoration: 'none', borderBottom: '1px solid #F0FAF4' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:768px){.nav-desktop{display:none!important;}.nav-burger{display:flex!important;}}
      `}</style>
    </>
  );
}
