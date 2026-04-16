// app/page.tsx — MediForm Haiti
// ⚠️ SPÉCIFIQUE À MEDIFORM HAITI
// Design inspiré du template Wix Doctor (Tech) :
//  - Fond blanc propre avec accents vert médical + bleu
//  - Sections bien délimitées : Hero, Services, Stats, Formations, CTA
//  - Photos de professionnels de santé haïtiens
//  - Icônes SVG (pas d'emojis)
//  - Typographie Inter moderne et lisible

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const VERT  = '#1B6B45';
const VERT2 = '#27AE73';
const BLEU  = '#1E5FA8';

// ── Icônes SVG médicales ─────────────────────────────────────
const IconStethoscope = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
    <circle cx="20" cy="10" r="2"/>
  </svg>
);
const IconBook = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);
const IconActivity = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const IconUsers = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconAward = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);
const IconShield = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconVideo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

// ── Données de démo ──────────────────────────────────────────
const MODULES_DEMO = [
  { id: 'F1', titre: 'Soins infirmiers de base', categorie: 'Sciences infirmières', niveau: 'DEBUTANT', _count: { lecons: 12, inscriptions: 340 }, imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80' },
  { id: 'F2', titre: 'Pharmacologie clinique', categorie: 'Pharmacologie', niveau: 'INTERMEDIAIRE', _count: { lecons: 16, inscriptions: 187 }, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80' },
  { id: 'F3', titre: 'Protocoles d\'urgence OMS', categorie: 'Urgences médicales', niveau: 'AVANCE', _count: { lecons: 10, inscriptions: 95 }, imageUrl: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&q=80' },
  { id: 'F4', titre: 'Maternité & soins obstétricaux', categorie: 'Maternité', niveau: 'INTERMEDIAIRE', _count: { lecons: 14, inscriptions: 221 }, imageUrl: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=600&q=80' },
];

const STATS = [
  { valeur: '2 800+', label: 'Professionnels formés',   icone: <IconUsers />,     couleur: VERT },
  { valeur: '45',     label: 'Modules de formation',     icone: <IconBook />,      couleur: BLEU },
  { valeur: '92%',    label: 'Taux de réussite',          icone: <IconActivity />,  couleur: '#9B59B6' },
  { valeur: '18',     label: 'Simulations cliniques',     icone: <IconStethoscope />, couleur: '#E67E22' },
];

const SERVICES = [
  { titre: 'Formations certifiées',  description: 'Modules validés par le MSPP et l\'Ordre des Infirmiers et Infirmières d\'Haïti.', icone: <IconAward />,       couleur: VERT },
  { titre: 'Simulations cliniques',  description: 'Cas patients réalistes pour pratiquer sans risque. Diagnostics, soins, protocoles.', icone: <IconActivity />,  couleur: BLEU },
  { titre: 'Bibliothèque médicale',  description: 'Protocoles OMS, guides MSPP, pharmacopée haïtienne. Toujours à jour.', icone: <IconBook />,          couleur: '#9B59B6' },
  { titre: 'Lives & conférences',    description: 'Conférences médicales en direct avec des spécialistes haïtiens et internationaux.', icone: <IconVideo />,     couleur: '#E67E22' },
  { titre: 'Chatbot médical IA',     description: 'Assistant IA spécialisé en soins infirmiers. Répond en français et créole haïtien.', icone: <IconStethoscope />, couleur: '#1ABC9C' },
  { titre: 'Certifications reconnues', description: 'Badges numériques et certificats reconnus par les employeurs du secteur de santé.', icone: <IconShield />, couleur: '#E74C3C' },
];

export default function PageAccueilMediForm() {
  const { estConnecte } = useAuthStore();
  const [formations, setFormations] = useState(MODULES_DEMO);
  const [sponsors, setSponsors]     = useState<any[]>([]);

  useEffect(() => {
    api.get('/cours?limite=4').then(({ data }) => { if (Array.isArray(data) && data.length) setFormations(data.slice(0, 4)); }).catch(() => {});
    api.get('/sponsors').then(({ data }) => { if (Array.isArray(data)) setSponsors(data); }).catch(() => {});
  }, []);

  const NIV_LABEL: Record<string, string> = { DEBUTANT: 'Débutant', INTERMEDIAIRE: 'Intermédiaire', AVANCE: 'Avancé' };
  const NIV_COLOR: Record<string, string> = { DEBUTANT: '#27AE73', INTERMEDIAIRE: '#1E5FA8', AVANCE: '#9B59B6' };

  return (
    <div style={{ fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif", background: '#F8FAFB', color: '#0D1F2D' }}>

      {/* ══════════════ HERO ══════════════ */}
      <section style={{ background: 'white', borderBottom: `1px solid #E8F5ED` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(48px,6vw,96px) clamp(20px,5vw,48px)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>

          {/* Gauche — contenu */}
          <div>
            {/* Pill badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E8F5ED', border: `1px solid ${VERT}30`, borderRadius: 100, padding: '6px 14px', marginBottom: 24 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: VERT }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: VERT, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Formation médicale certifiée
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(32px,4.5vw,56px)', fontWeight: 800, color: '#0D1F2D', lineHeight: 1.1, marginBottom: 20 }}>
              Formez-vous pour<br />
              <span style={{ color: VERT }}>mieux soigner</span><br />
              en Haïti
            </h1>

            <p style={{ fontSize: 'clamp(15px,1.6vw,18px)', color: '#4A6278', lineHeight: 1.75, marginBottom: 32, maxWidth: 480 }}>
              La plateforme de formation professionnelle pour les infirmiers, aides-soignants et professionnels de santé haïtiens. Protocoles OMS/MSPP, simulations cliniques et certifications reconnues.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
              <Link href="/formations"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: VERT, color: 'white', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
                Commencer la formation <IconArrowRight />
              </Link>
              <Link href="/simulations"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: 'white', color: VERT, border: `2px solid ${VERT}`, borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
                Simuler un cas clinique
              </Link>
            </div>

            {/* Partenaires */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>Reconnu par</span>
              {['MSPP', 'OIIH', 'OMS Haïti'].map(p => (
                <div key={p} style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, color: '#374151' }}>
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* Droite — image médicale + carte statistique */}
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 24px 64px rgba(27,107,69,0.15)' }}>
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=85"
                alt="Infirmière en formation — MediForm Haiti"
                style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* Carte flottante — stat en direct */}
            <div style={{ position: 'absolute', bottom: -20, left: -20, background: 'white', borderRadius: 14, padding: '16px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #E8F5ED', minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#E8F5ED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: VERT, flexShrink: 0 }}>
                  <IconUsers />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0D1F2D', lineHeight: 1 }}>2 800+</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Professionnels formés</div>
                </div>
              </div>
            </div>

            {/* Badge MSPP */}
            <div style={{ position: 'absolute', top: 20, right: 20, background: VERT, borderRadius: 10, padding: '10px 14px', color: 'white', textAlign: 'center', boxShadow: '0 4px 16px rgba(27,107,69,0.3)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', opacity: 0.85 }}>VALIDÉ PAR</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>MSPP</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section style={{ background: VERT, padding: 'clamp(32px,4vw,48px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'white' }}>
                {s.icone}
              </div>
              <div style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800, color: 'white', lineHeight: 1 }}>{s.valeur}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ SERVICES ══════════════ */}
      <section style={{ padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,48px)', background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-block', background: '#E8F5ED', color: VERT, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 100, marginBottom: 16 }}>
              Nos services
            </div>
            <h2 style={{ fontSize: 'clamp(26px,3.5vw,40px)', color: '#0D1F2D', marginBottom: 12 }}>
              Tout ce dont vous avez besoin<br />
              <span style={{ color: VERT }}>pour progresser</span>
            </h2>
            <p style={{ fontSize: 16, color: '#64748B', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Des outils conçus pour les professionnels de santé haïtiens, disponibles sur smartphone 3G.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {SERVICES.map(s => (
              <div key={s.titre} style={{ background: '#FAFBFC', border: '1px solid #E8EAED', borderRadius: 16, padding: '28px 26px', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = `0 12px 40px ${s.couleur}18`; el.style.borderColor = `${s.couleur}30`; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'none'; el.style.boxShadow = 'none'; el.style.borderColor = '#E8EAED'; }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${s.couleur}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.couleur, marginBottom: 18 }}>
                  {s.icone}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0D1F2D', marginBottom: 10 }}>{s.titre}</h3>
                <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.65 }}>{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FORMATIONS EN VEDETTE ══════════════ */}
      <section style={{ padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,48px)', background: '#F8FAFB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'inline-block', background: '#EBF3FB', color: BLEU, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 100, marginBottom: 12 }}>
                Formations populaires
              </div>
              <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', color: '#0D1F2D', margin: 0 }}>
                Modules les plus suivis
              </h2>
            </div>
            <Link href="/formations" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: VERT, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
              Voir tout le catalogue <IconArrowRight />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {formations.map(f => (
              <Link key={f.id} href={`/formations/${f.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #E2E8F0', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${VERT}15`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                  <div style={{ height: 160, background: f.imageUrl ? `url(${f.imageUrl}) center/cover` : `${VERT}20`, position: 'relative', overflow: 'hidden' }}>
                    {f.imageUrl && <img src={f.imageUrl} alt={f.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    <div style={{ position: 'absolute', top: 12, left: 12 }}>
                      <span style={{ background: NIV_COLOR[f.niveau] ?? VERT, color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>
                        {NIV_LABEL[f.niveau]}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ fontSize: 11, color: BLEU, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {f.categorie}
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0D1F2D', marginBottom: 12, lineHeight: 1.4 }}>{f.titre}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94A3B8' }}>
                      <span>📚 {f._count?.lecons ?? 0} leçons</span>
                      <span>👥 {f._count?.inscriptions ?? 0} inscrits</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ SIMULATION CLINIQUE ══════════════ */}
      <section style={{ background: 'white', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 56px rgba(0,0,0,0.1)' }}>
              <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&q=80" alt="Simulation clinique" style={{ width: '100%', height: 380, objectFit: 'cover' }} />
            </div>
            {/* Carte flottante simulation */}
            <div style={{ position: 'absolute', bottom: -16, right: -16, background: VERT, borderRadius: 14, padding: '16px 20px', color: 'white', minWidth: 180, boxShadow: '0 8px 32px rgba(27,107,69,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconActivity />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>18</div>
                  <div style={{ fontSize: 11, opacity: 0.85 }}>Simulations disponibles</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'inline-block', background: '#E8F5ED', color: VERT, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 100, marginBottom: 20 }}>
              Simulation clinique IA
            </div>
            <h2 style={{ fontSize: 'clamp(26px,3.5vw,40px)', color: '#0D1F2D', marginBottom: 16, lineHeight: 1.2 }}>
              Pratiquez sur des cas<br />
              <span style={{ color: VERT }}>patients réalistes</span>
            </h2>
            <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.75, marginBottom: 24 }}>
              Notre IA génère des cas cliniques adaptés au contexte haïtien : maladies tropicales, accouchements à risque, urgences en zone rurale. Pratiquez sans risque pour le patient.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Cas patients générés par l\'IA médicale', 'Protocoles OMS et MSPP référencés', 'Feedback détaillé sur chaque décision', 'Disponible en français et créole haïtien'].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#E8F5ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={VERT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 14, color: '#374151' }}>{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/simulations"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: VERT, color: 'white', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
              Essayer une simulation <IconArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════ TÉMOIGNAGES ══════════════ */}
      <section style={{ background: '#F8FAFB', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', color: '#0D1F2D' }}>
              Ce que disent nos soignants
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {[
              { nom: 'Marie-Flore J.', role: 'Infirmière, Hôpital de PAP', texte: 'Les simulations cliniques m\'ont permis de mieux gérer les urgences obstétricales. Les protocoles MSPP sont directement applicables.' },
              { nom: 'Jean-Robert P.', role: 'Aide-soignant, Cap-Haïtien', texte: 'Les cours sont clairs et accessibles même avec une connexion 3G. Le chatbot répond en créole, c\'est très utile au quotidien.' },
              { nom: 'Claudette M.', role: 'Infirmière-Chef, Les Cayes', texte: 'J\'ai obtenu ma certification OIIH grâce à MediForm. La préparation à l\'examen d\'état infirmier est excellente.' },
            ].map((t, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, padding: '24px 26px' }}>
                {/* Étoiles */}
                <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill={VERT} stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 18 }}>"{t.texte}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${VERT}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: VERT, fontSize: 14 }}>
                    {t.nom[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0D1F2D' }}>{t.nom}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA FINAL ══════════════ */}
      <section style={{ background: `linear-gradient(135deg, ${VERT} 0%, #0D4D2E 100%)`, padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,48px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'white' }}>
            <IconStethoscope />
          </div>
          <h2 style={{ fontSize: 'clamp(26px,3.5vw,44px)', color: 'white', marginBottom: 16, lineHeight: 1.2 }}>
            Rejoignez 2 800 professionnels<br />de santé haïtiens
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
            Gratuit pour commencer. Accédez immédiatement aux modules de base et commencez votre formation.
          </p>
          {estConnecte ? (
            <Link href="/dashboard"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 40px', background: 'white', color: VERT, borderRadius: 12, textDecoration: 'none', fontWeight: 800, fontSize: 16 }}>
              Mon espace de formation <IconArrowRight />
            </Link>
          ) : (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/inscription"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 36px', background: 'white', color: VERT, borderRadius: 12, textDecoration: 'none', fontWeight: 800, fontSize: 15 }}>
                S'inscrire gratuitement <IconArrowRight />
              </Link>
              <Link href="/formations"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 36px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.3)', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
                Voir les formations
              </Link>
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media(max-width:768px){
          section div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}
          section div[style*="grid-template-columns: repeat(4"]{grid-template-columns:repeat(2,1fr)!important;}
        }
      `}</style>
    </div>
  );
}
