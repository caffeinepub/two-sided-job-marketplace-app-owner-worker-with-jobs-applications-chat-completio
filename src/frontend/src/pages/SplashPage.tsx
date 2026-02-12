import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Briefcase, ArrowRight } from 'lucide-react';

export default function SplashPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  const handleGetStarted = () => {
    login();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="flex flex-col items-center text-center gap-8">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold text-foreground">JobConnect</h1>
          </div>

          <div className="max-w-3xl">
            <img
              src="/assets/generated/splash-illustration.dim_1440x900.png"
              alt="JobConnect - Connect workers with opportunities"
              className="w-full rounded-2xl shadow-2xl mb-8"
            />
          </div>

          <div className="max-w-2xl space-y-4">
            <h2 className="text-3xl font-semibold text-foreground">
              Connect Workers with Opportunities
            </h2>
            <p className="text-lg text-muted-foreground">
              A modern marketplace connecting job owners with skilled workers. 
              Post jobs, find work, communicate seamlessly, and manage payments all in one place.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button
              size="lg"
              onClick={handleGetStarted}
              disabled={loginStatus === 'logging-in'}
              className="text-lg px-8 py-6"
            >
              {loginStatus === 'logging-in' ? 'Connecting...' : 'Get Started'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 max-w-4xl">
            <div className="p-6 rounded-lg bg-card border">
              <h3 className="text-xl font-semibold mb-2">For Job Owners</h3>
              <ul className="text-muted-foreground space-y-2 text-left">
                <li>• Post jobs with detailed requirements</li>
                <li>• Review and accept applicants</li>
                <li>• Track job completion</li>
                <li>• Manage payments</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg bg-card border">
              <h3 className="text-xl font-semibold mb-2">For Workers</h3>
              <ul className="text-muted-foreground space-y-2 text-left">
                <li>• Browse available jobs</li>
                <li>• Apply to opportunities</li>
                <li>• Chat with job owners</li>
                <li>• Get paid for completed work</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
