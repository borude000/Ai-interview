import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QRow { id: string; question: string; difficulty: string; role: string | null; techs: string | null }

export default function PracticeQuestionsPage() {
  const [type, setType] = useState<'hr'|'technical'>('hr');
  const [difficulty, setDifficulty] = useState<'beginner'|'intermediate'|'advanced'|'all'>('all');
  const [role, setRole] = useState('');
  const [techs, setTechs] = useState('');
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [items, setItems] = useState<QRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('type', type);
      if (difficulty !== 'all') params.set('difficulty', difficulty);
      if (role.trim()) params.set('role', role.trim());
      const techParam = selectedTechs.length ? selectedTechs.join(',') : techs.trim();
      if (techParam) params.set('techs', techParam);
      const resp = await fetch(`/api/practice/questions?${params.toString()}`);
      if (!resp.ok) throw new Error('Failed to load questions');
      const data = await resp.json();
      setItems(data);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, difficulty]);

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Practice Interview Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <select value={type} onChange={(e) => setType(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
              <option value="hr">HR</option>
              <option value="technical">Technical</option>
            </select>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
              <option value="all">All difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role (e.g., frontend)" className="border rounded px-2 py-1 text-sm" />
            <input value={techs} onChange={(e) => setTechs(e.target.value)} placeholder="Techs (comma-separated)" className="border rounded px-2 py-1 text-sm" />
            <Button onClick={fetchQuestions} variant="outline">Load</Button>
          </div>

          {/* Common languages/techs selector */}
          <div className="mb-4">
            <div className="text-xs text-muted-foreground mb-1">Select languages/techs (overrides text field)</div>
            <div className="flex flex-wrap gap-2">
              {['react','node','javascript','typescript','python','java','csharp','go','sql','angular','vue'].map(t => (
                <label key={t} className={`cursor-pointer px-2 py-1 rounded border text-xs ${selectedTechs.includes(t) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background'}`}>
                  <input
                    type="checkbox"
                    checked={selectedTechs.includes(t)}
                    onChange={(e) => {
                      setSelectedTechs(prev => e.target.checked ? [...prev, t] : prev.filter(x => x !== t));
                    }}
                    className="mr-1 hidden"
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-muted-foreground">No questions found for the selected filters.</div>
          ) : (
            <div className="space-y-3">
              {items.map((q) => (
                <div key={q.id} className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">{q.difficulty.toUpperCase()} {q.role ? `• ${q.role}` : ''} {q.techs ? `• ${q.techs}` : ''}</div>
                  <div className="whitespace-pre-wrap">{q.question}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
