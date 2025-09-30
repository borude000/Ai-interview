import { ThemeProvider } from "../ThemeProvider";
import { ReportViewer } from "../ReportViewer";

const mockReport = {
  candidateName: "Sarah Johnson",
  interviewTitle: "Full Stack Developer Position",
  date: new Date(),
  overallScore: 8.2,
  scores: {
    accuracy: 8.5,
    fluency: 7.8,
    completeness: 8.3,
  },
  strengths: [
    "Strong technical knowledge of modern frameworks",
    "Clear and concise communication",
    "Comprehensive answers covering key concepts",
  ],
  weaknesses: [
    "Could provide more real-world examples",
    "Some hesitation in explaining complex algorithms",
  ],
  recommendations: [
    "Practice explaining technical concepts with analogies",
    "Review advanced data structures",
    "Consider building more portfolio projects",
  ],
  answers: [
    {
      question: "Explain the difference between REST and GraphQL APIs",
      answer: "REST uses multiple endpoints for different resources, while GraphQL uses a single endpoint with flexible queries. GraphQL allows clients to request exactly what they need, reducing over-fetching and under-fetching of data.",
      score: 8.5,
    },
    {
      question: "Describe your experience with CI/CD pipelines",
      answer: "I have worked with Jenkins and GitHub Actions to automate testing and deployment. We set up automated tests that run on every commit, and successful builds are automatically deployed to staging environments.",
      score: 7.9,
    },
  ],
};

export default function ReportViewerExample() {
  return (
    <ThemeProvider>
      <div className="p-8 max-w-6xl mx-auto">
        <ReportViewer
          data={mockReport}
          onDownload={() => console.log("Download PDF clicked")}
        />
      </div>
    </ThemeProvider>
  );
}
