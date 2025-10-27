import React, { useMemo } from 'react';

export default function SimpleLineChart({ data = [], labels = [], height = 160, color = '#cfbd97' }) {
  const { pathD, points } = useMemo(() => {
    const vals = data.length ? data : [0];
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const padY = 8;
    const h = height - padY * 2;
    const w = Math.max(200, vals.length * 40);
    const stepX = vals.length > 1 ? w / (vals.length - 1) : w;
    const norm = (v) => h - ((v - min) / ((max - min) || 1)) * h;
    const pts = vals.map((v, i) => [i * stepX, norm(v) + padY]);
    const d = pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
    return { pathD: d, points: pts };
  }, [data, height]);

  const width = Math.max(240, data.length * 40);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
        <g stroke="#eee">
          <line x1="0" y1={height - 1} x2={width} y2={height - 1} />
          <line x1="0" y1={1} x2={width} y2={1} />
        </g>
        <defs>
          <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${pathD} L ${width} ${height} L 0 ${height} Z`} fill="url(#areaGrad)" />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" />
        {points.map(([x,y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke={color} strokeWidth="2" />
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
