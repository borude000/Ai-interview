import { ThemeProvider } from "../ThemeProvider";
import { QuestionCard } from "../QuestionCard";

export default function QuestionCardExample() {
  return (
    <ThemeProvider>
      <div className="p-8 max-w-3xl mx-auto">
        <QuestionCard
          questionNumber={3}
          totalQuestions={10}
          category="Technical"
          question="Explain the difference between REST and GraphQL APIs. When would you choose one over the other?"
          onRecordingComplete={(transcript) => console.log("Transcript:", transcript)}
        />
      </div>
    </ThemeProvider>
  );
}
