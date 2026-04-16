// app/auth/mot-de-passe-oublie/page.tsx — MediForm Haiti
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/lib/tenantContext';

export default function PageMotDePasseOublie() {
  const { motDePasseOublie, chargement } = useAuth();
  const { config } = useTenant();

  const primaire   = config?.couleursTheme.primaire   ?? '#1B6B45';
  const secondaire = config?.couleursTheme.secondaire ?? '#1E5FA8';

  const [email, setEmail]   = useState('');
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErreur('');
    try {
      await motDePasseOublie(email);
      setEnvoye(true);
    } catch {
      setErreur('Email introuvable. Vérifiez l\'adresse saisie.');
    }
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

          {!envoye ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 'normal', color: '#0D2818', margin: '0 0 8px' }}>Mot de passe oublié ?</h2>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#4A7A5A', lineHeight: 1.6, margin: 0 }}>
                  Entrez votre email professionnel. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
              </div>

              {erreur && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#DC2626' }}>
                  ⚠ {erreur}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 600, color: '#0D2818', marginBottom: 6 }}>
                    Email professionnel
                  </label>
                  <input type="email" value={email} required onChange={e => setEmail(e.target.value)}
                    placeholder="medecin@exemple.ht"
                    style={{ width: '100%', padding: '13px 16px', border: `1.5px solid #D1E7D9`, borderRadius: 10, fontSize: 15, outline: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", boxSizing: 'border-box' as const, color: '#0D2818', background: 'white' }}
                    onFocus={e => { e.target.style.borderColor = primaire; }}
                    onBlur={e => { e.target.style.borderColor = '#D1E7D9'; }} />
                </div>
                <button type="submit" disabled={chargement}
                  style={{ width: '100%', padding: '15px', background: chargement ? '#4A7A5A' : primaire, color: 'white', border: 'none', borderRadius: 12, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 16, cursor: chargement ? 'not-allowed' : 'pointer' }}>
                  {chargement ? 'Envoi…' : 'Envoyer le lien →'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32 }}>✉️</div>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 'normal', color: '#0D2818', margin: '0 0 12px' }}>Email envoyé !</h2>
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#4A7A5A', lineHeight: 1.7, margin: '0 0 24px' }}>
                Un lien de réinitialisation a été envoyé à <strong style={{ color: primaire }}>{email}</strong>. Vérifiez aussi vos spams.
              </p>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#166534', margin: 0 }}>
                  Le lien expire dans <strong>24 heures</strong>.
                </p>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 20, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#4A7A5A' }}>
            <Link href="/auth/connexion" style={{ color: primaire, fontWeight: 700, textDecoration: 'none' }}>
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
