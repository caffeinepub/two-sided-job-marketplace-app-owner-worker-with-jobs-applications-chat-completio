import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Briefcase, Wrench } from 'lucide-react';
import { UserRole } from '../backend';
import { toast } from 'sonner';

export default function RoleSelectPage() {
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    try {
      await saveProfile.mutateAsync({ 
        displayName: displayName.trim(), 
        role: selectedRole,
        phoneNumber: phoneNumber.trim()
      });
      toast.success('Profile created successfully!');
      navigate({ to: '/' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Tell us a bit about yourself to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Your Name</Label>
              <Input
                id="displayName"
                placeholder="Enter your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Select Your Role</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole(UserRole.owner)}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    selectedRole === UserRole.owner
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Briefcase className="h-8 w-8 mb-3 text-primary" />
                  <h3 className="font-semibold text-lg mb-2">Job Owner</h3>
                  <p className="text-sm text-muted-foreground">
                    Post jobs, review applicants, and manage workers
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole(UserRole.worker)}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    selectedRole === UserRole.worker
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Wrench className="h-8 w-8 mb-3 text-primary" />
                  <h3 className="font-semibold text-lg mb-2">Worker</h3>
                  <p className="text-sm text-muted-foreground">
                    Find jobs, apply to opportunities, and get paid
                  </p>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={saveProfile.isPending}
            >
              {saveProfile.isPending ? 'Creating Profile...' : 'Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
