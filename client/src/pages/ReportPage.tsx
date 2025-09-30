import { ReportViewer } from "@/components/ReportViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const mockReport = {
  candidateName: "Sarah Johnson",
  interviewTitle: "Full Stack Developer Assessment",
  date: new Date("2025-09-20"),
  overallScore: 8.2,
  scores: {
    accuracy: 8.5,
    fluency: 7.8,
    completeness: 8.3,
  },
  strengths: [
    "Strong technical knowledge of modern frameworks and libraries",
    "Clear and concise communication style",
    "Comprehensive answers covering all key concepts",
    "Good understanding of software architecture principles",
  ],
  weaknesses: [
    "Could provide more real-world examples from past projects",
    "Some hesitation when explaining complex algorithms",
    "Limited discussion of scalability considerations",
  ],
  recommendations: [
    "Practice explaining technical concepts using analogies and real-world scenarios",
    "Review advanced data structures and algorithm complexity",
    "Consider building more portfolio projects demonstrating scalability",
    "Prepare specific examples from past work to illustrate problem-solving skills",
  ],
  answers: [
    {
      question: "Explain the difference between REST and GraphQL APIs",
      answer: "REST uses multiple endpoints for different resources, while GraphQL uses a single endpoint with flexible queries. GraphQL allows clients to request exactly what they need, reducing over-fetching and under-fetching of data. REST is simpler and uses standard HTTP methods, while GraphQL provides more flexibility but with added complexity.",
      score: 8.5,
    },
    {
      question: "Describe your experience with state management in React",
      answer: "I have worked extensively with React's built-in useState and useContext hooks for simpler applications. For larger applications, I've used Redux and Redux Toolkit for global state management. Recently, I've also explored Zustand as a lighter alternative. The choice depends on the application complexity and team preferences.",
      score: 8.7,
    },
    {
      question: "Tell me about a challenging project you worked on",
      answer: "I worked on a real-time dashboard that required optimizing performance for handling thousands of concurrent users. We implemented WebSocket connections for live updates and used React.memo to prevent unnecessary re-renders. The main challenge was balancing real-time updates with performance, which we solved through debouncing and intelligent caching strategies.",
      score: 7.4,
    },
  ],
};

export default function ReportPage() {
  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => console.log("Navigate back")}
        data-testid="button-back"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Interviews
      </Button>

      <ReportViewer
        data={mockReport}
        onDownload={() => console.log("Download PDF clicked")}
      />
    </div>
  );
}
