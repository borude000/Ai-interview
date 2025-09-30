import { ThemeProvider } from "../ThemeProvider";
import { AuthForm } from "../AuthForm";

export default function AuthFormExample() {
  return (
    <ThemeProvider>
      <div className="p-8 max-w-md mx-auto">
        <AuthForm />
      </div>
    </ThemeProvider>
  );
}
