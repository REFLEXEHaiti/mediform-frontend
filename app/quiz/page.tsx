// app/quiz/page.tsx — MediForm Haiti
// Quiz médicaux générés par IA + Examens planifiés par les formateurs
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTenant } from '@/lib/tenantContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const VERT = '#1B6B45';
const BLEU = '#1E5FA8';

// ── Types ──────────────────────────────────────────────────────
interface Question {
  id: string;
  texte: string;
  options: string[];
  bonneReponse: number;
  explication: string;
}

interface Quiz {
  id: string;
  titre: string;
  categorie: string;
  niveau: 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';
  nbQuestions: number;
  dureeMin: number;
  type: 'IA' | 'EXAMEN';
  statut?: 'OUVERT' | 'FERME' | 'PROGRAMME';
  dateDebut?: string;
  dateFin?: string;
  formateurNom?: string;
  questions?: Question[];
  tentatives?: number;
  meilleurScore?: number;
}

// ── Données démo ────────────────────────────────────────────────
const QUIZ_DEMO: Quiz[] = [
  { id: 'q1', titre: 'Pharmacologie — Antibiotiques essentiels', categorie: 'Pharmacologie', niveau: 'INTERMEDIAIRE', nbQuestions: 10, dureeMin: 15, type: 'IA', tentatives: 0 },
  { id: 'q2', titre: 'Soins infirmiers — Constantes vitales', categorie: 'Soins infirmiers', niveau: 'DEBUTANT', nbQuestions: 8, dureeMin: 10, type: 'IA', tentatives: 1, meilleurScore: 75 },
  { id: 'q3', titre: 'Urgences — Réanimation cardiopulmonaire', categorie: 'Urgences', niveau: 'AVANCE', nbQuestions: 15, dureeMin: 20, type: 'IA', tentatives: 0 },
  { id: 'q4', titre: 'Obstétrique — Suivi de grossesse normale', categorie: 'Obstétrique', niveau: 'INTERMEDIAIRE', nbQuestions: 12, dureeMin: 18, type: 'IA', tentatives: 0 },
];

const EXAMENS_DEMO: Quiz[] = [
  { id: 'e1', titre: 'Examen final — Module Soins infirmiers avancés', categorie: 'Soins infirmiers', niveau: 'AVANCE', nbQuestions: 30, dureeMin: 60, type: 'EXAMEN', statut: 'OUVERT', dateDebut: '2026-04-15', dateFin: '2026-04-20', formateurNom: 'Dr. Jean-Pierre Moreau' },
  { id: 'e2', titre: 'Évaluation mi-parcours — Pharmacologie clinique', categorie: 'Pharmacologie', niveau: 'INTERMEDIAIRE', nbQuestions: 20, dureeMin: 45, type: 'EXAMEN', statut: 'PROGRAMME', dateDebut: '2026-05-01', dateFin: '2026-05-03', formateurNom: 'Dr. Marie Théodore' },
  { id: 'e3', titre: 'Certification — Urgences pédiatriques', categorie: 'Pédiatrie', niveau: 'AVANCE', nbQuestions: 25, dureeMin: 50, type: 'EXAMEN', statut: 'FERME', dateDebut: '2026-03-10', dateFin: '2026-03-12', formateurNom: 'Dr. Paul Étienne' },
];

const NIV_CFG: Record<string, { bg: string; text: string; label: string }> = {
  DEBUTANT:      { bg: '#DCFCE7', text: '#166534', label: '🟢 Débutant' },
  INTERMEDIAIRE: { bg: '#DBEAFE', text: '#1E40AF', label: '🔵 Intermédiaire' },
  AVANCE:        { bg: '#FCE7F3', text: '#9D174D', label: '🔴 Avancé' },
};

const STATUT_CFG: Record<string, { label: string; couleur: string; bg: string }> = {
  OUVERT:    { label: '✅ Ouvert',    couleur: '#059669', bg: '#DCFCE7' },
  PROGRAMME: { label: '📅 Programmé', couleur: BLEU,      bg: '#DBEAFE' },
  FERME:     { label: '🔒 Fermé',     couleur: '#64748B', bg: '#F1F5F9' },
};

