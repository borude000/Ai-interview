import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

interface InterviewRow {
  id: string;
  type: string;
  role: string | null;
  techs: string | null;
  difficulty: string;
  started_at: string;
  ended_at: string | null;
  score: number | null;
}

export default function ProgressPage() {
  const [items, setItems] = useState<InterviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const resp = await fetch('/api/interviews', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const data: InterviewRow[] = await resp.json();
        setItems(data);
      } catch (e) {
        console.error('Failed to load interviews', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const { avg, series } = useMemo(() => {
    const completed = items.filter(i => i.score != null && i.ended_at != null).slice().sort((a,b) => new Date(a.ended_at as string).getTime() - new Date(b.ended_at as string).getTime());
    const scores = completed.map(i => i.score as number);
    const avg = scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
    const series = completed.map((i, idx) => ({
      x: idx + 1,
      y: i.score as number,
      label: new Date(i.ended_at as string).toLocaleDateString(),
      id: i.id,
    }));
    return { avg, series };
  }, [items]);

  // Circular gauge for average score (0-100)
  const CircularGauge = ({ value }: { value: number }) => {
    const size = 160;
    const stroke = 16;
    const r = (size - stroke) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * r;
    const clamped = Math.max(0, Math.min(100, value));
    const offset = circumference * (1 - clamped / 100);
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        <circle cx={cx} cy={cy} r={r} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="#22c55e"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={28} fontWeight={700} fill="#111827">
          {clamped}
        </text>
        <text x={cx} y={cy + 22} textAnchor="middle" dominantBaseline="hanging" fontSize={12} fill="#6b7280">
          /100
        </text>
      </svg>
    );
  };

  // Simple responsive SVG line chart
  const Chart = () => {
    if (!series.length) return <div className="text-sm text-muted-foreground">No completed interviews yet.</div>;
    const width = 640, height = 240, pad = 32;
    const xs = series.map(s => s.x);
    const ys = series.map(s => s.y);
    const xMin = Math.min(...xs), xMax = Math.max(...xs);
    const yMin = Math.min(0, Math.min(...ys)), yMax = Math.max(100, Math.max(...ys));
    const xScale = (x: number) => pad + ((x - xMin) / Math.max(1, (xMax - xMin))) * (width - 2*pad);
    const yScale = (y: number) => height - pad - ((y - yMin) / Math.max(1, (yMax - yMin))) * (height - 2*pad);
    const path = series.map((s,i) => `${i===0?'M':'L'}${xScale(s.x)},${yScale(s.y)}`).join(' ');
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 border rounded">
        {/* axes */}
        <line x1={pad} y1={height-pad} x2={width-pad} y2={height-pad} stroke="#ccc" />
        <line x1={pad} y1={pad} x2={pad} y2={height-pad} stroke="#ccc" />
        {/* avg line */}
        <line x1={pad} y1={yScale(avg)} x2={width-pad} y2={yScale(avg)} stroke="#888" strokeDasharray="4 4" />
        {/* path */}
        <path d={path} fill="none" stroke="#3b82f6" strokeWidth={2} />
        {/* points */}
        {series.map((s,i) => (
          <g key={s.id}>
            <circle cx={xScale(s.x)} cy={yScale(s.y)} r={4} fill="#3b82f6" />
          </g>
        ))}
        {/* y labels */}
        {[0,25,50,75,100].map(v => (
          <g key={v}>
            <text x={4} y={yScale(v)} fontSize={10} fill="#666">{v}</text>
            <line x1={pad-4} y1={yScale(v)} x2={pad} y2={yScale(v)} stroke="#ccc" />
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Progress</CardTitle>
          <CardDescription>Your interview performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-6 items-center">
                <div>
                  <CircularGauge value={avg} />
                </div>
                <div className="min-w-[260px] flex-1">
                  <div className="text-lg mb-2">Average Score: <b>{avg}</b>/100</div>
                  <Chart />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
