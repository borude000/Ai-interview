import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  description?: string;
}

export function ScoreCard({ title, score, maxScore = 10, description }: ScoreCardProps) {
  const percentage = (score / maxScore) * 100;
  
  const getScoreColor = () => {
    if (percentage >= 70) return "text-chart-2";
    if (percentage >= 50) return "text-chart-3";
    return "text-chart-5";
  };

  return (
    <Card data-testid={`card-score-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={`text-3xl font-bold ${getScoreColor()}`}>
          {score.toFixed(1)}<span className="text-lg text-muted-foreground">/{maxScore}</span>
        </div>
        <Progress value={percentage} className="h-2" />
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
