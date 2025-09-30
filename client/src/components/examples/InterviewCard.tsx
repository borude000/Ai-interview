import { ThemeProvider } from "../ThemeProvider";
import { InterviewCard } from "../InterviewCard";

export default function InterviewCardExample() {
  return (
    <ThemeProvider>
      <div className="p-8 space-y-4 max-w-2xl">
        <InterviewCard
          id="1"
          title="Full Stack Developer Assessment"
          category="Technical"
          date={new Date()}
          duration={45}
          status="completed"
          score={8.5}
          questionCount={10}
          onViewDetails={() => console.log("View details clicked")}
        />
        <InterviewCard
          id="2"
          title="Behavioral Interview"
          category="HR"
          date={new Date()}
          status="pending"
          questionCount={8}
          onStart={() => console.log("Start interview clicked")}
        />
      </div>
    </ThemeProvider>
  );
}
