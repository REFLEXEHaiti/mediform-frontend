// app/paiement/annule/page.tsx — TechPro Haiti
'use client';

import Link from 'next/link';
import { useTenant } from '@/lib/tenantContext';

export default function PagePaiementAnnule() {
  const { config } = useTenant();
  const primaire   = config?.couleursTheme.primaire   ?? '#1B3A6B';

  return (
    <div style={{ minHeight: '100vh', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ background: 'white', borderRadius: 24, padding: 'clamp(32px,5vw,56px)', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.08)', border: '1px solid #FECACA' }}>

        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 40 }}>😕</div>

        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 28, color: '#7F1D1D', margin: '0 0 12px', fontWeight: 'normal' }}>
          Paiement annulé
        </h1>
        <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: '#991B1B', lineHeight: 1.7, margin: '0 0 8px' }}>
          Votre paiement a été annulé.
        </p>
        <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#64748B', lineHeight: 1.7, margin: '0 0 32px' }}>
          Aucun montant n'a été débité. Vous pouvez réessayer à tout moment ou choisir une autre méthode de paiement.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/premium"
            style={{ display: 'inline-block', padding: '14px 32px', background: primaire, color: 'white', borderRadius: 100, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15 }}>
            Réessayer →
          </Link>
          <Link href="/dashboard"
            style={{ display: 'inline-block', padding: '14px 32px', background: 'white', color: primaire, border: `2px solid ${primaire}`, borderRadius: 100, textDecoration: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15 }}>
            Retour au tableau de bord
          </Link>
        </div>

        <div style={{ marginTop: 24, background: '#F0F4FA', borderRadius: 10, padding: '14px 18px' }}>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.6 }}>
            💡 <strong>Besoin d'aide ?</strong> Contactez-nous à{' '}
            <a href={`mailto:${config?.emailContact ?? 'contact@techprohaiti.com'}`} style={{ color: primaire, textDecoration: 'none', fontWeight: 700 }}>
              {config?.emailContact ?? 'contact@techprohaiti.com'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
