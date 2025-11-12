import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface InterviewRow {
  id: string;
  type: 'hr' | 'technical' | string;
  role: string | null;
  techs: string | null;
  difficulty: string;
  started_at: string;
  ended_at: string | null;
  score: number | null;
}

export default function InterviewsListPage() {
  const [items, setItems] = useState<InterviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const fetchList = async () => {
      try {
        const token = localStorage.getItem('token');
        const resp = await fetch('/api/interviews', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!resp.ok) throw new Error('Failed to load interviews');
        const data = await resp.json();
        setItems(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Past Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground">No interviews yet.</div>
          ) : (
            <div className="space-y-3">
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {it.type.toUpperCase()} • {it.difficulty.toUpperCase()} {it.role ? `• ${it.role}` : ''} {it.techs ? `• ${it.techs}` : ''}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Started: {new Date(it.started_at).toLocaleString()} {it.ended_at ? `• Ended: ${new Date(it.ended_at).toLocaleString()}` : ''}
                    </div>
                    <div className="text-xs">
                      Score: {it.score != null ? `${it.score}/100` : 'N/A'}
                    </div>
                  </div>
                  <Button onClick={() => setLocation(`/interviews/${it.id}`)}>View</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
