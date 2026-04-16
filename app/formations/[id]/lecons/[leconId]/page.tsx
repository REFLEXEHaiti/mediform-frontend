// app/formations/[id]/lecons/[leconId]/page.tsx — MediForm Haiti

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const VERT = '#1B6B45';

export default function PageLecon() {
  const { id, leconId } = useParams() as { id: string; leconId: string };
  const { estConnecte } = useAuthStore();
  const router = useRouter();

  const [lecon,     setLecon]     = useState<any>(null);
  const [formation, setFormation] = useState<any>(null);
  const [chargement, setChargement] = useState(true);
  const [termine,   setTermine]   = useState(false);
  const [envoi,     setEnvoi]     = useState(false);

  useEffect(() => {
    if (!estConnecte) { router.push('/auth/connexion'); return; }
    Promise.all([
      api.get(`/lecons/${leconId}`).then(({ data }) => setLecon(data)).catch(() => {}),
      api.get(`/cours/${id}`).then(({ data }) => setFormation(data)).catch(() => {}),
    ]).finally(() => setChargement(false));
  }, [id, leconId, estConnecte]);

  const marquerTermine = async () => {
    setEnvoi(true);
    try { await api.post(`/lecons/${leconId}/terminer`, {}); setTermine(true); } catch { setTermine(true); }
    setEnvoi(false);
  };

  // Leçon suivante
  const leconSuivante = () => {
    if (!formation?.lecons) return null;
    const idx = formation.lecons.findIndex((l: any) => l.id === leconId);
    return idx >= 0 && idx < formation.lecons.length - 1 ? formation.lecons[idx + 1] : null;
  };

  if (chargement) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: `3px solid #E8F5ED`, borderTopColor: VERT, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const suivante = leconSuivante();
  const totalLecons = formation?.lecons?.length ?? 0;
  const idxActuel   = formation?.lecons?.findIndex((l: any) => l.id === leconId) ?? 0;
  const pctLu = totalLecons > 0 ? Math.round(((idxActuel + (termine ? 1 : 0)) / totalLecons) * 100) : 0;

  return (
    <div style={{ background: 'white', minHeight: '100vh' }}>
      {/* Barre de progression */}
      <div style={{ height: 4, background: '#E8F5ED', position: 'sticky', top: 64, zIndex: 10 }}>
        <div style={{ height: '100%', width: `${pctLu}%`, background: VERT, transition: 'width 0.6s ease', borderRadius: '0 2px 2px 0' }} />
      </div>

      {/* Breadcrumb sticky */}
      <div style={{ padding: '12px clamp(20px,5vw,56px)', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#94A3B8', background: 'white', position: 'sticky', top: 68, zIndex: 9 }}>
        <Link href="/formations" style={{ color: '#94A3B8', textDecoration: 'none' }}>Formations</Link>
        <span>/</span>
        <Link href={`/formations/${id}`} style={{ color: '#94A3B8', textDecoration: 'none' }}>{formation?.titre ?? 'Formation'}</Link>
        <span>/</span>
        <span style={{ color: '#0D1F2D', fontWeight: 600 }}>{lecon?.titre ?? 'Leçon'}</span>
        <span style={{ marginLeft: 'auto', background: '#E8F5ED', color: VERT, padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
          {idxActuel + 1}/{totalLecons}
        </span>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(20px,5vw,56px)', display: 'grid', gridTemplateColumns: '1fr 220px', gap: 40 }}>

        {/* Contenu principal */}
        <div>
          <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(22px,3.5vw,30px)', fontWeight: 800, color: '#0D1F2D', lineHeight: 1.3, marginBottom: 8 }}>
            {lecon?.titre ?? 'Chargement…'}
          </h1>
          {lecon?.dureeMin && (
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#94A3B8', marginBottom: 28 }}>⏱ {lecon.dureeMin} min</p>
          )}

          {/* Vidéo */}
          {lecon?.videoUrl && (
            <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000', borderRadius: 14, overflow: 'hidden', marginBottom: 28 }}>
              <iframe src={lecon.videoUrl} title={lecon.titre}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen />
            </div>
          )}

          {/* Contenu texte */}
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, color: '#374151', lineHeight: 1.85 }}>
            {lecon?.contenu ? (
              <div dangerouslySetInnerHTML={{ __html: lecon.contenu.replace(/\n/g, '<br/>') }} />
            ) : (
              <div>
                <div style={{ background: '#E8F5ED', border: `1px solid ${VERT}30`, borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, color: VERT, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    Points clés de cette leçon
                  </div>
                  {['Comprendre les bases du soin infirmier', 'Appliquer les protocoles MSPP en pratique', 'Identifier les signes d\'alarme cliniques', 'Documenter correctement les soins prodigués'].map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                      <span style={{ color: VERT, fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 14, color: '#374151' }}>{p}</span>
                    </div>
                  ))}
                </div>
                <p>Cette leçon vous guide à travers les concepts essentiels avec des exemples pratiques adaptés au contexte haïtien. Prenez le temps d'assimiler chaque section avant de passer à la suivante.</p>
              </div>
            )}
          </div>

          {/* PDF */}
          {lecon?.pdfUrl && (
            <div style={{ marginTop: 28, background: '#F8FAFB', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 20px' }}>
              <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Ressources</h3>
              <a href={lecon.pdfUrl} target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: VERT, color: 'white', borderRadius: 8, textDecoration: 'none', fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700 }}>
                📄 Télécharger le support PDF
              </a>
            </div>
          )}

          {/* Boutons navigation */}
          <div style={{ display: 'flex', gap: 14, marginTop: 32, flexWrap: 'wrap' }}>
            {!termine ? (
              <button onClick={marquerTermine} disabled={envoi}
                style={{ flex: 1, padding: '14px', background: VERT, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                {envoi ? 'Enregistrement…' : '✓ Marquer comme terminé'}
              </button>
            ) : (
              <div style={{ flex: 1, padding: '14px', background: '#E8F5ED', color: '#166534', borderRadius: 10, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, textAlign: 'center' }}>
                ✅ Leçon terminée !
              </div>
            )}
            {suivante && (
              <Link href={`/formations/${id}/lecons/${suivante.id}`}
                style={{ flex: 1, padding: '14px', background: '#0D1F2D', color: 'white', borderRadius: 10, textDecoration: 'none', fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, textAlign: 'center' }}>
                Leçon suivante →
              </Link>
            )}
            {!suivante && termine && (
              <Link href={`/formations/${id}`}
                style={{ flex: 1, padding: '14px', background: '#0D1F2D', color: 'white', borderRadius: 10, textDecoration: 'none', fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, textAlign: 'center' }}>
                Terminer la formation →
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar — plan du cours */}
        <div style={{ position: 'sticky', top: 100, height: 'fit-content' }}>
          <div style={{ background: '#F8FAFB', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', background: VERT }}>
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Plan du cours
              </span>
            </div>
            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              {formation?.lecons?.map((l: any, i: number) => {
                const actif = l.id === leconId;
                return (
                  <Link key={l.id ?? i} href={`/formations/${id}/lecons/${l.id}`}
                    style={{ display: 'flex', gap: 10, padding: '11px 14px', borderBottom: '1px solid #F1F5F9', textDecoration: 'none', background: actif ? '#E8F5ED' : 'white', transition: 'background 0.15s' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: actif ? VERT : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: actif ? 'white' : '#94A3B8', fontWeight: 700, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: actif ? VERT : '#374151', fontWeight: actif ? 700 : 400, lineHeight: 1.4 }}>
                      {l.titre}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 220px"]{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
