import React from 'react';

export default function SimplePieChart({ size = 220, innerRadius = 0, values = [], labels = [], colors = [] }) {
  const total = values.reduce((s, v) => s + (Number(v) || 0), 0) || 1;
  const radius = size / 2;
  const center = size / 2;
  let angle = -Math.PI / 2;

  const segments = values.map((v, i) => {
    const slice = (v / total) * Math.PI * 2;
    const x1 = center + Math.cos(angle) * radius;
    const y1 = center + Math.sin(angle) * radius;
    const x2 = center + Math.cos(angle + slice) * radius;
    const y2 = center + Math.sin(angle + slice) * radius;
    const largeArc = slice > Math.PI ? 1 : 0;
    const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    angle += slice;
    return { path, color: colors[i] || '#ccc' };
  });

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} />
        ))}
        {innerRadius > 0 && (
          <circle cx={center} cy={center} r={innerRadius} fill="#fff" />
        )}
      </svg>
      {labels?.length ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6, marginTop: 8, fontSize: 12, color: '#6b7280' }}>
          {labels.map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: colors[i] || '#ccc', display: 'inline-block' }} />
              {l} — {values[i]}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
