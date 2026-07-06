import React, { useEffect, useState } from 'react';
import { TutorialStep } from '../hooks/useTutorial';

interface TutorialOverlayProps {
  step: TutorialStep;
  stepIndex: number;
  totalSteps: number;
  targetRect: DOMRect | null;
  shaking: boolean;
  onNext: () => void;
  onExit: () => void;
  isComplete: boolean;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  step,
  stepIndex,
  totalSteps,
  targetRect,
  shaking,
  onNext,
  onExit,
  isComplete,
}) => {
  const [wrongHint, setWrongHint] = useState(false);

  useEffect(() => {
    if (shaking) {
      setWrongHint(true);
      const t = setTimeout(() => setWrongHint(false), 2000);
      return () => clearTimeout(t);
    }
  }, [shaking]);

  const holePad = 8;

  return (
    <>
      {/* Highlight ring around target — no backdrop, just a glow ring */}
      {targetRect && (
        <div
          style={{
            position: 'fixed',
            top: targetRect.top - holePad,
            left: targetRect.left - holePad,
            width: targetRect.width + holePad * 2,
            height: targetRect.height + holePad * 2,
            borderRadius: 12,
            border: '2px solid rgba(99,102,241,0.9)',
            boxShadow: '0 0 0 4px rgba(99,102,241,0.25), 0 0 16px 4px rgba(99,102,241,0.2)',
            zIndex: 51,
            pointerEvents: 'none',
            animation: 'tutorialPulse 1.8s ease-in-out infinite',
          }}
        />
      )}

      {/* Bottom panel — fixed, full width */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 52,
          animation: shaking ? 'tutorialShake 0.5s ease-in-out' : undefined,
        }}
        className="bg-gray-950 border-t-2 border-indigo-700 shadow-2xl px-5 pt-4 pb-6"
      >
        {/* Progress bar */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full flex-1 transition-colors ${
                i <= stepIndex ? 'bg-indigo-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="text-white font-bold text-base mb-1">{step.title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{step.body}</p>
            {wrongHint && (
              <p className="text-yellow-400 text-sm mt-2 bg-yellow-900/20 border border-yellow-800/40 rounded-lg px-3 py-1.5">
                Try the suggested action first
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {step.isInfo && (
              <button
                onClick={isComplete ? onExit : onNext}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
              >
                {isComplete ? 'Finish Tutorial' : 'Next →'}
              </button>
            )}
            <button
              onClick={onExit}
              className="px-5 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white text-sm rounded-xl transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
