import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, School, User, Lock } from 'lucide-react';
import type { QLDTCredentials } from '@/types/auth';

interface QLDTLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (credentials: QLDTCredentials) => Promise<void>;
  isLoading: boolean;
}

export default function QLDTLoginModal({
  isOpen,
  onClose,
  onLogin,
  isLoading
}: QLDTLoginModalProps) {
  const { t } = useTranslation('auth');
  const [credentials, setCredentials] = useState<QLDTCredentials>({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      setError(t('qldt.validationRequired'));
      return;
    }

    setError(null);
    
    try {
      await onLogin(credentials);
      // Reset form on success
      setCredentials({ username: '', password: '' });
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : t('qldt.loginFailed'));
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setCredentials({ username: '', password: '' });
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <School className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                {t('qldt.title')}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {t('qldt.description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="qldt-username" className="text-sm font-medium">
              {t('qldt.username')}
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="qldt-username"
                type="text"
                placeholder={t('qldt.usernamePlaceholder')}
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                disabled={isLoading}
                className="pl-10"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qldt-password" className="text-sm font-medium">
              {t('qldt.password')}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="qldt-password"
                type="password"
                placeholder={t('qldt.passwordPlaceholder')}
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                disabled={isLoading}
                className="pl-10"
                autoComplete="current-password"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              {t('qldt.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !credentials.username || !credentials.password}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('qldt.loggingIn')}
                </>
              ) : (
                <>
                  <School className="w-4 h-4 mr-2" />
                  {t('qldt.login')}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
