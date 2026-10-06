import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { evaluateMoodQuiz } from '../utils/moodLogic';
import { Sparkles, CheckCircle2, ArrowRight, RotateCcw, X } from 'lucide-react';

export default function MoodFinderModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    feeling: '',
    goal: '',
    budget: '',
  });
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  function handleSelectFeeling(val) {
    setAnswers((prev) => ({ ...prev, feeling: val }));
    setStep(2);
  }

  function handleSelectGoal(val) {
    setAnswers((prev) => ({ ...prev, goal: val }));
    setStep(3);
  }

  function handleSelectBudget(val) {
    const updated = { ...answers, budget: val };
    setAnswers(updated);
    const calculatedResult = evaluateMoodQuiz(updated);
    setResult(calculatedResult);
    setStep(4);
  }

  function handleReset() {
    setStep(1);
    setAnswers({ feeling: '', goal: '', budget: '' });
    setResult(null);
  }

  function handleExploreProducts() {
    onClose();
    if (result) {
      navigate(`/products?mood=${result.targetMood}`);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: '#94a3b8' }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#fef3c7', color: '#b45309', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            <Sparkles size={14} /> Mood Discovery Engine
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Find Your Vibe Match
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            3 simple questions to calculate products perfectly synced with how you feel.
          </p>
        </div>

        {/* Step Indicator */}
        {step < 4 && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: step >= s ? 'var(--primary)' : '#e2e8f0',
                  transition: 'background-color 0.3s ease',
                }}
              />
            ))}
          </div>
        )}

        {/* Step 1: Feeling */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' }}>
              1. How are you feeling right now?
            </h3>
            <button onClick={() => handleSelectFeeling('happy')} className="quiz-option-btn">
              <span>😊 Happy & Radiant</span>
            </button>
            <button onClick={() => handleSelectFeeling('calm')} className="quiz-option-btn">
              <span>🌿 Calm & Peaceful</span>
            </button>
            <button onClick={() => handleSelectFeeling('energetic')} className="quiz-option-btn">
              <span>⚡ High Energy & Playful</span>
            </button>
            <button onClick={() => handleSelectFeeling('tired')} className="quiz-option-btn">
              <span>😴 Tired & Need Unwinding</span>
            </button>
            <button onClick={() => handleSelectFeeling('stressed')} className="quiz-option-btn">
              <span>🤯 Stressed & Overwhelmed</span>
            </button>
            <button onClick={() => handleSelectFeeling('focused')} className="quiz-option-btn">
              <span>💼 Focused & Ready for Deep Work</span>
            </button>
          </div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' }}>
              2. What do you want to achieve or experience?
            </h3>
            <button onClick={() => handleSelectGoal('relax')} className="quiz-option-btn">
              <span>🛋️ Relax, breathe, and slow down</span>
            </button>
            <button onClick={() => handleSelectGoal('celebrate')} className="quiz-option-btn">
              <span>🎉 Celebrate and hype up the evening</span>
            </button>
            <button onClick={() => handleSelectGoal('focus')} className="quiz-option-btn">
              <span>🎯 Deep focus and crush tasks</span>
            </button>
            <button onClick={() => handleSelectGoal('refresh')} className="quiz-option-btn">
              <span>🌸 Refresh my energy and spirits</span>
            </button>
            <button onClick={() => handleSelectGoal('treat')} className="quiz-option-btn">
              <span>🎁 Treat myself to feel good</span>
            </button>
          </div>
        )}

        {/* Step 3: Budget */}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' }}>
              3. What is your preferred budget range?
            </h3>
            <button onClick={() => handleSelectBudget('under-500')} className="quiz-option-btn">
              <span>🏷️ Under ₹500 (Everyday Treats)</span>
            </button>
            <button onClick={() => handleSelectBudget('500-1000')} className="quiz-option-btn">
              <span>🏷️ ₹500 – ₹1,000 (Popular Comforts)</span>
            </button>
            <button onClick={() => handleSelectBudget('1000-2500')} className="quiz-option-btn">
              <span>🏷️ ₹1,000 – ₹2,500 (Elevated Gear)</span>
            </button>
            <button onClick={() => handleSelectBudget('2500-plus')} className="quiz-option-btn">
              <span>🏷️ ₹2,500+ (Premium Upgrades)</span>
            </button>
          </div>
        )}

        {/* Step 4: Results Display */}
        {step === 4 && result && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                background: result.moodInfo.badgeBg,
                color: result.moodInfo.color,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                marginBottom: '1rem',
              }}
            >
              {result.moodInfo.emoji}
            </div>

            <div
              style={{
                display: 'inline-block',
                padding: '0.35rem 1rem',
                borderRadius: '9999px',
                background: '#ecfdf5',
                color: '#047857',
                border: '1px solid #a7f3d0',
                fontWeight: '800',
                fontSize: '0.9rem',
                marginBottom: '0.75rem',
              }}
            >
              ✨ {result.matchScore}% Mood Match Calculated
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              {result.moodInfo.label} Vibe
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              {result.moodInfo.tagline}. We analyzed your inputs and found curated items tailored to your mood.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={handleExploreProducts} className="btn btn-primary btn-lg">
                Explore {result.moodInfo.label} Picks <ArrowRight size={17} />
              </button>
              <button onClick={handleReset} className="btn btn-outline btn-lg" title="Retake Quiz">
                <RotateCcw size={16} /> Retake
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
