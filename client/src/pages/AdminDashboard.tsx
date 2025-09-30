import { useState } from "react";
import { StatCard } from "@/components/StatCard";
import { QuestionManagementTable } from "@/components/QuestionManagementTable";
import { AddQuestionDialog } from "@/components/AddQuestionDialog";
import { Users, ClipboardCheck, Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const [questions] = useState([
    {
      id: "1",
      text: "Explain the concept of closures in JavaScript and provide a practical example",
      category: "Technical",
      createdBy: "AI" as const,
    },
    {
      id: "2",
      text: "Describe a challenging project you worked on and how you overcame obstacles",
      category: "HR",
      createdBy: "Admin" as const,
    },
    {
      id: "3",
      text: "What is your approach to learning new technologies and staying current in your field?",
      category: "HR",
      createdBy: "AI" as const,
    },
    {
      id: "4",
      text: "If a train travels 120 km in 2 hours, what is its average speed in km/h?",
      category: "Aptitude",
      createdBy: "Admin" as const,
    },
    {
      id: "5",
      text: "Explain the difference between authentication and authorization in web applications",
      category: "Technical",
      createdBy: "AI" as const,
    },
  ]);

  const recentInterviews = [
    {
      id: "1",
      candidate: "Sarah Johnson",
      position: "Full Stack Developer",
      date: new Date("2025-09-30"),
      score: 8.5,
      status: "completed",
    },
    {
      id: "2",
      candidate: "Michael Chen",
      position: "Backend Engineer",
      date: new Date("2025-09-29"),
      score: 7.8,
      status: "completed",
    },
    {
      id: "3",
      candidate: "Emily Rodriguez",
      position: "Frontend Developer",
      date: new Date("2025-09-29"),
      score: 8.9,
      status: "completed",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage questions, view reports, and track interview analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Interviews"
          value={234}
          description="This month"
          icon={ClipboardCheck}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Candidates"
          value={89}
          description="Currently registered"
          icon={Users}
        />
        <StatCard
          title="Average Score"
          value="7.8"
          description="Out of 10"
          icon={Star}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Completion Rate"
          value="94%"
          description="Finished interviews"
          icon={TrendingUp}
        />
      </div>

      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions" data-testid="tab-questions">Questions</TabsTrigger>
          <TabsTrigger value="interviews" data-testid="tab-interviews">Recent Interviews</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Question Bank</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage interview questions and generate new ones with AI
              </p>
            </div>
            <AddQuestionDialog
              onAddQuestion={(q) => console.log("New question:", q)}
            />
          </div>
          <QuestionManagementTable
            questions={questions}
            onEdit={(id) => console.log("Edit question:", id)}
            onDelete={(id) => console.log("Delete question:", id)}
          />
        </TabsContent>

        <TabsContent value="interviews" className="space-y-4 mt-6">
          <div>
            <h2 className="text-xl font-semibold">Recent Interviews</h2>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage candidate interview results
            </p>
          </div>
          
          <div className="space-y-3">
            {recentInterviews.map((interview) => (
              <Card key={interview.id} className="hover-elevate" data-testid={`card-interview-${interview.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">{interview.candidate}</CardTitle>
                      <CardDescription>{interview.position}</CardDescription>
                    </div>
                    <Badge className="bg-chart-2 text-white">
                      {interview.score.toFixed(1)}/10
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {interview.date.toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
