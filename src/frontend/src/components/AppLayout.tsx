import { ReactNode } from 'react';
import NavBar from './NavBar';
import OfflineBanner from './OfflineBanner';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />
      <NavBar />
      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl pb-safe">
        {children}
      </main>
      <footer className="border-t mt-12 sm:mt-16 py-6 sm:py-8 pb-safe">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} JobConnect. Built with love using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
