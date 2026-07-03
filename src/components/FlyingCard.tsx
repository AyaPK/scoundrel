import React from 'react';
import { Card } from '../types/game';
import { CardComponent } from './Card';

export interface FlySpec {
  card: Card;
  fromRect: DOMRect;
  toRect: DOMRect;
  rotate?: number;
}

interface FlyingCardProps {
  spec: FlySpec;
  onDone: () => void;
}

export const FlyingCard: React.FC<FlyingCardProps> = ({ spec, onDone }) => {
  const { card, fromRect, toRect, rotate = -8 } = spec;

  // The element is rendered at fixed position matching the source card exactly.
  // CSS variables drive the keyframe: from=(0,0) [already at source], to=(delta).
  const dx = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2);
  const dy = toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2);

  const style: React.CSSProperties = {
    position: 'fixed',
    top: fromRect.top,
    left: fromRect.left,
    width: fromRect.width,
    height: fromRect.height,
    pointerEvents: 'none',
    zIndex: 9999,
    '--fly-from-x': '0px',
    '--fly-from-y': '0px',
    '--fly-to-x': `${dx}px`,
    '--fly-to-y': `${dy}px`,
    '--fly-rotate': `${rotate}deg`,
  } as React.CSSProperties;

  return (
    <div
      className="card-fly"
      style={style}
      onAnimationEnd={onDone}
    >
      <CardComponent card={{ ...card, faceUp: true }} className="w-full h-full" />
    </div>
  );
};
