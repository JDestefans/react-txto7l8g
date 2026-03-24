import React from 'react';
import { B, GOLD } from '../constants';

/* Minimal square mark - placeholder until final logo is locked */
export const BrainIcon = ({ size = 28, color = B.teal, strokeWidth = 1.2 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect
      x="1.5"
      y="1.5"
      width="29"
      height="29"
      rx="6"
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
    />
    <text
      x="16"
      y="23"
      textAnchor="middle"
      fill={color}
      fontSize="17"
      fontWeight="800"
      fontFamily="'Syne','DM Sans',sans-serif"
    >
      P
    </text>
  </svg>
);

export const Wordmark = ({ dark = false, size = 'md' }) => {
  const sizes = {
    sm: { main: 16, sub: 7 },
    md: { main: 20, sub: 8 },
    lg: { main: 30, sub: 10 },
  };
  const s = sizes[size] || sizes.md;
  const base = dark ? '#f0f4fa' : B.text;
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1 }}>
      <span
        style={{
          fontSize: s.main,
          fontWeight: 800,
          letterSpacing: '-0.5px',
          color: base,
          lineHeight: 1,
          fontFamily: "'Syne','DM Sans',sans-serif",
        }}
      >
        planrr
      </span>
      <span
        style={{
          fontSize: s.main,
          fontWeight: 800,
          letterSpacing: '-0.5px',
          color: GOLD,
          lineHeight: 1,
          fontFamily: "'Syne','DM Sans',sans-serif",
        }}
      >
        .app
      </span>
    </div>
  );
};
