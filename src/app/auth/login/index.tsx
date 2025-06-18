import { LoginForm } from "@/components/login-form";

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <LoginForm onLoginSuccess={onLoginSuccess} />
      </div>
    </div>
  );
}
