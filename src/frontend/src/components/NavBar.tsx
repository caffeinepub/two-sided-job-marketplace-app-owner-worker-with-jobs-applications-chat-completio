import { Link } from '@tanstack/react-router';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { Button } from '@/components/ui/button';
import { Briefcase, Home, List, User, PlusCircle, Menu, Download } from 'lucide-react';
import LoginButton from './LoginButton';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

export default function NavBar() {
  const { isAuthenticated, isOwner, userProfile } = useCurrentUser();
  const { requestInstall, isInstalled } = usePwaInstall();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated || !userProfile) {
    return null;
  }

  const handleInstall = async () => {
    setMobileMenuOpen(false);
    await requestInstall();
  };

  const NavLinks = () => (
    <>
      <Button variant="ghost" size="sm" asChild onClick={() => setMobileMenuOpen(false)}>
        <Link to="/">
          <Home className="h-4 w-4 mr-2" />
          Home
        </Link>
      </Button>
      
      <Button variant="ghost" size="sm" asChild onClick={() => setMobileMenuOpen(false)}>
        <Link to="/jobs">
          <List className="h-4 w-4 mr-2" />
          Jobs
        </Link>
      </Button>
      
      {isOwner && (
        <Button variant="ghost" size="sm" asChild onClick={() => setMobileMenuOpen(false)}>
          <Link to="/create-job">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Job
          </Link>
        </Button>
      )}

      <Button variant="ghost" size="sm" asChild onClick={() => setMobileMenuOpen(false)}>
        <Link to="/profile">
          <User className="h-4 w-4 mr-2" />
          Profile
        </Link>
      </Button>

      {!isInstalled && (
        <Button variant="ghost" size="sm" onClick={handleInstall}>
          <Download className="h-4 w-4 mr-2" />
          Install App
        </Button>
      )}
    </>
  );

  return (
    <header className="border-b bg-card sticky top-0 z-40 pt-safe">
      <div className="container mx-auto px-4 py-3 sm:py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to="/" className="flex items-center gap-2 text-lg sm:text-xl font-bold text-foreground">
              <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span>JobConnect</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-2">
              <NavLinks />
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:block">
              <LoginButton />
            </div>
            
            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  <NavLinks />
                  <div className="pt-4 border-t">
                    <LoginButton />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
