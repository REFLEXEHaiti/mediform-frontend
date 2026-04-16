// app/auth/reinitialiser-mot-de-passe/page.tsx — MediForm Haiti
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/lib/tenantContext';

export default function PageReinitialiserMotDePasse() {
  const { reinitialiserMotDePasse, chargement } = useAuth();
  const { config } = useTenant();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const primaire   = config?.couleursTheme.primaire   ?? '#1B6B45';
  const secondaire = config?.couleursTheme.secondaire ?? '#1E5FA8';

  const [motDePasse, setMotDePasse]         = useState('');
  const [confirmation, setConfirmation]     = useState('');
  const [voirMDP, setVoirMDP]               = useState(false);
  const [erreur, setErreur]                 = useState('');
  const [succes, setSucces]                 = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErreur('');
    if (motDePasse.length < 8) { setErreur('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    if (motDePasse !== confirmation) { setErreur('Les mots de passe ne correspondent pas.'); return; }
    try {
      await reinitialiserMotDePasse(token, motDePasse);
      setSucces(true);
      setTimeout(() => router.push('/auth/connexion'), 3000);
    } catch {
      setErreur('Lien invalide ou expiré. Demandez un nouveau lien.');
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 16px', border: `1.5px solid #D1E7D9`, borderRadius: 10,
    fontSize: 15, outline: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif",
    boxSizing: 'border-box' as const, color: '#0D2818', background: 'white',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F4FAF6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: `linear-gradient(135deg, #0D2818, ${primaire})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: 'white', fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: 22 }}>MF</div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 'normal', color: '#0D2818', margin: 0 }}>MediForm Haiti</h1>
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: 'clamp(24px,4vw,36px)', border: '1px solid #D1E7D9', boxShadow: `0 8px 40px ${primaire}10` }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${primaire}, ${secondaire})`, borderRadius: 2, marginBottom: 28 }} />

          {succes ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32 }}>✅</div>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 'normal', color: '#0D2818', margin: '0 0 12px' }}>Mot de passe mis à jour !</h2>
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#4A7A5A', lineHeight: 1.7, margin: '0 0 20px' }}>
                Votre mot de passe a été modifié avec succès. Redirection vers la connexion…
              </p>
              <Link href="/auth/connexion" style={{ display: 'inline-block', padding: '14px 32px', background: primaire, color: 'white', borderRadius: 100, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15 }}>
                Se connecter →
              </Link>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 'normal', color: '#0D2818', margin: '0 0 8px' }}>Nouveau mot de passe</h2>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#4A7A5A', lineHeight: 1.6, margin: 0 }}>
                  Choisissez un mot de passe sécurisé pour votre compte MediForm Haiti.
                </p>
              </div>

              {erreur && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#DC2626' }}>
                  ⚠ {erreur}
                </div>
              )}

              {!token && (
                <div style={{ background: '#FEF9C3', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#92400E' }}>
                  ⚠ Lien de réinitialisation manquant. Demandez un nouveau lien depuis la page connexion.
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 600, color: '#0D2818', marginBottom: 6 }}>
                    Nouveau mot de passe <span style={{ fontWeight: 400, color: '#6B9E7A' }}>(min. 8 caractères)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input type={voirMDP ? 'text' : 'password'} value={motDePasse} required onChange={e => setMotDePasse(e.target.value)}
                      placeholder="••••••••" style={{ ...inp, paddingRight: 48 }}
                      onFocus={e => { e.target.style.borderColor = primaire; }}
                      onBlur={e => { e.target.style.borderColor = '#D1E7D9'; }} />
                    <button type="button" onClick={() => setVoirMDP(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6B9E7A' }}>
                      {voirMDP ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 600, color: '#0D2818', marginBottom: 6 }}>
                    Confirmer le mot de passe
                  </label>
                  <input type="password" value={confirmation} required onChange={e => setConfirmation(e.target.value)}
                    placeholder="••••••••" style={{ ...inp, borderColor: confirmation && motDePasse !== confirmation ? '#FCA5A5' : '#D1E7D9' }}
                    onFocus={e => { e.target.style.borderColor = primaire; }}
                    onBlur={e => { e.target.style.borderColor = confirmation && motDePasse !== confirmation ? '#FCA5A5' : '#D1E7D9'; }} />
                  {confirmation && motDePasse !== confirmation && (
                    <span style={{ fontSize: 12, color: '#DC2626', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Les mots de passe ne correspondent pas</span>
                  )}
                </div>

                {/* Indicateur force mot de passe */}
                {motDePasse && (
                  <div>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1,2,3,4].map(n => (
                        <div key={n} style={{ flex: 1, height: 4, borderRadius: 2, background: motDePasse.length >= n * 2 ? (n <= 2 ? '#F59E0B' : '#16A34A') : '#D1E7D9' }} />
                      ))}
                    </div>
                    <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#6B9E7A' }}>
                      {motDePasse.length < 8 ? 'Trop court' : motDePasse.length < 12 ? 'Acceptable' : 'Fort ✓'}
                    </span>
                  </div>
                )}

                <button type="submit" disabled={chargement || !token}
                  style={{ width: '100%', padding: '15px', background: (chargement || !token) ? '#4A7A5A' : primaire, color: 'white', border: 'none', borderRadius: 12, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 16, cursor: (chargement || !token) ? 'not-allowed' : 'pointer' }}>
                  {chargement ? 'Mise à jour…' : 'Mettre à jour le mot de passe →'}
                </button>
              </form>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href="/auth/connexion" style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: primaire, textDecoration: 'none', fontWeight: 600 }}>
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
