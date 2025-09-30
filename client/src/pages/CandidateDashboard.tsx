import { useState } from "react";
import { InterviewCard } from "@/components/InterviewCard";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Star, TrendingUp, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CandidateDashboard() {
  const [interviews] = useState([
    {
      id: "1",
      title: "Full Stack Developer Assessment",
      category: "Technical",
      date: new Date("2025-09-20"),
      duration: 45,
      status: "completed" as const,
      score: 8.5,
      questionCount: 10,
    },
    {
      id: "2",
      title: "Behavioral Interview",
      category: "HR",
      date: new Date("2025-09-15"),
      duration: 30,
      status: "completed" as const,
      score: 7.8,
      questionCount: 8,
    },
    {
      id: "3",
      title: "Technical Problem Solving",
      category: "Aptitude",
      date: new Date(),
      status: "pending" as const,
      questionCount: 12,
    },
  ]);

  const completedInterviews = interviews.filter((i) => i.status === "completed");
  const avgScore = completedInterviews.reduce((sum, i) => sum + (i.score || 0), 0) / completedInterviews.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">My Interviews</h1>
        <p className="text-muted-foreground mt-1">
          Track your progress and view your interview results
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Interviews"
          value={interviews.length}
          description="All time"
          icon={ClipboardCheck}
        />
        <StatCard
          title="Completed"
          value={completedInterviews.length}
          description="Finished interviews"
          icon={TrendingUp}
        />
        <StatCard
          title="Average Score"
          value={avgScore.toFixed(1)}
          description="Out of 10"
          icon={Star}
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">All Interviews</TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">Completed</TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {interviews.map((interview) => (
            <InterviewCard
              key={interview.id}
              {...interview}
              onViewDetails={() => console.log("View details:", interview.id)}
              onStart={() => console.log("Start interview:", interview.id)}
            />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedInterviews.map((interview) => (
            <InterviewCard
              key={interview.id}
              {...interview}
              onViewDetails={() => console.log("View details:", interview.id)}
            />
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {interviews.filter((i) => i.status === "pending").map((interview) => (
            <InterviewCard
              key={interview.id}
              {...interview}
              onStart={() => console.log("Start interview:", interview.id)}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
