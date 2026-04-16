// components/paiement/ModalPaiement.tsx — TechPro Haiti
'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useTenant } from '@/lib/tenantContext';
import { useAuthStore } from '@/store/authStore';

interface Props {
  montantHTG: number;
  description: string;
  plan?: string;
  coursId?: string;
  onFermer: () => void;
  onSucces?: () => void;
}

type Methode = 'carte' | 'moncash' | 'paypal' | 'zelle';
type Etape   = 'choix' | 'carte' | 'moncash' | 'paypal' | 'zelle';

export default function ModalPaiement({ montantHTG, description, plan = 'PREMIUM', coursId, onFermer, onSucces }: Props) {
  const { config }  = useTenant();
  const { estConnecte } = useAuthStore();

  const primaire   = config?.couleursTheme.primaire   ?? '#1B3A6B';
  const secondaire = config?.couleursTheme.secondaire ?? '#FF6B35';
  const nomApp     = config?.nom ?? 'TechPro Haiti';
  const contact    = config?.emailContact ?? 'contact@nursingplus.ht';

  const [methode, setMethode]       = useState<Methode | null>(null);
  const [etape, setEtape]           = useState<Etape>('choix');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur]         = useState('');
  const [carte, setCarte]           = useState({ numero: '', expiration: '', cvv: '', nom: '' });

  const montantUSD = (montantHTG / 132).toFixed(2);

  const methodes: { id: Methode; label: string; sous: string; couleur: string; icone: string; recommande?: boolean }[] = [
    { id: 'carte',   label: 'Carte Visa / Mastercard', sous: 'Paiement sécurisé — SSL',     couleur: '#635BFF', icone: '💳', recommande: true },
    { id: 'moncash', label: 'MonCash',                  sous: 'Mobile money Digicel Haïti',  couleur: '#FF6600', icone: '📱', recommande: true },
    { id: 'paypal',  label: 'PayPal',                   sous: 'Paiement international',      couleur: '#003087', icone: '🅿️' },
    { id: 'zelle',   label: 'Zelle',                    sous: 'Virement USA instantané',     couleur: '#6D1ED4', icone: '💜' },
  ];

  const confirmer = async () => {
    if (!methode) { setErreur('Choisissez une méthode.'); return; }
    setErreur('');
    if (methode !== 'carte') { setEtape(methode); return; }
    setChargement(true);
    try {
      const { data } = await api.post('/paiements/stripe/session', { plan, coursId, montantHTG });
      if (data.url) { window.location.href = data.url; return; }
    } catch {}
    setEtape('carte');
    setChargement(false);
  };

  const payerCarte = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carte.numero || !carte.expiration || !carte.cvv || !carte.nom) {
      setErreur('Remplissez tous les champs.'); return;
    }
    setChargement(true); setErreur('');
    try {
      await api.post('/paiements/carte', { ...carte, plan, coursId, montantHTG });
      onSucces?.(); onFermer();
    } catch (err: any) {
      setErreur(err.response?.data?.message ?? 'Paiement refusé. Vérifiez vos informations.');
    }
    setChargement(false);
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 14px', border: '1.5px solid #CBD5E1',
    borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: "'Helvetica Neue',Arial,sans-serif", color: '#0D1B2A', background: 'white',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 480, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>

        {/* En-tête */}
        <div style={{ background: `linear-gradient(135deg, #0D1B2A, ${primaire})`, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{nomApp}</div>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: 'white', fontWeight: 700 }}>{description}</div>
            <div style={{ marginTop: 6 }}>
              <span style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 700, color: 'white' }}>{montantHTG.toLocaleString()}</span>
              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.85)' }}> HTG</span>
              <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.55)', marginLeft: 8 }}>≈ ${montantUSD} USD</span>
            </div>
          </div>
          <button onClick={onFermer} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', width: 36, height: 36, borderRadius: '50%', color: 'white', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ padding: '24px' }}>

          {/* Choix méthode */}
          {etape === 'choix' && (
            <>
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#475569', marginBottom: 16 }}>
                Choisissez votre méthode de paiement :
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {methodes.map(m => (
                  <button key={m.id} onClick={() => setMethode(m.id)}
                    style={{ padding: '14px 16px', borderRadius: 12, border: `2px solid ${methode === m.id ? m.couleur : '#CBD5E1'}`, background: methode === m.id ? `${m.couleur}08` : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', transition: 'all 0.15s' }}>
                    <span style={{ fontSize: 26 }}>{m.icone}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, color: methode === m.id ? m.couleur : '#0D1B2A', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {m.label}
                        {m.recommande && <span style={{ fontSize: 10, background: '#DCFCE7', color: '#1E40AF', padding: '2px 7px', borderRadius: 100 }}>✓ Recommandé</span>}
                      </div>
                      <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#64748B', marginTop: 2 }}>{m.sous}</div>
                    </div>
                    {methode === m.id && <div style={{ width: 22, height: 22, borderRadius: '50%', background: m.couleur, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span></div>}
                  </button>
                ))}
              </div>
              {erreur && <div style={{ marginTop: 12, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#EF4444', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>⚠ {erreur}</div>}
              <button onClick={confirmer} disabled={chargement || !methode}
                style={{ width: '100%', marginTop: 20, padding: '16px', background: methode ? primaire : '#CBD5E1', color: methode ? 'white' : '#64748B', border: 'none', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 16, cursor: methode ? 'pointer' : 'default' }}>
                {chargement ? '⏳ Connexion…' : `Payer ${montantHTG.toLocaleString()} HTG →`}
              </button>
              <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 10 }}>🔒 Paiement sécurisé · Certification Tech Partners incluse</p>
            </>
          )}

          {/* Formulaire carte */}
          {etape === 'carte' && (
            <form onSubmit={payerCarte} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ textAlign: 'center', marginBottom: 4 }}>
                <div style={{ fontSize: 36, marginBottom: 6 }}>💳</div>
                <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: '#0D1B2A', margin: '0 0 4px', fontWeight: 'normal' }}>Paiement par carte</h3>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#475569', margin: 0 }}>Visa ou Mastercard — connexion SSL sécurisée</p>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 600, color: '#0D1B2A', marginBottom: 6 }}>Nom sur la carte</label>
                <input value={carte.nom} onChange={e => setCarte(p => ({ ...p, nom: e.target.value }))} placeholder="MARIE DUPONT" style={{ ...inp, textTransform: 'uppercase' as any }} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 600, color: '#0D1B2A', marginBottom: 6 }}>Numéro de carte</label>
                <input value={carte.numero}
                  onChange={e => setCarte(p => ({ ...p, numero: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim() }))}
                  placeholder="4242 4242 4242 4242" maxLength={19} style={inp} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 600, color: '#0D1B2A', marginBottom: 6 }}>Expiration</label>
                  <input value={carte.expiration}
                    onChange={e => { let v = e.target.value.replace(/\D/g, '').slice(0,4); if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2); setCarte(p => ({ ...p, expiration: v })); }}
                    placeholder="MM/AA" maxLength={5} style={inp} />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 600, color: '#0D1B2A', marginBottom: 6 }}>CVV</label>
                  <input value={carte.cvv} type="password"
                    onChange={e => setCarte(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0,4) }))}
                    placeholder="•••" maxLength={4} style={inp} />
                </div>
              </div>
              {erreur && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#EF4444', fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>⚠ {erreur}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => { setEtape('choix'); setErreur(''); }}
                  style={{ flex: 1, padding: '13px', background: 'white', color: primaire, border: `2px solid ${primaire}`, borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>← Retour</button>
                <button type="submit" disabled={chargement}
                  style={{ flex: 2, padding: '13px', background: chargement ? '#475569' : primaire, color: 'white', border: 'none', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                  {chargement ? '⏳ Traitement…' : `Payer ${montantHTG.toLocaleString()} HTG →`}
                </button>
              </div>
            </form>
          )}

          {/* MonCash */}
          {etape === 'moncash' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>📱</div>
                <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: '#0D1B2A', margin: '0 0 8px', fontWeight: 'normal' }}>Paiement MonCash</h3>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#475569', lineHeight: 1.6 }}>Envoyez <strong>{montantHTG.toLocaleString()} HTG</strong> à :</p>
              </div>
              <div style={{ background: '#F0FDF4', border: '2px solid #86EFAC', borderRadius: 12, padding: '18px 20px', marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#1E40AF', marginBottom: 6, fontWeight: 600 }}>Numéro MonCash — {nomApp}</div>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 28, fontWeight: 700, color: '#14532D', letterSpacing: 3 }}>+509 3999-9999</div>
              </div>
              <div style={{ background: '#F0F4FA', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  📸 Envoyez une capture à <strong style={{ color: primaire }}>{contact}</strong> avec votre email pour activer votre accès sous 24h.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setEtape('choix')} style={{ flex: 1, padding: '13px', background: 'white', color: primaire, border: `2px solid ${primaire}`, borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>← Retour</button>
                <button onClick={() => { onSucces?.(); onFermer(); }} style={{ flex: 2, padding: '13px', background: '#FF6600', color: 'white', border: 'none', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>J'ai payé ✓</button>
              </div>
            </div>
          )}

          {/* PayPal */}
          {etape === 'paypal' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🅿️</div>
                <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: '#0D1B2A', margin: '0 0 6px', fontWeight: 'normal' }}>PayPal</h3>
              </div>
              <div style={{ background: '#EFF6FF', border: '2px solid #BFDBFE', borderRadius: 12, padding: '16px 20px', marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#1E40AF', marginBottom: 4, fontWeight: 600 }}>Compte PayPal</div>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: '#1E3A8A' }}>{contact}</div>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#1E40AF', marginTop: 6 }}>Montant : <strong>${montantUSD} USD</strong></div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setEtape('choix')} style={{ flex: 1, padding: '13px', background: 'white', color: primaire, border: `2px solid ${primaire}`, borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>← Retour</button>
                <button onClick={() => { onSucces?.(); onFermer(); }} style={{ flex: 2, padding: '13px', background: '#003087', color: 'white', border: 'none', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>J'ai payé ✓</button>
              </div>
            </div>
          )}

          {/* Zelle */}
          {etape === 'zelle' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>💜</div>
                <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: '#0D1B2A', margin: '0 0 6px', fontWeight: 'normal' }}>Zelle</h3>
              </div>
              <div style={{ background: '#F5F3FF', border: '2px solid #C4B5FD', borderRadius: 12, padding: '16px 20px', marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#5B21B6', marginBottom: 4, fontWeight: 600 }}>Adresse Zelle</div>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: '#3B0764' }}>{contact}</div>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#5B21B6', marginTop: 6 }}>Montant : <strong>${montantUSD} USD</strong></div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setEtape('choix')} style={{ flex: 1, padding: '13px', background: 'white', color: primaire, border: `2px solid ${primaire}`, borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>← Retour</button>
                <button onClick={() => { onSucces?.(); onFermer(); }} style={{ flex: 2, padding: '13px', background: '#6D1ED4', color: 'white', border: 'none', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>J'ai payé ✓</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
