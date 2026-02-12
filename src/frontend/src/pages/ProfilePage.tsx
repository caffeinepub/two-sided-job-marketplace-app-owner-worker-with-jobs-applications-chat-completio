import { useState } from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
  useGetAllJobs,
  useGetPayoutsForWorker,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Briefcase, CheckCircle, Clock, DollarSign, Star, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { JobStatus, PayoutStatus } from '../backend';

export default function ProfilePage() {
  const { identity, isOwner, isWorker } = useCurrentUser();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: jobs = [] } = useGetAllJobs();
  const { data: payouts = [] } = useGetPayoutsForWorker(identity?.getPrincipal() || null);
  const saveProfile = useSaveCallerUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [copied, setCopied] = useState(false);

  if (!userProfile || !identity) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const principalId = identity.getPrincipal().toString();
  const shortPrincipal = `${principalId.slice(0, 8)}...${principalId.slice(-6)}`;

  const myJobs = jobs.filter(job => job.ownerPrincipal.toString() === principalId);
  const completedJobs = myJobs.filter(job => job.status === JobStatus.completed);
  const openJobs = myJobs.filter(job => job.status === JobStatus.open);

  const myAssignments = jobs.filter(job => job.assignedWorker?.toString() === principalId);
  const completedWork = myAssignments.filter(job => job.status === JobStatus.completed);
  const activeWork = myAssignments.filter(job => job.status === JobStatus.assigned);

  const paidPayouts = payouts.filter(p => p.status === PayoutStatus.paid);
  const unpaidPayouts = payouts.filter(p => p.status === PayoutStatus.unpaid);

  const averageRating = userProfile.ratingCount > 0
    ? Number(userProfile.ratingSum) / Number(userProfile.ratingCount)
    : 0;

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error('Phone number cannot be empty');
      return;
    }

    try {
      await saveProfile.mutateAsync({ 
        displayName: displayName.trim(), 
        role: userProfile.role,
        phoneNumber: phoneNumber.trim()
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(principalId);
    setCopied(true);
    toast.success('Principal ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground text-lg">Manage your account and view your activity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Display Name</Label>
            {isEditing ? (
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={userProfile.displayName}
              />
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">{userProfile.displayName}</p>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => {
                    setDisplayName(userProfile.displayName);
                    setPhoneNumber(userProfile.phoneNumber);
                    setIsEditing(true);
                  }}>
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Phone Number</Label>
            {isEditing ? (
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={userProfile.phoneNumber}
              />
            ) : (
              <p className="text-lg">{userProfile.phoneNumber}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saveProfile.isPending}>
                {saveProfile.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <Label>Role</Label>
            <div>
              <Badge variant="secondary" className="text-base px-3 py-1">
                {userProfile.role === 'owner' ? 'Job Owner' : 'Worker'}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Principal ID</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono">
                {shortPrincipal}
              </code>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {isOwner && userProfile.ratingCount > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="text-lg font-semibold">
                    {averageRating.toFixed(1)} / 5.0
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({userProfile.ratingCount.toString()} rating{Number(userProfile.ratingCount) !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Job Statistics
            </CardTitle>
            <CardDescription>Overview of your job postings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Open Jobs</span>
                </div>
                <p className="text-3xl font-bold">{openJobs.length}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Completed</span>
                </div>
                <p className="text-3xl font-bold">{completedJobs.length}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-sm">Total Jobs</span>
                </div>
                <p className="text-3xl font-bold">{myJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isWorker && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Work Statistics
              </CardTitle>
              <CardDescription>Overview of your work history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Active Jobs</span>
                  </div>
                  <p className="text-3xl font-bold">{activeWork.length}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Completed</span>
                  </div>
                  <p className="text-3xl font-bold">{completedWork.length}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-sm">Total Jobs</span>
                  </div>
                  <p className="text-3xl font-bold">{myAssignments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payout Summary
              </CardTitle>
              <CardDescription>Track your earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Paid</span>
                  </div>
                  <p className="text-3xl font-bold">{paidPayouts.length}</p>
                  <p className="text-sm text-muted-foreground">
                    ${paidPayouts.reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <p className="text-3xl font-bold">{unpaidPayouts.length}</p>
                  <p className="text-sm text-muted-foreground">
                    ${unpaidPayouts.reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
