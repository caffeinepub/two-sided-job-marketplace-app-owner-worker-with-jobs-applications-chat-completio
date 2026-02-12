import { Link, useNavigate } from '@tanstack/react-router';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Briefcase, Home, List, User, MessageSquare, PlusCircle } from 'lucide-react';
import LoginButton from './LoginButton';

export default function NavBar() {
  const { isAuthenticated, isOwner, isWorker, userProfile } = useCurrentUser();
  const navigate = useNavigate();

  if (!isAuthenticated || !userProfile) {
    return null;
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Briefcase className="h-6 w-6 text-primary" />
              <span>JobConnect</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
              
              <Button variant="ghost" size="sm" asChild>
                <Link to="/jobs">
                  <List className="h-4 w-4 mr-2" />
                  Jobs
                </Link>
              </Button>
              
              {isOwner && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/create-job">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Job
                  </Link>
                </Button>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </Button>
            <LoginButton />
          </div>
        </div>
      </div>
    </header>
  );
}
