import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { ScoreCard } from "./ScoreCard";

interface ReportData {
  candidateName: string;
  interviewTitle: string;
  date: Date;
  overallScore: number;
  scores: {
    accuracy: number;
    fluency: number;
    completeness: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  answers: {
    question: string;
    answer: string;
    score: number;
  }[];
}

interface ReportViewerProps {
  data: ReportData;
  onDownload?: () => void;
}

export function ReportViewer({ data, onDownload }: ReportViewerProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-2xl">Interview Report</CardTitle>
              <CardDescription className="mt-2">
                {data.candidateName} • {data.interviewTitle}
              </CardDescription>
              <p className="text-sm text-muted-foreground mt-1">
                {data.date.toLocaleDateString()}
              </p>
            </div>
            <Button onClick={onDownload} data-testid="button-download-report">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {data.overallScore.toFixed(1)}
              <span className="text-xl text-muted-foreground">/10</span>
            </div>
          </CardContent>
        </Card>
        
        <ScoreCard
          title="Accuracy"
          score={data.scores.accuracy}
          description="Answer correctness"
        />
        <ScoreCard
          title="Fluency"
          score={data.scores.fluency}
          description="Speech clarity"
        />
        <ScoreCard
          title="Completeness"
          score={data.scores.completeness}
          description="Coverage depth"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-chart-2" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.strengths.map((strength, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-chart-2 mt-0.5">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <XCircle className="h-5 w-5 text-chart-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.weaknesses.map((weakness, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-chart-5 mt-0.5">•</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-chart-3" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.recommendations.map((rec, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-chart-3 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Answers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.answers.map((answer, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium">Q{i + 1}: {answer.question}</p>
                <Badge variant={answer.score >= 7 ? "default" : "secondary"}>
                  {answer.score.toFixed(1)}/10
                </Badge>
              </div>
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <p className="font-mono text-sm leading-relaxed">{answer.answer}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
