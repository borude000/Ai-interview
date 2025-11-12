import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface MessageRow { sender: 'user'|'ai'; text: string; created_at: string }
interface Interview {
  id: string;
  type: string;
  role: string | null;
  techs: string | null;
  difficulty: string;
  started_at: string;
  ended_at: string | null;
  score: number | null;
  summary: string | null;
}

export default function InterviewDetailPage({ params }: any) {
  const [location] = useLocation();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        const resp = await fetch(`/api/interviews/${params.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!resp.ok) throw new Error('Failed to load interview');
        const data = await resp.json();
        setInterview(data.interview);
        setMessages(data.messages || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [params?.id]);

  if (loading) return <div>Loading...</div>;
  if (!interview) return <div>Not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Interview Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">Type: <b>{interview.type}</b> • Difficulty: <b>{interview.difficulty}</b> {interview.role ? <>• Role: <b>{interview.role}</b></> : null} {interview.techs ? <>• Techs: <b>{interview.techs}</b></> : null}</div>
          <div className="text-sm text-muted-foreground">Started: {new Date(interview.started_at).toLocaleString()} {interview.ended_at ? `• Ended: ${new Date(interview.ended_at).toLocaleString()}` : ''}</div>
          <div className="text-lg font-bold">Score: {interview.score != null ? `${interview.score}/100` : 'N/A'}</div>
          {interview.summary && <div className="text-sm whitespace-pre-wrap">{interview.summary}</div>}
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[60vh] overflow-auto p-1">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg max-w-[80%] break-words whitespace-pre-wrap ${m.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <div className="text-xs text-muted-foreground mb-1">{new Date(m.created_at).toLocaleTimeString()}</div>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
