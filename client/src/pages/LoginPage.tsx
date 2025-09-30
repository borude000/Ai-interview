import { AuthForm } from "@/components/AuthForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import heroImage from "@assets/generated_images/AI_interview_hero_illustration_f8305ab0.png";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-chart-4/10 p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src={heroImage}
            alt="AI Interview System"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-md text-center space-y-6">
          <h1 className="text-4xl font-bold">AI Interview System</h1>
          <p className="text-lg text-muted-foreground">
            Transform your hiring process with AI-powered interview assessment, 
            speech-to-text transcription, and comprehensive evaluation reports.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden space-y-2">
            <h1 className="text-3xl font-bold">AI Interview System</h1>
            <p className="text-muted-foreground">Welcome back</p>
          </div>
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
