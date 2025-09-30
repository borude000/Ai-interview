import { ThemeProvider } from "../ThemeProvider";
import { AddQuestionDialog } from "../AddQuestionDialog";

export default function AddQuestionDialogExample() {
  return (
    <ThemeProvider>
      <div className="p-8">
        <AddQuestionDialog
          onAddQuestion={(question) => console.log("New question:", question)}
        />
      </div>
    </ThemeProvider>
  );
}
