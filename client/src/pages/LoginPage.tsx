import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [_, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");

      if (data.token) localStorage.setItem("token", data.token);

      if (!isLogin) {
        setSuccessMessage("Account created successfully! Please log in.");
        setIsLogin(true);
        setUsername("");
        setPassword("");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-10">
      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left: Headline */}
        <div className="order-2 lg:order-1 text-center lg:text-left space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-300">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-muted-foreground max-w-prose mx-auto lg:mx-0 animate-in fade-in duration-300 delay-100">
            {isLogin
              ? "Sign in to continue to your AI Interview dashboard."
              : "Access guided practice, AI feedback, and progress tracking."}
          </p>
        </div>

        {/* Right: Auth Card */}
        <div className="order-1 lg:order-2 w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Card className="rounded-2xl border border-border/60 shadow-lg hover:shadow-xl transition-shadow backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold">
                  {isLogin ? "Sign In" : "Create account"}
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {isLogin ? "New here?" : "Already a member?"}
                  <button
                    className="ml-1 text-primary hover:underline underline-offset-2"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    type="button"
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </div>
              </div>
              <CardDescription className="text-muted-foreground">
                {isLogin ? "Enter your credentials to access your dashboard" : "It only takes a minute."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {error && (
                <Alert variant="destructive" className="border-destructive/40">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Authentication error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {successMessage && (
                <Alert>
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 focus-visible:ring-2 focus-visible:ring-primary/40 transition-shadow"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {isLogin && (
                      <a className="text-sm text-primary hover:underline underline-offset-2" href="#">
                        Forgot password?
                      </a>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder={isLogin ? "Your password" : "At least 6 characters"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 focus-visible:ring-2 focus-visible:ring-primary/40 transition-shadow"
                  />
                </div>

                <Button type="submit" className="w-full h-11 transition-transform hover:-translate-y-[1px]" disabled={isLoading}>
                  {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {isLogin ? "New to our platform?" : "Already have an account?"}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full transition-transform hover:-translate-y-[1px]"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccessMessage(null);
                }}
                disabled={isLoading}
                type="button"
              >
                {isLogin ? "Create an account" : "Sign in instead"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}