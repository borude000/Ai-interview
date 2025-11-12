import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, LogOut, User } from "lucide-react";
// Toast functionality will be added later

interface UserData {
  id: string;
  username: string;
  created_at: string; // server returns snake_case
}

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

const DashboardPage = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useLocation();
  const [stats, setStats] = useState<{ completed: number; avgScore: number | null; timeMin: number } | null>(null);
  
  // Simple toast function for now
  const toast = (options: { title: string; description: string; variant?: string }) => {
    console.log(`${options.title}: ${options.description}`);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setLocation("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data. Please log in again.",
          variant: "destructive",
        });
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    // Fetch stats
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const resp = await fetch('/api/interviews', { headers: { Authorization: `Bearer ${token}` } });
        if (!resp.ok) throw new Error('Failed to load interviews');
        const data: InterviewRow[] = await resp.json();
        const completed = data.filter(d => !!d.ended_at).length;
        const scored = data.filter(d => typeof d.score === 'number') as Array<Required<Pick<InterviewRow,'score'>>> & InterviewRow[];
        const avgScore = scored.length ? Math.round((scored.reduce((s, r) => s + (r.score as number), 0) / scored.length)) : null;
        const timeMin = data.reduce((sum, d) => {
          if (!d.ended_at) return sum;
          const start = new Date(d.started_at).getTime();
          const end = new Date(d.ended_at).getTime();
          if (isFinite(start) && isFinite(end) && end > start) return sum + Math.round((end - start) / 60000);
          return sum;
        }, 0);
        setStats({ completed, avgScore, timeMin });
      } catch (e) {
        console.error('Stats load failed', e);
        setStats({ completed: 0, avgScore: null, timeMin: 0 });
      }
    })();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLocation("/login");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // or redirect to login
  }

  const userInitial = user.username.charAt(0).toUpperCase();
  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-300">Dashboard</h1>
            <p className="text-muted-foreground animate-in fade-in duration-300 delay-100">
              Welcome back, {user.username}!
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2 self-start md:self-center transition-transform hover:-translate-y-[1px]"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-1 rounded-2xl border border-border/60 shadow-lg">
            <CardHeader>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} />
                  <AvatarFallback className="text-2xl">{userInitial}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-semibold">{user.username}</h3>
                  <p className="text-sm text-muted-foreground">Member</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Username:</span>
                <span className="font-medium">{user.username}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Member since:</span>
                <span className="font-medium">{joinDate}</span>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card className="rounded-2xl border border-border/60 shadow-lg">
              <CardHeader>
                <CardTitle>Welcome to AI Interview System</CardTitle>
                <CardDescription>
                  Get started with your interview preparation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <h3 className="font-medium mb-2">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button variant="outline" className="justify-start transition-transform hover:-translate-y-[1px]" onClick={() => setLocation('/interview/new')}>
                        Start New Interview
                      </Button>
                      <Button variant="outline" className="justify-start transition-transform hover:-translate-y-[1px]" onClick={() => setLocation('/interviews')}>
                        View Past Interviews
                      </Button>
                      <Button variant="outline" className="justify-start transition-transform hover:-translate-y-[1px]" onClick={() => setLocation('/practice')}>
                        Practice Questions
                      </Button>
                      <Button variant="outline" className="justify-start transition-transform hover:-translate-y-[1px]" onClick={() => setLocation('/progress')}>
                        View Progress
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="rounded-2xl border border-border/60 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Account created</p>
                        <p className="text-xs text-muted-foreground">{joinDate}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Profile updated</p>
                        <p className="text-xs text-muted-foreground">Just now</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-border/60 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Interviews Completed</span>
                      <Badge variant="outline">{stats?.completed ?? 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Average Score</span>
                      <Badge variant="outline">{stats?.avgScore != null ? `${stats.avgScore}` : 'N/A'}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Time Spent</span>
                      <Badge variant="outline">{stats?.timeMin ?? 0} min</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
