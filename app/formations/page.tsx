// app/formations/[id]/page.tsx — MediForm Haiti
// ⚠️ SPÉCIFIQUE À MEDIFORM HAITI

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import ModalPaiement from '@/components/paiement/ModalPaiement';

const VERT = '#1B6B45';
const BLEU = '#1E5FA8';

const NIV: Record<string, { bg: string; text: string; label: string }> = {
  DEBUTANT:      { bg: '#DCFCE7', text: '#166534', label: 'Débutant' },
  INTERMEDIAIRE: { bg: '#DBEAFE', text: '#1E40AF', label: 'Intermédiaire' },
  AVANCE:        { bg: '#F3E8FF', text: '#6B21A8', label: 'Avancé' },
};

export default function PageFormationDetail() {
  const { id } = useParams() as { id: string };
  const { estConnecte, utilisateur } = useAuthStore();
  const router = useRouter();

  const [formation,   setFormation]   = useState<any>(null);
  const [chargement,  setChargement]  = useState(true);
  const [modal,       setModal]       = useState(false);
  const [inscrit,     setInscrit]     = useState(false);
  const [progression, setProgression] = useState<any>(null);

  useEffect(() => {
    api.get(`/cours/${id}`).then(({ data }) => setFormation(data)).catch(() => {}).finally(() => setChargement(false));
    if (estConnecte) api.get(`/cours/${id}/progression`).then(({ data }) => setProgression(data)).catch(() => {});
  }, [id, estConnecte]);

  const sInscrire = async () => {
    if (!estConnecte) { router.push('/auth/inscription'); return; }
    try { await api.post(`/cours/${id}/inscrire`, {}); setInscrit(true); } catch {}
  };

  if (chargement) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: `3px solid #E8F5ED`, borderTopColor: VERT, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!formation) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🩺</div>
      <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 22, fontWeight: 700 }}>Formation introuvable</h2>
      <Link href="/formations" style={{ color: VERT, fontFamily: "'Inter',sans-serif", fontSize: 14 }}>← Retour aux formations</Link>
    </div>
  );

  const niv = NIV[formation.niveau] ?? NIV['DEBUTANT'];
  const pct = progression?.pourcentage ?? 0;
  const dejaInscrit = inscrit || progression?.terminees !== undefined;

  return (
    <div style={{ background: '#F8FAFB', minHeight: '100vh' }}>
      {modal && <ModalPaiement montantHTG={600} description={formation.titre} plan="PREMIUM" onFermer={() => setModal(false)} onSucces={() => { setModal(false); setInscrit(true); }} />}

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${VERT} 0%, #0D4D2E 100%)`, padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,56px)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'start' }}>
          <div>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, fontFamily: "'Inter',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              <Link href="/formations" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Formations</Link>
              <span>/</span>
              <span style={{ color: 'rgba(255,255,255,0.8)' }}>{formation.categorie}</span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ background: niv.bg, color: niv.text, fontSize: 11, padding: '3px 12px', borderRadius: 100, fontFamily: "'Inter',sans-serif", fontWeight: 700 }}>{niv.label}</span>
              {formation.categorie && (
                <span style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', fontSize: 11, padding: '3px 12px', borderRadius: 100, fontFamily: "'Inter',sans-serif" }}>
                  🩺 {formation.categorie}
                </span>
              )}
            </div>

            <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 14 }}>
              {formation.titre}
            </h1>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 20, maxWidth: 560 }}>
              {formation.description}
            </p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                `📚 ${formation.lecons?.length ?? formation._count?.lecons ?? 0} leçons`,
                `👥 ${formation._count?.inscriptions ?? 0} inscrits`,
                ...(formation.createur ? [`👨‍⚕️ ${formation.createur.prenom} ${formation.createur.nom}`] : []),
              ].map(s => (
                <span key={s} style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Carte inscription */}
          <div style={{ background: 'white', borderRadius: 16, padding: '24px', minWidth: 220, boxShadow: '0 16px 48px rgba(0,0,0,0.2)', flexShrink: 0 }}>
            {dejaInscrit && progression ? (
              <>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#16A34A', fontWeight: 700, marginBottom: 8 }}>✅ Inscrit</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 28, fontWeight: 800, color: VERT, marginBottom: 8 }}>{pct}%</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#64748B', marginBottom: 10 }}>
                  {progression.terminees}/{progression.totalLecons} leçons
                </div>
                <div style={{ height: 6, background: '#E8F5ED', borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
                  <div style={{ height: '100%', background: pct === 100 ? '#16A34A' : VERT, width: `${pct}%`, borderRadius: 3, transition: 'width 0.6s' }} />
                </div>
                <Link href={`/formations/${id}/lecons/${formation.lecons?.[0]?.id ?? '1'}`}
                  style={{ display: 'block', padding: '13px', background: VERT, color: 'white', borderRadius: 10, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' as const }}>
                  {pct === 0 ? 'Commencer →' : pct === 100 ? 'Revoir →' : 'Continuer →'}
                </Link>
              </>
            ) : (
              <>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 28, fontWeight: 800, color: '#16A34A', marginBottom: 4 }}>Gratuit</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#94A3B8', marginBottom: 16 }}>✓ Accès à vie · ✓ Certificat</div>
                <button onClick={sInscrire}
                  style={{ width: '100%', padding: '13px', background: VERT, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 10, boxShadow: `0 4px 16px ${VERT}40` }}>
                  {!estConnecte ? 'S\'inscrire →' : 'Commencer gratuitement'}
                </button>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#94A3B8', textAlign: 'center', margin: 0 }}>
                  Certifié MSPP · Reconnu OIIH
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Corps */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(20px,5vw,56px)', display: 'grid', gridTemplateColumns: '1fr 240px', gap: 32 }}>
        <div>
          {/* Ce que vous apprendrez */}
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: '24px', marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 700, color: '#0D1F2D', margin: '0 0 16px' }}>
              Objectifs d'apprentissage
            </h2>
            {['Appliquer les protocoles MSPP et OMS', 'Maîtriser les soins en contexte haïtien', 'Réussir les évaluations certifiantes', 'Obtenir votre badge numérique'].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#E8F5ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={VERT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: '#374151' }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Programme */}
          {formation.lecons?.length > 0 && (
            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, padding: '24px' }}>
              <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 700, color: '#0D1F2D', margin: '0 0 20px' }}>
                Programme — {formation.lecons.length} leçons
              </h2>
              {formation.lecons.map((l: any, i: number) => {
                const termine = progression && i < (progression.terminees ?? 0);
                return (
                  <div key={l.id ?? i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: i < formation.lecons.length - 1 ? '1px solid #F8FAFB' : 'none' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: termine ? '#E8F5ED' : `${VERT}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: termine ? '#16A34A' : VERT, fontWeight: 800, flexShrink: 0 }}>
                      {termine ? '✓' : i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      {dejaInscrit ? (
                        <Link href={`/formations/${id}/lecons/${l.id}`}
                          style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 600, color: '#0D1F2D', textDecoration: 'none', display: 'block', marginBottom: 2 }}>
                          {l.titre}
                        </Link>
                      ) : (
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 600, color: '#0D1F2D', margin: '0 0 2px' }}>{l.titre}</p>
                      )}
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#94A3B8' }}>
                        ⏱ {l.dureeMin} min{l.quiz ? ' · 📝 Quiz' : ''}
                      </span>
                    </div>
                    {!dejaInscrit && i > 0 && <span style={{ color: '#CBD5E1', fontSize: 14 }}>🔒</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: '18px' }}>
            <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 700, color: '#0D1F2D', margin: '0 0 12px' }}>Certifications</h3>
            {['Validé MSPP', 'Reconnu OIIH', 'Badge numérique', 'Accès à vie'].map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: VERT, flexShrink: 0 }} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#374151' }}>{c}</span>
              </div>
            ))}
          </div>

          <div style={{ background: `linear-gradient(135deg, ${VERT}, #0D4D2E)`, borderRadius: 12, padding: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🤖</div>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.9)', margin: '0 0 12px', lineHeight: 1.5 }}>
              Besoin d'aide ? Le chatbot médical IA répond en français et créole.
            </p>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
              Cliquez sur 🤖 en bas à droite
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr auto"]{grid-template-columns:1fr!important;}div[style*="grid-template-columns: 1fr 240px"]{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
