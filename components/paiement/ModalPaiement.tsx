// components/paiement/ModalPaiement.tsx — MediForm Haiti
'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useTenant } from '@/lib/tenantContext';
import { useAuthStore } from '@/store/authStore';

interface Props {
  montantHTG: number;
  description: string;
  plan?: string;
  onFermer: () => void;
  onSucces?: () => void;
}

type Methode = 'visa' | 'moncash' | 'paypal' | 'zelle';

export default function ModalPaiement({ montantHTG, description, plan = 'PREMIUM', onFermer, onSucces }: Props) {
  const { config } = useTenant();
  const { estConnecte } = useAuthStore();

  const primaire   = config?.couleursTheme.primaire   ?? '#1B6B45';
  const secondaire = config?.couleursTheme.secondaire ?? '#1E5FA8';

  const [chargement,     setChargement]     = useState(false);
  const [erreur,         setErreur]         = useState('');
  const [methodeChoisie, setMethodeChoisie] = useState<Methode | null>(null);
  const [etape,          setEtape]          = useState<'choix' | 'moncash' | 'zelle' | 'paypal'>('choix');

  const montantUSD = (montantHTG / 132).toFixed(2);

  const methodes: { id: Methode; label: string; sous: string; couleur: string; icone: string }[] = [
    { id: 'visa',    label: 'Visa / Mastercard', sous: 'Paiement sécurisé par Stripe',    couleur: '#635BFF', icone: '💳' },
    { id: 'moncash', label: 'MonCash',            sous: 'Mobile money Digicel Haïti',      couleur: '#FF6600', icone: '📱' },
    { id: 'paypal',  label: 'PayPal',             sous: 'Paiement international sécurisé', couleur: '#003087', icone: '🅿️' },
    { id: 'zelle',   label: 'Zelle',              sous: 'Virement USA instantané',          couleur: '#6D1ED4', icone: '💜' },
  ];

  const payerStripe = async () => {
    if (!estConnecte) { setErreur('Connectez-vous pour payer.'); return; }
    setChargement(true); setErreur('');
    try {
      const { data } = await api.post('/paiements/stripe/session', { plan });
      if (data.url) window.location.href = data.url;
      else setErreur('Erreur lors de la création du paiement.');
    } catch {
      setErreur('Impossible de contacter le serveur. Réessayez.');
    } finally { setChargement(false); }
  };

  const initierMoncash = async () => {
    if (!estConnecte) { setErreur('Connectez-vous pour payer.'); return; }
    setChargement(true);
    try {
      const { data } = await api.post('/paiements/moncash/initier', { montantHTG, plan });
      if (data.redirectUrl) window.location.href = data.redirectUrl;
      else setEtape('moncash');
    } catch { setEtape('moncash'); }
    finally { setChargement(false); }
  };

  const confirmer = () => {
    if (!methodeChoisie) { setErreur('Choisissez une méthode de paiement.'); return; }
    setErreur('');
    if (methodeChoisie === 'visa')    payerStripe();
    if (methodeChoisie === 'moncash') initierMoncash();
    if (methodeChoisie === 'paypal')  setEtape('paypal');
    if (methodeChoisie === 'zelle')   setEtape('zelle');
  };

  const contact = config?.emailContact ?? 'contact@mediformhaiti.com';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 460, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>

        {/* En-tête vert médical */}
        <div style={{ background: `linear-gradient(135deg, #0D2818, ${primaire})`, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>MediForm Haiti</div>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: 'white', fontWeight: 700 }}>{description}</div>
            <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
              {montantHTG.toLocaleString()} HTG / mois · ≈ ${montantUSD}
            </div>
          </div>
          <button onClick={onFermer} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', width: 36, height: 36, borderRadius: '50%', color: 'white', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ padding: '24px' }}>

          {/* Choix méthode */}
          {etape === 'choix' && (
            <>
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#4A7A5A', marginBottom: 16, lineHeight: 1.5 }}>
                Choisissez votre méthode de paiement :
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {methodes.map(m => (
                  <button key={m.id} onClick={() => setMethodeChoisie(m.id)}
                    style={{ padding: '14px 16px', borderRadius: 12, border: `2px solid ${methodeChoisie === m.id ? m.couleur : '#D1E7D9'}`, background: methodeChoisie === m.id ? `${m.couleur}08` : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', transition: 'all 0.15s' }}>
                    <span style={{ fontSize: 24 }}>{m.icone}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, color: methodeChoisie === m.id ? m.couleur : '#0D2818' }}>{m.label}</div>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#6B9E7A', marginTop: 2 }}>{m.sous}</div>
                    </div>
                    {methodeChoisie === m.id && (
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: m.couleur, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {erreur && (
                <div style={{ marginTop: 12, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#EF4444', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
                  ⚠ {erreur}
                </div>
              )}

              <button onClick={confirmer} disabled={chargement || !methodeChoisie}
                style={{ width: '100%', marginTop: 20, padding: '16px', background: methodeChoisie ? primaire : '#D1E7D9', color: methodeChoisie ? 'white' : '#6B9E7A', border: 'none', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 16, cursor: methodeChoisie ? 'pointer' : 'default', transition: 'background 0.2s' }}>
                {chargement ? 'Traitement…' : `Payer ${montantHTG.toLocaleString()} HTG →`}
              </button>

              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#6B9E7A', textAlign: 'center', marginTop: 12 }}>
                🔒 Paiement sécurisé · Certification MSP Haïti incluse
              </p>
            </>
          )}

          {/* MonCash */}
          {etape === 'moncash' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>📱</div>
                <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: '#0D2818', margin: '0 0 8px' }}>Paiement MonCash</h3>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#4A7A5A', lineHeight: 1.6 }}>
                  Envoyez <strong>{montantHTG.toLocaleString()} HTG</strong> au numéro MonCash suivant :
                </p>
              </div>
              <div style={{ background: '#F0FDF4', border: '2px solid #86EFAC', borderRadius: 12, padding: '16px 20px', marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#166534', marginBottom: 4, fontWeight: 600 }}>Numéro MonCash MediForm Haiti</div>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 26, fontWeight: 700, color: '#14532D', letterSpacing: 2 }}>+509 3999-9999</div>
              </div>
              <div style={{ background: '#F4FAF6', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#4A7A5A', lineHeight: 1.6, margin: 0 }}>
                  📸 Après le paiement, envoyez une capture d'écran à <strong style={{ color: primaire }}>{contact}</strong> avec votre adresse email pour activer votre abonnement sous 24h.
                </p>
              </div>
              <button onClick={onFermer} style={{ width: '100%', padding: '14px', background: '#FF6600', color: 'white', border: 'none', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                J'ai effectué le paiement ✓
              </button>
            </div>
          )}

          {/* Zelle */}
          {etape === 'zelle' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>💜</div>
                <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: '#0D2818', margin: '0 0 8px' }}>Paiement Zelle</h3>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#4A7A5A', lineHeight: 1.6 }}>
                  Envoyez <strong>${montantUSD}</strong> via Zelle :
                </p>
              </div>
              <div style={{ background: '#F5F3FF', border: '2px solid #C4B5FD', borderRadius: 12, padding: '16px 20px', marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#5B21B6', marginBottom: 4, fontWeight: 600 }}>Adresse Zelle</div>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: '#3B0764' }}>{contact}</div>
              </div>
              <div style={{ background: '#F4FAF6', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#4A7A5A', lineHeight: 1.6, margin: 0 }}>
                  📸 Envoyez une capture de la transaction avec votre email pour activation sous 24h.
                </p>
              </div>
              <button onClick={onFermer} style={{ width: '100%', padding: '14px', background: '#6D1ED4', color: 'white', border: 'none', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                J'ai effectué le virement ✓
              </button>
            </div>
          )}

          {/* PayPal */}
          {etape === 'paypal' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🅿️</div>
                <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: '#0D2818', margin: '0 0 8px' }}>Paiement PayPal</h3>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#4A7A5A', lineHeight: 1.6 }}>
                  Envoyez <strong>${montantUSD}</strong> via PayPal :
                </p>
              </div>
              <div style={{ background: '#EFF6FF', border: '2px solid #BFDBFE', borderRadius: 12, padding: '16px 20px', marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#1E40AF', marginBottom: 4, fontWeight: 600 }}>Compte PayPal MediForm Haiti</div>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: '#1E3A8A' }}>{contact}</div>
              </div>
              <div style={{ background: '#F4FAF6', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#4A7A5A', lineHeight: 1.6, margin: 0 }}>
                  📸 Envoyez une capture du paiement avec votre email pour activation sous 24h.
                </p>
              </div>
              <button onClick={onFermer} style={{ width: '100%', padding: '14px', background: '#003087', color: 'white', border: 'none', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                J'ai effectué le paiement ✓
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
