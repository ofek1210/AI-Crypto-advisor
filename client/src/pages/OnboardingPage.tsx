import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { OnboardingAnswers, OnboardingQuestion } from '../types/onboarding';
import { saveOnboarding } from '../services/onboarding.service';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});

  const questions = useMemo<OnboardingQuestion[]>(
    () => [
      {
        id: 'assetInterests',
        title: 'What crypto assets are you interested in?',
        options: [
          { value: 'btc', label: 'Bitcoin (BTC)' },
          { value: 'eth', label: 'Ethereum (ETH)' },
          { value: 'alts', label: 'Altcoins' },
          { value: 'stable', label: 'Stablecoins' },
          { value: 'nft', label: 'NFT-related' }
        ]
      },
      {
        id: 'investorType',
        title: 'What type of investor are you?',
        options: [
          { value: 'hodler', label: 'HODLer' },
          { value: 'day_trader', label: 'Day Trader' },
          { value: 'nft_collector', label: 'NFT Collector' },
          { value: 'defi', label: 'DeFi Explorer' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        id: 'contentType',
        title: 'What kind of content would you like to see?',
        options: [
          { value: 'market_news', label: 'Market News' },
          { value: 'charts', label: 'Charts' },
          { value: 'social', label: 'Social' },
          { value: 'fun', label: 'Fun' },
          { value: 'all', label: 'All of the above' }
        ]
      }
    ],
    []
  );

  const current = questions[step];
  const currentValue = answers[current.id];
  const isAnswered = Boolean(currentValue);

  const updateAnswer = (value: OnboardingAnswers[keyof OnboardingAnswers]) => {
    setAnswers((prev) => ({
      ...prev,
      [current.id]: value
    }));
  };

  const next = () => {
    if (!isAnswered) return;
    if (step < questions.length - 1) {
      setStep((prev) => prev + 1);
    }
  };

  const prev = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  const submit = async () => {
    if (!isAnswered) return;
    const payload = answers as OnboardingAnswers;
    await saveOnboarding(payload);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="page">
        <h1>Onboarding complete</h1>
        <p>Your preferences were saved. You can continue to your dashboard.</p>
        <button className="primary" onClick={() => navigate('/dashboard')}>
          Go to dashboard
        </button>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="onboarding-header">
        <h1>Onboarding</h1>
        <span>
          Step {step + 1} of {questions.length}
        </span>
      </div>

      <div className="question-card">
        <h2>{current.title}</h2>
        <div className="options">
          {current.options.map((option) => (
            <label key={option.value} className="option">
              <input
                type="radio"
                name={current.id}
                value={option.value}
                checked={currentValue === option.value}
                onChange={() => updateAnswer(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <div className="onboarding-actions">
        <button className="secondary" onClick={prev} disabled={step === 0}>
          Back
        </button>
        {step < questions.length - 1 ? (
          <button className="primary" onClick={next} disabled={!isAnswered}>
            Next
          </button>
        ) : (
          <button className="primary" onClick={submit} disabled={!isAnswered}>
            Finish
          </button>
        )}
      </div>
    </section>
  );
};

export default OnboardingPage;
