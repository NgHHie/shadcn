import { RegisterForm } from "@/components/register-form";

interface RegisterPageProps {
  onRegisterSuccess?: () => void;
}

export default function RegisterPage({ onRegisterSuccess }: RegisterPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <RegisterForm onRegisterSuccess={onRegisterSuccess} />
      </div>
    </div>
  );
}
