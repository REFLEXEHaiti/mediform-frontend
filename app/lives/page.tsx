// app/lives/page.tsx — MediForm Haiti
// ⚠️ SPÉCIFIQUE À MEDIFORM HAITI
// Conférences médicales en direct et replays de formation

'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const VERT = '#1B6B45';
const BLEU = '#1E5FA8';

const getYoutubeThumb = (url: string) => {
  const m = url?.match(/(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
};

const getEmbedUrl = (url: string) => {
  const m = url?.match(/(?:youtube\.com\/(?:watch\?v=|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}?rel=0&autoplay=1` : url;
};

const LIVES_DEMO = [
  { id: 'L1', titre: 'Urgences obstétricales en zone rurale haïtienne', description: 'Gestion des hémorragies du post-partum, prééclampsie, dystocies. Avec Dr. Céline Pierre, gynécologue-obstétricienne.', categorie: 'Maternité', statut: 'TERMINE', vues: 1890, dateDebut: '2026-03-10', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { id: 'L2', titre: 'Protocoles cholera — Mise à jour MSPP 2026', description: 'Nouvelles directives MSPP pour la prise en charge du choléra en Haïti. Réhydratation, surveillance et prévention.', categorie: 'Maladies tropicales', statut: 'TERMINE', vues: 2340, dateDebut: '2026-02-28', youtubeUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U' },
  { id: 'L3', titre: 'Pharmacologie pratique pour infirmiers en Haïti', description: 'Les 30 médicaments essentiels disponibles en Haïti : dosages, effets secondaires, interactions.', categorie: 'Pharmacologie', statut: 'TERMINE', vues: 1120, dateDebut: '2026-02-15', youtubeUrl: 'https://www.youtube.com/watch?v=L_jWHffIx5E' },
  { id: 'L4', titre: 'Soins pédiatriques — Malnutrition aiguë sévère', description: 'Diagnostic et prise en charge de la MAS chez l\'enfant haïtien selon le protocole MSPP/UNICEF.', categorie: 'Pédiatrie', statut: 'TERMINE', vues: 876, dateDebut: '2026-01-20', youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ' },
  { id: 'L5', titre: 'Conférence — Préparation à l\'examen d\'état infirmier 2026', description: 'Révision des modules clés et conseils méthodologiques pour réussir l\'examen d\'état infirmier haïtien.', categorie: 'Certification', statut: 'PROGRAMME', vues: 0, dateDebut: '2026-05-15', youtubeUrl: '' },
];

const CATEGORIES = ['Tous', 'Maternité', 'Maladies tropicales', 'Pharmacologie', 'Pédiatrie', 'Urgences médicales', 'Certification'];
const CAT_COLORS: Record<string, string> = {
  Maternité: BLEU, 'Maladies tropicales': '#E67E22', Pharmacologie: '#9B59B6',
  Pédiatrie: '#1ABC9C', 'Urgences médicales': '#DC2626', Certification: VERT,
};

export default function PageLives() {
  const { utilisateur } = useAuthStore();
  const [lives,   setLives]   = useState(LIVES_DEMO);
  const [replay,  setReplay]  = useState<any>(null);
  const [filtre,  setFiltre]  = useState('Tous');

  useEffect(() => {
    api.get('/lives').then(({ data }) => { if (Array.isArray(data) && data.length) setLives(data); }).catch(() => {});
  }, []);

  const enDirect   = lives.filter(l => l.statut === 'EN_DIRECT');
  const programmes = lives.filter(l => l.statut === 'PROGRAMME');
  const archives   = lives.filter(l => l.statut === 'TERMINE' && (filtre === 'Tous' || l.categorie === filtre));

  return (
    <div style={{ background: '#F8FAFB', minHeight: '100vh' }}>

      {/* Lecteur replay */}
      {replay && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 900 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, color: 'white', margin: 0, fontWeight: 600 }}>{replay.titre}</h3>
              <button onClick={() => setReplay(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe src={getEmbedUrl(replay.youtubeUrl)} title={replay.titre} allow="autoplay; encrypted-media" allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 10 }} />
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${VERT} 0%, #0D4D2E 100%)`, padding: 'clamp(40px,5vw,64px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 100, marginBottom: 16 }}>
            Conférences médicales
          </div>
          <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', color: 'white', margin: '0 0 14px', fontWeight: 800 }}>
            Formation continue en direct
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', maxWidth: 520, margin: 0, lineHeight: 1.7 }}>
            Conférences médicales, mises à jour MSPP/OMS, formations certifiantes en direct avec des spécialistes haïtiens et internationaux.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(20px,5vw,48px)' }}>

        {/* En direct */}
        {enDirect.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0D1F2D', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#DC2626', animation: 'pulse 1.5s infinite' }} />
              En direct maintenant
            </h2>
            {enDirect.map(l => (
              <div key={l.id} style={{ background: 'white', border: `2px solid ${VERT}`, borderRadius: 14, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap', boxShadow: `0 4px 20px ${VERT}15` }}>
                <div>
                  <div style={{ fontSize: 11, color: '#DC2626', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔴 En direct</div>
                  <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, color: '#0D1F2D', margin: '0 0 6px', fontWeight: 700 }}>{l.titre}</h3>
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#64748B', margin: 0 }}>{l.description}</p>
                </div>
                <button onClick={() => setReplay(l)} style={{ padding: '12px 24px', background: VERT, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer', flexShrink: 0 }}>
                  ▶ Regarder
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Programmes */}
        {programmes.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0D1F2D', margin: '0 0 16px' }}>Prochaines conférences</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {programmes.map(l => (
                <div key={l.id} style={{ background: 'white', border: `1px solid ${VERT}25`, borderRadius: 12, padding: '18px 20px' }}>
                  <div style={{ fontSize: 11, color: VERT, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    📅 {new Date(l.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, color: '#0D1F2D', margin: '0 0 6px', fontWeight: 700 }}>{l.titre}</h3>
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.5 }}>{l.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtres */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFiltre(cat)}
              style={{ padding: '7px 14px', borderRadius: 100, border: `1.5px solid ${filtre === cat ? VERT : '#E2E8F0'}`, background: filtre === cat ? VERT : 'white', color: filtre === cat ? 'white' : '#64748B', fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: filtre === cat ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Archives */}
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0D1F2D', margin: '0 0 20px' }}>Replays & Archives</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {archives.map(l => {
            const thumb = getYoutubeThumb(l.youtubeUrl ?? '');
            const catColor = CAT_COLORS[l.categorie] ?? VERT;
            return (
              <div key={l.id} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
                onClick={() => l.youtubeUrl && setReplay(l)}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = `0 8px 32px ${VERT}15`; el.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'none'; el.style.transform = 'none'; }}>
                <div style={{ height: 160, background: thumb ? `url(${thumb}) center/cover` : `${catColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  {thumb && <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  {!thumb && <span style={{ fontSize: 40 }}>🎥</span>}
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>▶</div>
                  </div>
                  <div style={{ position: 'absolute', top: 10, left: 10, background: catColor, color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>
                    {l.categorie}
                  </div>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 700, color: '#0D1F2D', marginBottom: 6, lineHeight: 1.4 }}>{l.titre}</h3>
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#64748B', lineHeight: 1.5, marginBottom: 8 }}>
                    {l.description?.slice(0, 90)}{(l.description?.length ?? 0) > 90 ? '…' : ''}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8' }}>
                    <span>👁 {(l.vues ?? 0).toLocaleString()} vues</span>
                    <span>📅 {new Date(l.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
