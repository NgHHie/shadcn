import { RegisterForm } from "@/components/register-form";
import { LanguageSwitcher } from "@/components/language-switcher";

interface RegisterPageProps {
  onRegisterSuccess?: () => void;
}

export default function RegisterPage({ onRegisterSuccess }: RegisterPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Language Switcher in top-right corner */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher variant="compact" />
      </div>
      
      <div className="w-full max-w-4xl">
        <RegisterForm onRegisterSuccess={onRegisterSuccess} />
      </div>
    </div>
  );
}
