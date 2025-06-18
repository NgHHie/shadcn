import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff, Loader2, School } from "lucide-react";
import { useApi } from "@/lib/api";
import QLDTLoginModal from "@/components/auth/QLDTLoginModal";
import GoogleSignIn from "@/components/auth/GoogleSignIn";
import type { QLDTCredentials, LoginRequest } from "@/types/auth";
import { handleLoginError } from "@/lib/error-handler";
import ptitLogo from "@/assets/ptit.png";

interface LoginFormProps extends React.ComponentProps<"div"> {
  onLoginSuccess?: () => void;
}

export function LoginForm({
  className,
  onLoginSuccess,
  ...props
}: LoginFormProps) {
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);

  // Login credentials
  const [credentials, setCredentials] = useState<LoginRequest>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showQLDTModal, setShowQLDTModal] = useState(false);

  // Username/password login
  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!credentials.username || !credentials.password) {
      setError("Please enter both username and password");
      return;
    }

    setError(null);

    try {
      setIsLoading(true);
      await api.auth.login(credentials);

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          window.location.href = "/";
        }
      }, 1000);
    } catch (error) {
      console.error("❌ Login failed:", error);
      setError(handleLoginError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    setError(null);

    try {
      setIsLoading(true);
      await api.auth.loginWithGoogle(idToken);

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          window.location.href = "/";
        }
      }, 1000);
    } catch (error) {
      console.error("❌ Google login failed:", error);
      setError(handleLoginError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error: Error) => {
    setError(error.message);
  };

  const handleQLDTLogin = async (credentials: QLDTCredentials) => {
    try {
      setIsLoading(true);
      await api.auth.loginWithQLDT(credentials);

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          window.location.href = "/";
        }
      }, 1000);
    } catch (error) {
      console.error("❌ QLDT login failed:", error);
      setError(handleLoginError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form className="p-6 md:p-8" onSubmit={handleUsernameLogin}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-balance text-muted-foreground">
                    Login to your Acme Inc account
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={credentials.username}
                    onChange={(e) =>
                      setCredentials((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-2 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      onChange={(e) =>
                        setCredentials((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      disabled={isLoading}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <GoogleSignIn
                    onSuccess={handleGoogleLogin}
                    onError={handleGoogleError}
                    disabled={isLoading}
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowQLDTModal(true)}
                    disabled={isLoading}
                  >
                    <School className="mr-2 h-4 w-4" />
                    PTIT
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <a href="/register" className="underline underline-offset-4">
                    Sign up
                  </a>
                </div>
              </div>
            </form>
            <div className="relative hidden bg-muted md:block">
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <img
                  src={ptitLogo}
                  alt="PTIT Logo"
                  className="w-48 h-48 object-contain"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
          By clicking continue, you agree to our{" "}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </div>
      </div>

      {/* QLDT Login Modal */}
      <QLDTLoginModal
        isOpen={showQLDTModal}
        onClose={() => setShowQLDTModal(false)}
        onLogin={handleQLDTLogin}
        isLoading={isLoading}
      />
    </>
  );
}
