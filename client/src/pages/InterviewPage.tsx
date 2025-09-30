import { useState } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, ChevronRight, CheckCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const mockQuestions = [
  {
    category: "Technical",
    question: "Explain the difference between REST and GraphQL APIs. When would you choose one over the other?",
  },
  {
    category: "Technical",
    question: "Describe your experience with state management in React. What solutions have you used?",
  },
  {
    category: "HR",
    question: "Tell me about a challenging project you worked on and how you overcame obstacles.",
  },
];

export default function InterviewPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showComplete, setShowComplete] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const handleRecordingComplete = (transcript: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = transcript;
    setAnswers(newAnswers);
    console.log("Answer recorded for question", currentQuestion + 1);
  };

  const handleNext = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowComplete(true);
    }
  };

  const handleComplete = () => {
    console.log("Interview completed with answers:", answers);
    setShowComplete(false);
  };

  const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle>Full Stack Developer Assessment</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{currentQuestion + 1} of {mockQuestions.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <QuestionCard
        questionNumber={currentQuestion + 1}
        totalQuestions={mockQuestions.length}
        category={mockQuestions[currentQuestion].category}
        question={mockQuestions[currentQuestion].question}
        onRecordingComplete={handleRecordingComplete}
      />

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleNext}
          disabled={!answers[currentQuestion]}
          data-testid="button-next-question"
        >
          {currentQuestion < mockQuestions.length - 1 ? (
            <>
              Next Question
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          ) : (
            <>
              Complete Interview
              <CheckCircle className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      <AlertDialog open={showComplete} onOpenChange={setShowComplete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Interview?</AlertDialogTitle>
            <AlertDialogDescription>
              You've answered all questions. Your responses will be evaluated by AI 
              and you'll receive a detailed report shortly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-complete">Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete} data-testid="button-confirm-complete">
              Submit Interview
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
