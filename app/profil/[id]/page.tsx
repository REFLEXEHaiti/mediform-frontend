// app/profil/[id]/page.tsx — TechPro Haiti
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const VERT = '#1B3A6B';
const ROLE_LABEL: Record<string, string> = { ADMIN: 'Administrateur', FORMATEUR: 'Formateur', APPRENANT: 'Développeur', SPECTATEUR: 'Observateur' };

export default function PageProfil() {
  const { id } = useParams() as { id: string };
  const { utilisateur: moi } = useAuthStore();
  const [profil, setProfil]       = useState<any>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api.get(`/profils/${id}`).then(({ data }) => setProfil(data)).catch(() => {}).finally(() => setChargement(false));
  }, [id]);

  if (chargement) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: `3px solid #EBF3FB`, borderTopColor: VERT, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!profil) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>👤</div>
      <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 700 }}>Profil introuvable</h2>
      <Link href="/classement" style={{ color: VERT, fontFamily: "'Inter',sans-serif", fontSize: 14 }}>← Classement</Link>
    </div>
  );

  const initiales = (profil.prenom?.[0] ?? '') + (profil.nom?.[0] ?? '');
  const estMoi    = moi?.id === id;

  return (
    <div style={{ background: '#F8FAFB', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${VERT} 0%, #0D4D2E 100%)`, padding: 'clamp(40px,5vw,64px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 32, color: 'white', border: '3px solid rgba(255,255,255,0.3)', flexShrink: 0 }}>
            {initiales.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, color: 'white', margin: '0 0 6px' }}>
              {profil.prenom} {profil.nom}
            </h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', fontSize: 12, padding: '3px 12px', borderRadius: 100, fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>
                {ROLE_LABEL[profil.role] ?? profil.role}
              </span>
              {profil.ville && (
                <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', fontSize: 12, padding: '3px 12px', borderRadius: 100, fontFamily: "'Inter',sans-serif" }}>
                  📍 {profil.ville}
                </span>
              )}
            </div>
            {profil.bio && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>{profil.bio}</p>}
          </div>
          {estMoi && (
            <Link href="/profil/modifier" style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, textDecoration: 'none', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
              Modifier
            </Link>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(24px,4vw,40px) clamp(20px,5vw,48px)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Stats */}
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: '20px 24px' }}>
          <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, fontWeight: 700, color: '#0D1F2D', margin: '0 0 16px' }}>Activité</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Formations inscrites', value: profil._count?.inscriptions ?? 0 },
              { label: 'Messages postés',       value: profil._count?.messages ?? 0 },
              { label: 'Votes donnés',           value: profil._count?.votes ?? 0 },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F8FAFB' }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#64748B' }}>{label}</span>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 700, color: VERT }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Badges et points */}
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: '20px 24px' }}>
          <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, fontWeight: 700, color: '#0D1F2D', margin: '0 0 16px' }}>
            Badges & Points
          </h3>
          {profil.points && (
            <div style={{ background: '#EBF3FB', borderRadius: 10, padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 24, fontWeight: 800, color: VERT }}>{profil.points.points}</div>
              <div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#064E3B' }}>points</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#94A3B8' }}>Niveau {profil.points.niveau}</div>
              </div>
            </div>
          )}
          {profil.badges?.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {profil.badges.map((b: any) => (
                <span key={b.id} title={b.description} style={{ background: `${VERT}12`, color: VERT, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100, fontFamily: "'Inter',sans-serif" }}>
                  🏅 {b.titre}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#94A3B8' }}>Aucun badge encore obtenu.</p>
          )}
        </div>
      </div>
    </div>
  );
}
