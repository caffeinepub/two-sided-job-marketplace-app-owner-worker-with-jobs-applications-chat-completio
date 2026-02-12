import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { Button } from '@/components/ui/button';
import { Briefcase, ArrowRight, Download } from 'lucide-react';

export default function SplashPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { requestInstall, isInstalled } = usePwaInstall();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  const handleGetStarted = () => {
    login();
  };

  const handleInstall = async () => {
    await requestInstall();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8 sm:py-16 max-w-6xl">
        <div className="flex flex-col items-center text-center gap-6 sm:gap-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <Briefcase className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">JobConnect</h1>
          </div>

          <div className="max-w-3xl w-full">
            <img
              src="/assets/generated/splash-illustration.dim_1440x900.png"
              alt="JobConnect - Connect workers with opportunities"
              className="w-full rounded-xl sm:rounded-2xl shadow-2xl mb-6 sm:mb-8"
            />
          </div>

          <div className="max-w-2xl space-y-3 sm:space-y-4 px-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
              Connect Workers with Opportunities
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              A modern marketplace connecting job owners with skilled workers. 
              Post jobs, find work, communicate seamlessly, and manage payments all in one place.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6 sm:mt-8 w-full sm:w-auto px-4">
            <Button
              size="lg"
              onClick={handleGetStarted}
              disabled={loginStatus === 'logging-in'}
              className="text-base sm:text-lg px-8 py-5 sm:py-6 w-full sm:w-auto min-h-[48px]"
            >
              {loginStatus === 'logging-in' ? 'Connecting...' : 'Get Started'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            {!isInstalled && (
              <Button
                size="lg"
                variant="outline"
                onClick={handleInstall}
                className="text-base sm:text-lg px-8 py-5 sm:py-6 w-full sm:w-auto min-h-[48px]"
              >
                <Download className="mr-2 h-5 w-5" />
                Install App
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-12 sm:mt-16 max-w-4xl w-full px-4">
            <div className="p-5 sm:p-6 rounded-lg bg-card border">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">For Job Owners</h3>
              <ul className="text-muted-foreground space-y-2 text-left text-sm sm:text-base">
                <li>• Post jobs with detailed requirements</li>
                <li>• Review and accept applicants</li>
                <li>• Track job completion</li>
                <li>• Manage payments</li>
              </ul>
            </div>
            <div className="p-5 sm:p-6 rounded-lg bg-card border">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">For Workers</h3>
              <ul className="text-muted-foreground space-y-2 text-left text-sm sm:text-base">
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
