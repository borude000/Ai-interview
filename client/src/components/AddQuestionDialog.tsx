import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddQuestionDialogProps {
  onAddQuestion?: (question: { text: string; category: string; createdBy: "AI" | "Admin" }) => void;
}

export function AddQuestionDialog({ onAddQuestion }: AddQuestionDialogProps) {
  const [open, setOpen] = useState(false);
  const [manualQuestion, setManualQuestion] = useState("");
  const [manualCategory, setManualCategory] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiCategory, setAiCategory] = useState("");
  const [aiCount, setAiCount] = useState("5");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleManualSubmit = () => {
    if (manualQuestion && manualCategory) {
      onAddQuestion?.({
        text: manualQuestion,
        category: manualCategory,
        createdBy: "Admin",
      });
      setManualQuestion("");
      setManualCategory("");
      setOpen(false);
    }
  };

  const handleAiGenerate = () => {
    setIsGenerating(true);
    console.log("Generating AI questions:", { prompt: aiPrompt, category: aiCategory, count: aiCount });
    setTimeout(() => {
      setIsGenerating(false);
      setAiPrompt("");
      setAiCategory("");
      setAiCount("5");
      setOpen(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-question">
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Interview Question</DialogTitle>
          <DialogDescription>
            Create a new question manually or generate with AI
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Generate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="manual-category">Category</Label>
              <Select value={manualCategory} onValueChange={setManualCategory}>
                <SelectTrigger id="manual-category" data-testid="select-manual-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Aptitude">Aptitude</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-question">Question</Label>
              <Textarea
                id="manual-question"
                placeholder="Enter your interview question..."
                value={manualQuestion}
                onChange={(e) => setManualQuestion(e.target.value)}
                rows={4}
                data-testid="textarea-manual-question"
              />
            </div>

            <DialogFooter>
              <Button onClick={handleManualSubmit} data-testid="button-submit-manual">
                Add Question
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="ai-category">Category</Label>
              <Select value={aiCategory} onValueChange={setAiCategory}>
                <SelectTrigger id="ai-category" data-testid="select-ai-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Aptitude">Aptitude</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-prompt">Description (optional)</Label>
              <Textarea
                id="ai-prompt"
                placeholder="e.g., Focus on React hooks and state management..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={3}
                data-testid="textarea-ai-prompt"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-count">Number of Questions</Label>
              <Input
                id="ai-count"
                type="number"
                min="1"
                max="20"
                value={aiCount}
                onChange={(e) => setAiCount(e.target.value)}
                data-testid="input-ai-count"
              />
            </div>

            <DialogFooter>
              <Button
                onClick={handleAiGenerate}
                disabled={isGenerating || !aiCategory}
                data-testid="button-generate-ai"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Questions
                  </>
                )}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
