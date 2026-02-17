'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { CATEGORY_LABELS, type IssueCategory } from '@/types';

function getScoreColor(score: number): string {
  if (score >= 90) return '#5B3FD6';
  if (score >= 75) return '#79AAE4';
  if (score >= 50) return '#E78059';
  if (score >= 25) return '#f97316';
  return '#ef4444';
}

interface Props {
  scores: Record<string, number>;
  type?: 'bar' | 'radar';
}

export function CategoryChart({ scores, type = 'bar' }: Props) {
  const data = Object.entries(scores).map(([key, value]) => ({
    name: CATEGORY_LABELS[key as IssueCategory] || key,
    fullName: CATEGORY_LABELS[key as IssueCategory] || key,
    score: Math.round(value),
    color: getScoreColor(value),
  }));

  if (type === 'radar') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
          <Radar dataKey="score" stroke="#5B3FD6" fill="#5B3FD6" fillOpacity={0.2} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          formatter={(value: number) => [`${value}/100`, 'Score']}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={20}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
