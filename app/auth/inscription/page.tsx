// app/auth/inscription/page.tsx — MediForm Haiti
'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/lib/tenantContext';

const ROLES_MEDIFORM = [
  { id: 'APPRENANT',  label: '🩺 Infirmier(e) / Aide-soignant(e)' },
  { id: 'SPECTATEUR', label: '🎓 Étudiant en médecine / sciences de la santé' },
  { id: 'FORMATEUR',  label: '👨‍⚕️ Médecin / Formateur en santé' },
];

const SPECIALITES = [
  'Médecine générale', 'Soins infirmiers', 'Obstétrique / Maïeutique',
  'Pédiatrie', 'Chirurgie', 'Médecine d\'urgence', 'Pharmacie',
  'Biologie médicale', 'Radiologie', 'Santé publique', 'Autre',
];

const VILLES = [
  'Port-au-Prince', 'Pétion-Ville', 'Cap-Haïtien', 'Gonaïves',
  'Les Cayes', 'Jacmel', 'Saint-Marc', 'Mirebalais', 'Miami',
  'New York', 'Montréal', 'Paris', 'Autre',
];

const inp: React.CSSProperties = {
  width: '100%', padding: '13px 16px',
  border: '1.5px solid #D1E7D9', borderRadius: 10,
  fontSize: 15, outline: 'none', boxSizing: 'border-box',
  fontFamily: "'Helvetica Neue',Arial,sans-serif",
  color: '#0D2818', background: 'white', transition: 'border-color 0.2s',
};
const lbl: React.CSSProperties = {
  display: 'block', fontSize: 13,
  fontFamily: "'Helvetica Neue',Arial,sans-serif",
  fontWeight: 600, color: '#0D2818', marginBottom: 6,
};

