import { ThemeProvider } from "../ThemeProvider";
import { QuestionManagementTable } from "../QuestionManagementTable";

const mockQuestions = [
  {
    id: "1",
    text: "Explain the concept of closures in JavaScript",
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
    text: "What is your approach to learning new technologies?",
    category: "HR",
    createdBy: "AI" as const,
  },
  {
    id: "4",
    text: "Solve: If a train travels 120 km in 2 hours, what is its average speed?",
    category: "Aptitude",
    createdBy: "Admin" as const,
  },
];

export default function QuestionManagementTableExample() {
  return (
    <ThemeProvider>
      <div className="p-8 max-w-6xl">
        <QuestionManagementTable
          questions={mockQuestions}
          onEdit={(id) => console.log("Edit question:", id)}
          onDelete={(id) => console.log("Delete question:", id)}
        />
      </div>
    </ThemeProvider>
  );
}
