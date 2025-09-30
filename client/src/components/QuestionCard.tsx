import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { useState } from "react";

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  category: string;
  question: string;
  onRecordingComplete?: (transcript: string) => void;
}

export function QuestionCard({
  questionNumber,
  totalQuestions,
  category,
  question,
  onRecordingComplete,
}: QuestionCardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");

  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      setTimeout(() => {
        const mockTranscript = "This is a sample transcribed answer from the candidate's speech. In a real implementation, this would come from the Web Speech API or Whisper/Vosk.";
        setTranscript(mockTranscript);
        setIsProcessing(false);
        onRecordingComplete?.(mockTranscript);
      }, 1500);
    } else {
      setIsRecording(true);
      setTranscript("");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Badge variant="secondary">
              Question {questionNumber} of {totalQuestions}
            </Badge>
            <Badge variant="outline">{category}</Badge>
          </div>
          <CardTitle className="text-2xl mt-4">{question}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              className={`h-20 w-20 rounded-full ${
                isRecording ? "animate-pulse" : ""
              }`}
              onClick={handleToggleRecording}
              disabled={isProcessing}
              data-testid="button-record"
            >
              {isProcessing ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : isRecording ? (
                <Square className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
            
            <p className="text-sm text-muted-foreground">
              {isProcessing
                ? "Transcribing..."
                : isRecording
                ? "Recording... Click to stop"
                : "Click to start recording your answer"}
            </p>
          </div>
          
          {transcript && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Transcript</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-sm leading-relaxed">
                  {transcript}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
