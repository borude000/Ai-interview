import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

type InterviewStatus = "completed" | "in-progress" | "pending";

interface InterviewCardProps {
  id: string;
  title: string;
  category: string;
  date: Date;
  duration?: number;
  status: InterviewStatus;
  score?: number;
  questionCount: number;
  onViewDetails?: () => void;
  onStart?: () => void;
}

export function InterviewCard({
  id,
  title,
  category,
  date,
  duration,
  status,
  score,
  questionCount,
  onViewDetails,
  onStart,
}: InterviewCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return <Badge className="bg-chart-2 text-white">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-chart-3 text-white">In Progress</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getCategoryColor = () => {
    switch (category.toLowerCase()) {
      case "technical":
        return "border-l-chart-1";
      case "hr":
        return "border-l-chart-4";
      case "aptitude":
        return "border-l-chart-3";
      default:
        return "border-l-primary";
    }
  };

  return (
    <Card className={`border-l-4 ${getCategoryColor()} hover-elevate`} data-testid={`card-interview-${id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Badge variant="outline">{category}</Badge>
              <span className="text-xs">•</span>
              <span className="text-xs">{questionCount} questions</span>
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(date, "MMM d, yyyy")}</span>
        </div>
        
        {duration && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{duration} minutes</span>
          </div>
        )}
        
        {score !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            {score >= 7 ? (
              <CheckCircle className="h-4 w-4 text-chart-2" />
            ) : (
              <XCircle className="h-4 w-4 text-chart-5" />
            )}
            <span className="font-medium">Score: {score.toFixed(1)}/10</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="gap-2 flex-wrap">
        {status === "completed" && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            data-testid={`button-view-details-${id}`}
          >
            View Report
          </Button>
        )}
        {status === "pending" && (
          <Button
            size="sm"
            onClick={onStart}
            data-testid={`button-start-${id}`}
          >
            Start Interview
          </Button>
        )}
        {status === "in-progress" && (
          <Button
            size="sm"
            onClick={onStart}
            data-testid={`button-continue-${id}`}
          >
            Continue Interview
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