export default function PageInscription() {
  const { inscrire, chargement } = useAuth();
  const { config } = useTenant();

  const primaire   = config?.couleursTheme.primaire   ?? '#1B6B45';
  const secondaire = config?.couleursTheme.secondaire ?? '#1E5FA8';

  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', motDePasse: '',
    ville: '', whatsapp: '', role: 'APPRENANT', specialite: '',
  });
  const [voirMDP, setVoirMDP]         = useState(false);
  const [erreurs, setErreurs]         = useState<Record<string, string>>({});
  const [erreurGlobal, setErreurGlobal] = useState('');
  const [etape, setEtape]             = useState<1 | 2>(1);

  const set = useCallback((k: string, v: string) => setForm(f => ({ ...f, [k]: v })), []);

  const validerEtape1 = () => {
    const e: Record<string, string> = {};
    if (!form.prenom.trim()) e.prenom = 'Requis';
    if (!form.nom.trim()) e.nom = 'Requis';
    if (!form.email.includes('@')) e.email = 'Email invalide';
    if (form.motDePasse.length < 8) e.motDePasse = 'Minimum 8 caractères';
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const handleEtape1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validerEtape1()) setEtape(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErreurGlobal('');
    try {
      await inscrire({ ...form });
    } catch (err: any) {
      setErreurGlobal(err.response?.data?.message ?? "Erreur lors de l'inscription");
    }
  };

  const focusStyle = (e: React.FocusEvent<any>) => { e.target.style.borderColor = primaire; e.target.style.boxShadow = `0 0 0 3px ${primaire}15`; };
  const blurStyle  = (e: React.FocusEvent<any>) => { e.target.style.borderColor = '#D1E7D9'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ minHeight: '100vh', background: '#F4FAF6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(24px,5vw,48px) 16px' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: `linear-gradient(135deg, #0D2818, ${primaire})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: 'white', fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: 22 }}>MF</div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 'normal', color: '#0D2818', margin: '0 0 4px' }}>MediForm Haiti</h1>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#4A7A5A', margin: 0 }}>Créez votre compte professionnel de santé</p>
        </div>

        {/* Indicateur étapes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
          {[1, 2].map(n => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: etape >= n ? primaire : '#D1E7D9', color: etape >= n ? 'white' : '#6B9E7A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, transition: 'background 0.2s' }}>
                {etape > n ? '✓' : n}
              </div>
              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: etape >= n ? primaire : '#6B9E7A', fontWeight: etape >= n ? 700 : 400 }}>
                {n === 1 ? 'Identité' : 'Profil médical'}
              </span>
              {n < 2 && <div style={{ width: 40, height: 2, background: etape > n ? primaire : '#D1E7D9', borderRadius: 1 }} />}
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: 'clamp(24px,4vw,36px)', border: '1px solid #D1E7D9', boxShadow: `0 8px 40px ${primaire}10` }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${primaire}, ${secondaire})`, borderRadius: 2, marginBottom: 28 }} />

          {erreurGlobal && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#DC2626' }}>
              ⚠ {erreurGlobal}
            </div>
          )}

          {/* Étape 1 — Identité */}
          {etape === 1 && (
            <form onSubmit={handleEtape1} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 'normal', color: '#0D2818', margin: '0 0 4px' }}>Vos informations</h2>
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#4A7A5A', margin: '0 0 8px' }}>Créez votre compte de professionnel de santé</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={lbl}>Prénom *</label>
                  <input value={form.prenom} onChange={e => set('prenom', e.target.value)} placeholder="Marie" style={{ ...inp, borderColor: erreurs.prenom ? '#FCA5A5' : '#D1E7D9' }} onFocus={focusStyle} onBlur={blurStyle} />
                  {erreurs.prenom && <span style={{ fontSize: 11, color: '#DC2626', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>{erreurs.prenom}</span>}
                </div>
                <div>
                  <label style={lbl}>Nom *</label>
                  <input value={form.nom} onChange={e => set('nom', e.target.value)} placeholder="Dupont" style={{ ...inp, borderColor: erreurs.nom ? '#FCA5A5' : '#D1E7D9' }} onFocus={focusStyle} onBlur={blurStyle} />
                  {erreurs.nom && <span style={{ fontSize: 11, color: '#DC2626', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>{erreurs.nom}</span>}
                </div>
              </div>

              <div>
                <label style={lbl}>Email professionnel *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="medecin@exemple.ht" style={{ ...inp, borderColor: erreurs.email ? '#FCA5A5' : '#D1E7D9' }} onFocus={focusStyle} onBlur={blurStyle} />
                {erreurs.email && <span style={{ fontSize: 11, color: '#DC2626', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>{erreurs.email}</span>}
              </div>

              <div>
                <label style={lbl}>Mot de passe * <span style={{ fontWeight: 400, color: '#6B9E7A' }}>(min. 8 caractères)</span></label>
                <div style={{ position: 'relative' }}>
                  <input type={voirMDP ? 'text' : 'password'} value={form.motDePasse} onChange={e => set('motDePasse', e.target.value)} placeholder="••••••••" style={{ ...inp, paddingRight: 48, borderColor: erreurs.motDePasse ? '#FCA5A5' : '#D1E7D9' }} onFocus={focusStyle} onBlur={blurStyle} />
                  <button type="button" onClick={() => setVoirMDP(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6B9E7A' }}>
                    {voirMDP ? '🙈' : '👁'}
                  </button>
                </div>
                {erreurs.motDePasse && <span style={{ fontSize: 11, color: '#DC2626', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>{erreurs.motDePasse}</span>}
              </div>

              <button type="submit" style={{ width: '100%', padding: '15px', background: primaire, color: 'white', border: 'none', borderRadius: 12, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 4 }}>
                Continuer →
              </button>
            </form>
          )}

          {/* Étape 2 — Profil médical */}
          {etape === 2 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 'normal', color: '#0D2818', margin: '0 0 4px' }}>Votre profil médical</h2>
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#4A7A5A', margin: '0 0 8px' }}>Personnalisez votre parcours de formation</p>

              <div>
                <label style={lbl}>Je suis *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ROLES_MEDIFORM.map(r => (
                    <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: `2px solid ${form.role === r.id ? primaire : '#D1E7D9'}`, borderRadius: 10, cursor: 'pointer', background: form.role === r.id ? `${primaire}08` : 'white', transition: 'all 0.15s' }}>
                      <input type="radio" name="role" value={r.id} checked={form.role === r.id} onChange={() => set('role', r.id)} style={{ accentColor: primaire, width: 18, height: 18 }} />
                      <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, fontWeight: form.role === r.id ? 700 : 400, color: form.role === r.id ? primaire : '#0D2818' }}>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={lbl}>Spécialité</label>
                <select value={form.specialite} onChange={e => set('specialite', e.target.value)} style={{ ...inp, appearance: 'none' as any }} onFocus={focusStyle} onBlur={blurStyle}>
                  <option value="">Choisir une spécialité…</option>
                  {SPECIALITES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={lbl}>Ville</label>
                  <select value={form.ville} onChange={e => set('ville', e.target.value)} style={{ ...inp, appearance: 'none' as any }} onFocus={focusStyle} onBlur={blurStyle}>
                    <option value="">Sélectionner…</option>
                    {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>WhatsApp</label>
                  <input type="tel" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+509 xxxx-xxxx" style={inp} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              </div>

              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '12px 16px' }}>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#166534', margin: 0, lineHeight: 1.6 }}>
                  🔒 Vos données sont protégées. Elles ne seront jamais partagées sans votre consentement.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setEtape(1)}
                  style={{ flex: 1, padding: '14px', background: 'white', color: primaire, border: `2px solid ${primaire}`, borderRadius: 12, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                  ← Retour
                </button>
                <button type="submit" disabled={chargement}
                  style={{ flex: 2, padding: '14px', background: chargement ? '#4A7A5A' : primaire, color: 'white', border: 'none', borderRadius: 12, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: chargement ? 'not-allowed' : 'pointer' }}>
                  {chargement ? '⏳ Création…' : 'Créer mon compte →'}
                </button>
              </div>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: 20, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#4A7A5A' }}>
            Déjà inscrit ?{' '}
            <Link href="/auth/connexion" style={{ color: primaire, fontWeight: 700, textDecoration: 'none' }}>Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
