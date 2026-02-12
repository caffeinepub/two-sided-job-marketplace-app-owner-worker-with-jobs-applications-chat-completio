import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

export default function AuthPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/assets/generated/app-logo.dim_512x512.png"
              alt="JobConnect Logo"
              className="h-24 w-24"
            />
          </div>
          <CardTitle className="text-2xl">Welcome to JobConnect</CardTitle>
          <CardDescription>
            Sign in to access your account and start connecting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={login}
            disabled={loginStatus === 'logging-in'}
            className="w-full"
            size="lg"
          >
            {loginStatus === 'logging-in' ? 'Signing in...' : 'Sign in with Internet Identity'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
