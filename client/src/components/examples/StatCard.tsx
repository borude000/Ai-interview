import { ThemeProvider } from "../ThemeProvider";
import { StatCard } from "../StatCard";
import { Users, ClipboardCheck, TrendingUp, Star } from "lucide-react";

export default function StatCardExample() {
  return (
    <ThemeProvider>
      <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl">
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
    </ThemeProvider>
  );
}
