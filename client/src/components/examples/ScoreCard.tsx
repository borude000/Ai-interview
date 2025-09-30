import { ThemeProvider } from "../ThemeProvider";
import { ScoreCard } from "../ScoreCard";

export default function ScoreCardExample() {
  return (
    <ThemeProvider>
      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
        <ScoreCard
          title="Accuracy"
          score={8.5}
          description="Answer correctness and relevance"
        />
        <ScoreCard
          title="Fluency"
          score={7.2}
          description="Speech clarity and coherence"
        />
        <ScoreCard
          title="Completeness"
          score={9.1}
          description="Coverage of all key points"
        />
      </div>
    </ThemeProvider>
  );
}
