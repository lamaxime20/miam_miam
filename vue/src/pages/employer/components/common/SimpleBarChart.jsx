import React, { useMemo } from 'react';

export default function SimpleBarChart({ data = [], labels = [], height = 160, color = '#cfbd97' }) {
  const width = Math.max(240, data.length * 40);
  const max = Math.max(1, ...data);
  const pad = 12;
  const barW = (width - pad * 2) / (data.length * 1.6);

  const bars = useMemo(() => {
    return data.map((v, i) => {
      const x = pad + i * (barW * 1.6);
      const h = Math.max(1, (v / max) * (height - pad * 2));
      const y = height - pad - h;
      return { x, y, w: barW, h };
    });
  }, [data, height, width]);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
        <g stroke="#eee">
          <line x1="0" y1={height - 1} x2={width} y2={height - 1} />
          <line x1="0" y1={1} x2={width} y2={1} />
        </g>
        {bars.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill={color} rx="4" />
        ))}
      </svg>
      {labels?.length ? (
        <div style={{ display:'grid', gridTemplateColumns:`repeat(${labels.length}, minmax(0,1fr))`, gap:8, marginTop:8, fontSize:12, color:'#6b7280' }}>
          {labels.map((l, i) => <div key={i} style={{ textAlign:'center' }}>{l}</div>)}
        </div>
      ) : null}
    </div>
  );
}