const CATS = ['Tous', 'Soins infirmiers', 'Pharmacologie', 'Urgences', 'Obstétrique', 'Pédiatrie', 'Médecine tropicale', 'Médecine interne'];

// ── Composant quiz en cours ─────────────────────────────────────
function QuizActif({ quiz, onTerminer }: { quiz: Quiz; onTerminer: (score: number) => void }) {
  const [questions, setQuestions]   = useState<Question[]>(quiz.questions ?? []);
  const [chargement, setChargement] = useState(!quiz.questions?.length);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [reponses, setReponses]     = useState<number[]>([]);
  const [reponseChoisie, setReponseChoisie] = useState<number | null>(null);
  const [valide, setValide]         = useState(false);
  const [termine, setTermine]       = useState(false);
  const [tempsRestant, setTempsRestant] = useState(quiz.dureeMin * 60);

  // Générer les questions via API IA
  useEffect(() => {
    if (quiz.questions?.length) return;
    setChargement(true);
    api.post('/quiz/generer', {
      categorie: quiz.categorie,
      niveau: quiz.niveau,
      nbQuestions: quiz.nbQuestions,
      titre: quiz.titre,
    })
      .then(({ data }) => {
        if (Array.isArray(data) && data.length) setQuestions(data);
        else setQuestions(QUESTIONS_DEMO_FALLBACK(quiz.categorie, quiz.nbQuestions));
      })
      .catch(() => {
        setQuestions(QUESTIONS_DEMO_FALLBACK(quiz.categorie, quiz.nbQuestions));
      })
      .finally(() => setChargement(false));
  }, [quiz.id]);

  // Compte à rebours
  useEffect(() => {
    if (termine || chargement) return;
    const t = setInterval(() => {
      setTempsRestant(prev => {
        if (prev <= 1) { clearInterval(t); terminerQuiz(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [termine, chargement]);

  const terminerQuiz = () => {
    const bonnes = reponses.filter((r, i) => questions[i] && r === questions[i].bonneReponse).length;
    const score = Math.round((bonnes / questions.length) * 100);
    setTermine(true);
    onTerminer(score);
  };

  const choisir = (idx: number) => {
    if (valide) return;
    setReponseChoisie(idx);
  };

  const validerReponse = () => {
    if (reponseChoisie === null) return;
    setReponses(prev => [...prev, reponseChoisie]);
    setValide(true);
  };

  const suivant = () => {
    if (questionIdx + 1 >= questions.length) {
      terminerQuiz();
    } else {
      setQuestionIdx(prev => prev + 1);
      setReponseChoisie(null);
      setValide(false);
    }
  };

  const mm = Math.floor(tempsRestant / 60).toString().padStart(2, '0');
  const ss = (tempsRestant % 60).toString().padStart(2, '0');
  const pct = ((questionIdx + (valide ? 1 : 0)) / quiz.nbQuestions) * 100;

  if (chargement) return (
    <div style={{ textAlign: 'center', padding: '64px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16, animation: 'pulse 1.5s infinite' }}>🤖</div>
      <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: VERT, margin: '0 0 8px', fontWeight: 'normal' }}>L'IA génère vos questions…</h3>
      <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#4A7A5A' }}>
        Création de {quiz.nbQuestions} questions sur <strong>{quiz.categorie}</strong>
      </p>
      <div style={{ width: 200, height: 4, background: '#D1E7D9', borderRadius: 2, margin: '20px auto', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: VERT, animation: 'loading 1.5s ease-in-out infinite', borderRadius: 2 }} />
      </div>
      <style>{`@keyframes loading{0%{width:0%}50%{width:70%}100%{width:100%}}`}</style>
    </div>
  );

  const q = questions[questionIdx];
  if (!q) return null;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: '#0D2818', margin: '0 0 4px', fontWeight: 'normal' }}>{quiz.titre}</h3>
          <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#4A7A5A' }}>
            Question {questionIdx + 1} / {questions.length}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: tempsRestant < 60 ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${tempsRestant < 60 ? '#FCA5A5' : '#BBF7D0'}`, borderRadius: 8, padding: '6px 12px', fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 700, color: tempsRestant < 60 ? '#DC2626' : VERT }}>
            ⏱ {mm}:{ss}
          </div>
        </div>
      </div>

      {/* Barre progression */}
      <div style={{ height: 6, background: '#E8F5ED', borderRadius: 3, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: `linear-gradient(90deg, ${VERT}, ${BLEU})`, width: `${pct}%`, borderRadius: 3, transition: 'width 0.3s' }} />
      </div>

      {/* Question */}
      <div style={{ background: 'white', border: '1px solid #D1E7D9', borderRadius: 16, padding: '24px 28px', marginBottom: 20 }}>
        <p style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: '#0D2818', lineHeight: 1.6, margin: 0 }}>{q.texte}</p>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {q.options.map((opt, i) => {
          let bg = 'white', border = '#D1E7D9', color = '#0D2818';
          if (valide) {
            if (i === q.bonneReponse) { bg = '#DCFCE7'; border = '#16A34A'; color = '#166534'; }
            else if (i === reponseChoisie) { bg = '#FEF2F2'; border = '#DC2626'; color = '#991B1B'; }
          } else if (i === reponseChoisie) {
            bg = `${VERT}08`; border = VERT; color = VERT;
          }
          return (
            <button key={i} onClick={() => choisir(i)}
              style={{ padding: '14px 18px', borderRadius: 12, border: `2px solid ${border}`, background: bg, color, cursor: valide ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, fontWeight: i === reponseChoisie || (valide && i === q.bonneReponse) ? 700 : 400, textAlign: 'left', transition: 'all 0.15s' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === reponseChoisie ? VERT : border, color: i === reponseChoisie ? 'white' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                {valide && i === q.bonneReponse ? '✓' : valide && i === reponseChoisie && i !== q.bonneReponse ? '✗' : String.fromCharCode(65 + i)}
              </div>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explication */}
      {valide && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 4 }}>💡 Explication</div>
          <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#166534', lineHeight: 1.6, margin: 0 }}>{q.explication}</p>
        </div>
      )}

      {/* Boutons */}
      <div style={{ display: 'flex', gap: 10 }}>
        {!valide ? (
          <button onClick={validerReponse} disabled={reponseChoisie === null}
            style={{ flex: 1, padding: '14px', background: reponseChoisie !== null ? VERT : '#D1E7D9', color: reponseChoisie !== null ? 'white' : '#6B9E7A', border: 'none', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: reponseChoisie !== null ? 'pointer' : 'default' }}>
            Valider la réponse →
          </button>
        ) : (
          <button onClick={suivant}
            style={{ flex: 1, padding: '14px', background: VERT, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            {questionIdx + 1 >= questions.length ? 'Voir mes résultats →' : 'Question suivante →'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Résultats ───────────────────────────────────────────────────
function Resultats({ quiz, score, onRecommencer, onRetour }: { quiz: Quiz; score: number; onRecommencer: () => void; onRetour: () => void }) {
  const mention = score >= 90 ? { label: 'Excellent !', emoji: '🏆', couleur: '#059669' }
    : score >= 75 ? { label: 'Très bien', emoji: '🎉', couleur: VERT }
    : score >= 60 ? { label: 'Bien', emoji: '👍', couleur: BLEU }
    : { label: 'À réviser', emoji: '📚', couleur: '#D97706' };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>{mention.emoji}</div>
      <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 28, color: '#0D2818', margin: '0 0 8px', fontWeight: 'normal' }}>{mention.label}</h2>
      <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 16, color: '#4A7A5A', margin: '0 0 28px' }}>{quiz.titre}</p>

      <div style={{ background: 'white', border: '1px solid #D1E7D9', borderRadius: 20, padding: '32px', marginBottom: 24 }}>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: 64, fontWeight: 700, color: mention.couleur, lineHeight: 1 }}>{score}</div>
        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 16, color: '#4A7A5A', marginTop: 4 }}>points sur 100</div>
        <div style={{ height: 8, background: '#E8F5ED', borderRadius: 4, margin: '20px 0 8px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: mention.couleur, width: `${score}%`, borderRadius: 4, transition: 'width 1s' }} />
        </div>
        <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#6B9E7A' }}>
          {Math.round(score / 100 * quiz.nbQuestions)} / {quiz.nbQuestions} bonnes réponses
        </div>
      </div>

      {score >= 75 && quiz.type === 'EXAMEN' && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '16px', marginBottom: 20 }}>
          <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 14, color: '#166534', fontWeight: 700 }}>
            🏅 Félicitations ! Vous êtes éligible à la certification.
          </div>
          <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#4A7A5A', marginTop: 4 }}>
            Votre certificat numérique sera disponible dans votre profil sous 24h.
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={onRecommencer} style={{ width: '100%', padding: '14px', background: VERT, color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          🔄 Recommencer le quiz
        </button>
        <button onClick={onRetour} style={{ width: '100%', padding: '14px', background: 'white', color: VERT, border: `2px solid ${VERT}`, borderRadius: 10, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          ← Retour aux quiz
        </button>
      </div>
    </div>
  );
}

// ── Questions démo si API échoue ─────────────────────────────────
function QUESTIONS_DEMO_FALLBACK(categorie: string, nb: number): Question[] {
  const base: Question[] = [
    { id: 'q1', texte: 'Quelle est la fréquence cardiaque normale chez un adulte au repos ?', options: ['40-60 bpm', '60-100 bpm', '100-120 bpm', '120-140 bpm'], bonneReponse: 1, explication: 'La fréquence cardiaque normale chez un adulte au repos est de 60 à 100 battements par minute (bpm). En dessous de 60 on parle de bradycardie, au-dessus de 100 de tachycardie.' },
    { id: 'q2', texte: 'Quelle est la tension artérielle normale chez un adulte ?', options: ['90/60 mmHg', '120/80 mmHg', '140/90 mmHg', '160/100 mmHg'], bonneReponse: 1, explication: 'La pression artérielle normale est de 120/80 mmHg. Au-dessus de 140/90 on parle d\'hypertension artérielle.' },
    { id: 'q3', texte: 'Quel est le premier geste en cas d\'arrêt cardiaque ?', options: ['Appeler la famille', 'Appeler les secours et débuter le MCE', 'Attendre l\'ambulance', 'Administrer un médicament'], bonneReponse: 1, explication: 'En cas d\'arrêt cardiaque, il faut immédiatement appeler les secours (appel d\'urgence) et débuter le massage cardiaque externe (MCE) à raison de 30 compressions pour 2 insufflations.' },
    { id: 'q4', texte: 'Combien de temps peut-on laisser un garrot sans risque de nécrose ?', options: ['30 minutes', '1 heure', '2 heures', '4 heures'], bonneReponse: 1, explication: 'Un garrot doit être desserré au maximum toutes les heures pour éviter la nécrose ischémique des tissus. La durée maximale recommandée sans relâchement est de 1 heure.' },
    { id: 'q5', texte: 'Quelle est la voie d\'administration d\'un médicament intramusculaire ?', options: ['Dans la veine', 'Dans le muscle', 'Sous la peau', 'Par voie orale'], bonneReponse: 1, explication: 'Un médicament intramusculaire (IM) est injecté directement dans le muscle, généralement dans le deltoïde, le fessier ou la cuisse. Cette voie permet une absorption plus rapide que la voie sous-cutanée.' },
    { id: 'q6', texte: 'Quelle est la saturation en oxygène (SpO2) normale ?', options: ['85-90%', '90-94%', '95-100%', '100%'], bonneReponse: 2, explication: 'La saturation en oxygène normale est entre 95% et 100%. En dessous de 90%, on parle d\'hypoxémie nécessitant une oxygénothérapie.' },
    { id: 'q7', texte: 'Quel médicament est utilisé en première intention pour une crise d\'asthme légère ?', options: ['Adrénaline', 'Salbutamol (Ventolin)', 'Cortisone', 'Amoxicilline'], bonneReponse: 1, explication: 'Le salbutamol (Ventolin) est un bronchodilatateur bêta-2 agoniste à courte durée d\'action, utilisé en première intention lors d\'une crise d\'asthme légère à modérée.' },
    { id: 'q8', texte: 'Quelle est la température corporelle normale ?', options: ['35°C', '36-37.5°C', '38°C', '39°C'], bonneReponse: 1, explication: 'La température corporelle normale est entre 36°C et 37.5°C. Au-dessus de 38°C on parle de fièvre, au-dessus de 40°C d\'hyperthermie sévère.' },
    { id: 'q9', texte: 'Quel est le signe principal d\'une déshydratation sévère ?', options: ['Rougeur de la peau', 'Pli cutané persistant', 'Augmentation de la diurèse', 'Bradycardie'], bonneReponse: 1, explication: 'Le pli cutané persistant (signe du pli) est un signe classique de déshydratation. En pinçant la peau, elle ne reprend pas rapidement sa position initiale, indiquant une perte hydrique significative.' },
    { id: 'q10', texte: 'Quelle est la posologie standard du paracétamol chez l\'adulte ?', options: ['250 mg toutes les 4h', '500-1000 mg toutes les 6-8h', '2000 mg toutes les 12h', '100 mg toutes les 2h'], bonneReponse: 1, explication: 'Le paracétamol chez l\'adulte se prescrit à 500-1000 mg toutes les 6 à 8 heures, sans dépasser 3-4g/jour. C\'est l\'analgésique et antipyrétique de référence en Haïti.' },
  ];
  return base.slice(0, Math.min(nb, base.length));
}

// ── Page principale ─────────────────────────────────────────────
export default function PageQuiz() {
  const { estConnecte, utilisateur } = useAuthStore();
  const { config } = useTenant();

  const [onglet, setOnglet]         = useState<'quiz' | 'examens'>('quiz');
  const [filtreCat, setFiltreCat]   = useState('Tous');
  const [quizActif, setQuizActif]   = useState<Quiz | null>(null);
  const [score, setScore]           = useState<number | null>(null);
  const [quizList, setQuizList]     = useState<Quiz[]>(QUIZ_DEMO);
  const [examens, setExamens]       = useState<Quiz[]>(EXAMENS_DEMO);
  const [modalCreer, setModalCreer] = useState(false);
  const [formExamen, setFormExamen] = useState({
    titre: '', categorie: 'Soins infirmiers', niveau: 'INTERMEDIAIRE',
    nbQuestions: 20, dureeMin: 45, dateDebut: '', dateFin: '', coursId: '',
  });
  const [envoi, setEnvoi]           = useState(false);

  const primaire   = config?.couleursTheme.primaire   ?? VERT;
  const secondaire = config?.couleursTheme.secondaire ?? BLEU;
  const estAdmin   = ['ADMIN', 'FORMATEUR'].includes(utilisateur?.role ?? '');

  useEffect(() => {
    api.get('/quiz').then(({ data }) => { if (Array.isArray(data) && data.length) setQuizList(data); }).catch(() => {});
    api.get('/examens').then(({ data }) => { if (Array.isArray(data) && data.length) setExamens(data); }).catch(() => {});
  }, []);

  const lancerQuiz = (q: Quiz) => {
    if (!estConnecte) { window.location.href = '/auth/connexion'; return; }
    setScore(null);
    setQuizActif(q);
  };

  const terminerQuiz = async (s: number) => {
    setScore(s);
    // Sauvegarder le score
    if (quizActif) {
      await api.post(`/quiz/${quizActif.id}/resultat`, { score: s }).catch(() => {});
      setQuizList(prev => prev.map(q => q.id === quizActif.id ? { ...q, tentatives: (q.tentatives ?? 0) + 1, meilleurScore: Math.max(q.meilleurScore ?? 0, s) } : q));
    }
  };

  const creerExamen = async (e: React.FormEvent) => {
    e.preventDefault(); setEnvoi(true);
    try {
      const { data } = await api.post('/examens', formExamen);
      setExamens(prev => [data, ...prev]);
      toast.success('✅ Examen planifié !');
      setModalCreer(false);
    } catch {
      // Créer localement
      const nouveau: Quiz = { ...formExamen, id: 'local_' + Date.now(), type: 'EXAMEN', statut: 'PROGRAMME', formateurNom: `${utilisateur?.prenom} ${utilisateur?.nom}` };
      setExamens(prev => [nouveau, ...prev]);
      toast.success('✅ Examen planifié !');
      setModalCreer(false);
    }
    setEnvoi(false);
  };

  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1.5px solid #D1E7D9', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: "'Helvetica Neue',Arial,sans-serif", boxSizing: 'border-box', color: '#0D2818', background: 'white' };

  // Vue quiz actif
  if (quizActif && score === null) return (
    <div style={{ background: '#F4FAF6', minHeight: '100vh', padding: 'clamp(24px,4vw,48px) clamp(20px,5vw,48px)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <button onClick={() => setQuizActif(null)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#4A7A5A', marginBottom: 20, padding: 0 }}>
          ← Abandonner le quiz
        </button>
        <QuizActif quiz={quizActif} onTerminer={terminerQuiz} />
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );

  // Vue résultats
  if (quizActif && score !== null) return (
    <div style={{ background: '#F4FAF6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <Resultats quiz={quizActif} score={score} onRecommencer={() => { setScore(null); }} onRetour={() => { setQuizActif(null); setScore(null); }} />
      </div>
    </div>
  );

  const quizFiltres = quizList.filter(q => filtreCat === 'Tous' || q.categorie === filtreCat);

  return (
    <div style={{ background: '#F4FAF6', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, #0D2818 0%, ${primaire} 100%)`, padding: 'clamp(40px,6vw,64px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: secondaire, fontWeight: 700, marginBottom: 12 }}>
              Quiz IA & Examens médicaux
            </div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(26px,4vw,44px)', color: 'white', margin: '0 0 10px', fontWeight: 'normal' }}>
              Évaluations MediForm
            </h1>
            <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.7)', maxWidth: 480, margin: 0, lineHeight: 1.6 }}>
              Quiz générés par l'IA pour tester vos connaissances médicales, et examens planifiés par vos formateurs.
            </p>
          </div>
          {estAdmin && (
            <button onClick={() => setModalCreer(true)}
              style={{ padding: '13px 24px', background: secondaire, color: 'white', border: 'none', borderRadius: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              📋 Planifier un examen
            </button>
          )}
        </div>

        {/* Onglets */}
        <div style={{ maxWidth: 1200, margin: '20px auto 0', display: 'flex', gap: 8 }}>
          {[{ id: 'quiz', label: '🤖 Quiz IA', desc: 'Questions générées par intelligence artificielle' }, { id: 'examens', label: '📋 Examens', desc: 'Évaluations planifiées par les formateurs' }].map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id as any)}
              style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: onglet === o.id ? 'white' : 'rgba(255,255,255,0.15)', color: onglet === o.id ? primaire : 'rgba(255,255,255,0.85)', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: onglet === o.id ? 700 : 400, cursor: 'pointer' }}>
              {o.label}
            </button>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(32px,4vw,48px) clamp(20px,5vw,48px)' }}>

        {/* ── Quiz IA ── */}
        {onglet === 'quiz' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
              {CATS.map(cat => (
                <button key={cat} onClick={() => setFiltreCat(cat)}
                  style={{ padding: '7px 14px', borderRadius: 100, border: `1.5px solid ${filtreCat === cat ? primaire : '#D1E7D9'}`, background: filtreCat === cat ? primaire : 'white', color: filtreCat === cat ? 'white' : '#4A7A5A', fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, fontWeight: filtreCat === cat ? 700 : 400, cursor: 'pointer' }}>
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {quizFiltres.map(q => {
                const niv = NIV_CFG[q.niveau];
                return (
                  <div key={q.id} style={{ background: 'white', border: '1px solid #D1E7D9', borderRadius: 14, overflow: 'hidden', transition: 'box-shadow 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${primaire}15`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>

                    <div style={{ height: 5, background: `linear-gradient(90deg, ${primaire}, ${secondaire})` }} />
                    <div style={{ padding: '20px 22px' }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                        <span style={{ background: niv.bg, color: niv.text, fontSize: 11, padding: '3px 10px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>{niv.label}</span>
                        <span style={{ background: `${secondaire}10`, color: secondaire, fontSize: 11, padding: '3px 10px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>🤖 IA</span>
                      </div>

                      <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, color: '#0D2818', margin: '0 0 8px', fontWeight: 'normal', lineHeight: 1.4 }}>{q.titre}</h3>
                      <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#4A7A5A', margin: '0 0 14px' }}>{q.categorie}</p>

                      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#6B9E7A' }}>❓ {q.nbQuestions} questions</span>
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#6B9E7A' }}>⏱ {q.dureeMin} min</span>
                      </div>

                      {q.meilleurScore !== undefined && q.tentatives && q.tentatives > 0 && (
                        <div style={{ background: '#F0FDF4', borderRadius: 8, padding: '8px 12px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#166534' }}>Meilleur score</span>
                          <span style={{ fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 700, color: primaire }}>{q.meilleurScore}%</span>
                        </div>
                      )}

                      <button onClick={() => lancerQuiz(q)}
                        style={{ width: '100%', padding: '12px', background: primaire, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                        {q.tentatives && q.tentatives > 0 ? '🔄 Recommencer' : '▶ Commencer le quiz'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Examens ── */}
        {onglet === 'examens' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {examens.map(ex => {
              const statut = STATUT_CFG[ex.statut ?? 'FERME'];
              const niv = NIV_CFG[ex.niveau];
              const ouvert = ex.statut === 'OUVERT';
              return (
                <div key={ex.id} style={{ background: 'white', border: `1px solid ${ouvert ? primaire + '40' : '#D1E7D9'}`, borderRadius: 14, overflow: 'hidden' }}>
                  {ouvert && <div style={{ height: 4, background: `linear-gradient(90deg, ${primaire}, ${secondaire})` }} />}
                  <div style={{ padding: '22px 26px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, fontWeight: 700, color: statut.couleur, background: statut.bg, padding: '3px 10px', borderRadius: 100 }}>{statut.label}</span>
                        <span style={{ background: niv.bg, color: niv.text, fontSize: 11, padding: '3px 10px', borderRadius: 100, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700 }}>{niv.label}</span>
                      </div>
                      <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: '#0D2818', margin: '0 0 6px', fontWeight: 'normal' }}>{ex.titre}</h3>
                      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#4A7A5A' }}>👨‍⚕️ {ex.formateurNom}</span>
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#4A7A5A' }}>❓ {ex.nbQuestions} questions</span>
                        <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#4A7A5A' }}>⏱ {ex.dureeMin} min</span>
                        {ex.dateDebut && <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, color: '#4A7A5A' }}>📅 {new Date(ex.dateDebut).toLocaleDateString('fr-FR')} → {ex.dateFin ? new Date(ex.dateFin).toLocaleDateString('fr-FR') : '—'}</span>}
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {ouvert ? (
                        <button onClick={() => lancerQuiz(ex)}
                          style={{ padding: '12px 24px', background: primaire, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                          ▶ Passer l'examen
                        </button>
                      ) : (
                        <div style={{ padding: '12px 24px', background: '#F1F5F9', color: '#94A3B8', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 13, textAlign: 'center' }}>
                          {ex.statut === 'PROGRAMME' ? '📅 Bientôt' : '🔒 Terminé'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal créer examen */}
      {modalCreer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '28px 32px', width: '100%', maxWidth: 540, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, paddingBottom: 14, borderBottom: `2px solid ${primaire}` }}>
              <div>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: primaire, margin: '0 0 4px' }}>Planifier un examen</h2>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: '#4A7A5A', margin: 0 }}>Les questions seront générées automatiquement par l'IA</p>
              </div>
              <button onClick={() => setModalCreer(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B' }}>✕</button>
            </div>
            <form onSubmit={creerExamen} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0D2818', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Titre de l'examen *</label>
                <input value={formExamen.titre} required onChange={e => setFormExamen(p => ({ ...p, titre: e.target.value }))} placeholder="Ex : Examen final — Soins infirmiers avancés" style={inp} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0D2818', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Catégorie médicale</label>
                  <select value={formExamen.categorie} onChange={e => setFormExamen(p => ({ ...p, categorie: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
                    {CATS.filter(c => c !== 'Tous').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0D2818', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Niveau</label>
                  <select value={formExamen.niveau} onChange={e => setFormExamen(p => ({ ...p, niveau: e.target.value }))} style={{ ...inp, appearance: 'none' as any }}>
                    <option value="DEBUTANT">🟢 Débutant</option>
                    <option value="INTERMEDIAIRE">🔵 Intermédiaire</option>
                    <option value="AVANCE">🔴 Avancé</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0D2818', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Nombre de questions</label>
                  <input type="number" min={5} max={50} value={formExamen.nbQuestions} onChange={e => setFormExamen(p => ({ ...p, nbQuestions: parseInt(e.target.value) }))} style={inp} />
                </div>
                <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0D2818', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Durée (minutes)</label>
                  <input type="number" min={10} max={180} value={formExamen.dureeMin} onChange={e => setFormExamen(p => ({ ...p, dureeMin: parseInt(e.target.value) }))} style={inp} />
                </div>
              </div>

              {/* Période d'accès — clé de la fonctionnalité */}
              <div style={{ background: `${secondaire}08`, border: `1px solid ${secondaire}25`, borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 700, color: secondaire, marginBottom: 10 }}>
                  📅 Période d'accès à l'examen
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#0D2818', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Ouverture</label>
                    <input type="datetime-local" value={formExamen.dateDebut} onChange={e => setFormExamen(p => ({ ...p, dateDebut: e.target.value }))} style={inp} />
                  </div>
                  <div><label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#0D2818', marginBottom: 6, fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>Fermeture</label>
                    <input type="datetime-local" value={formExamen.dateFin} onChange={e => setFormExamen(p => ({ ...p, dateFin: e.target.value }))} style={inp} />
                  </div>
                </div>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 11, color: '#4A7A5A', margin: '8px 0 0' }}>
                  💡 Les apprenants ne pourront passer l'examen qu'entre ces deux dates. Laissez vide pour un accès immédiat et permanent.
                </p>
              </div>

              <div style={{ background: `${primaire}06`, border: `1px solid ${primaire}20`, borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 12, color: primaire, margin: 0, lineHeight: 1.6 }}>
                  🤖 <strong>Génération IA :</strong> Les {formExamen.nbQuestions} questions seront générées automatiquement à partir de la catégorie <strong>{formExamen.categorie}</strong> au niveau <strong>{formExamen.niveau.toLowerCase()}</strong>, avec explication pour chaque réponse.
                </p>
              </div>

              <button type="submit" disabled={envoi}
                style={{ width: '100%', padding: '14px', background: primaire, color: 'white', border: 'none', borderRadius: 8, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                {envoi ? '⏳ Planification…' : '📋 Planifier l\'examen →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
