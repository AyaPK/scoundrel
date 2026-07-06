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

  // Hole cutout via box-shadow trick
  const holePad = 8;
  const shadowStyle: React.CSSProperties = targetRect
    ? {
        position: 'fixed',
        inset: 0,
        boxShadow: `0 0 0 9999px rgba(0,0,0,0.72)`,
        clipPath: `polygon(
          0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
          ${targetRect.left - holePad}px ${targetRect.top - holePad}px,
          ${targetRect.left - holePad}px ${targetRect.bottom + holePad}px,
          ${targetRect.right + holePad}px ${targetRect.bottom + holePad}px,
          ${targetRect.right + holePad}px ${targetRect.top - holePad}px,
          ${targetRect.left - holePad}px ${targetRect.top - holePad}px
        )`,
        zIndex: 50,
        pointerEvents: 'none',
      }
    : {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.72)',
        zIndex: 50,
        pointerEvents: 'none',
      };

  const vpH = window.innerHeight;
  const vpW = window.innerWidth;
  const tooltipW = Math.min(300, vpW - 24);
  const tooltipEstH = 210;
  const tooltipGap = 12;
  let tooltipTop: number;
  let tooltipLeft: number;

  if (!step.isInfo && targetRect) {
    // Action-gated: anchor to top-right so it never overlaps card area or action panel
    tooltipTop = 12;
    tooltipLeft = vpW - tooltipW - 12;
  } else if (targetRect) {
    // Info step: prefer above target, fall back to below
    const spaceAbove = targetRect.top;
    tooltipTop = spaceAbove >= tooltipEstH + tooltipGap
      ? targetRect.top - tooltipEstH - tooltipGap
      : targetRect.bottom + tooltipGap;
    tooltipLeft = Math.max(12, Math.min(
      targetRect.left + targetRect.width / 2 - tooltipW / 2,
      vpW - tooltipW - 12
    ));
  } else {
    tooltipTop = vpH / 2 - 90;
    tooltipLeft = vpW / 2 - tooltipW / 2;
  }

  return (
    <>
      {/* Dimmed backdrop with cutout */}
      <div style={shadowStyle} />

      {/* Highlight ring around target */}
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
            boxShadow: '0 0 0 3px rgba(99,102,241,0.3)',
            zIndex: 51,
            pointerEvents: 'none',
            animation: 'tutorialPulse 1.8s ease-in-out infinite',
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        style={{
          position: 'fixed',
          top: tooltipTop,
          left: tooltipLeft,
          width: tooltipW,
          zIndex: 52,
          animation: shaking ? 'tutorialShake 0.5s ease-in-out' : undefined,
        }}
        className="bg-gray-900 border border-indigo-700 rounded-2xl p-4 shadow-2xl"
      >
        {/* Progress dots */}
        <div className="flex gap-1 mb-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full flex-1 transition-colors ${
                i <= stepIndex ? 'bg-indigo-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        <h3 className="text-white font-bold text-sm mb-1">{step.title}</h3>
        <p className="text-gray-300 text-xs leading-relaxed mb-3">{step.body}</p>

        {wrongHint && (
          <p className="text-yellow-400 text-xs mb-2 bg-yellow-900/20 border border-yellow-800/40 rounded-lg px-2 py-1">
            Try the suggested action first
          </p>
        )}

        <div className="flex gap-2">
          {step.isInfo && (
            <button
              onClick={isComplete ? onExit : onNext}
              className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {isComplete ? 'Finish Tutorial' : 'Next →'}
            </button>
          )}
          <button
            onClick={onExit}
            className="py-1.5 px-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white text-xs rounded-lg transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </>
  );
};
