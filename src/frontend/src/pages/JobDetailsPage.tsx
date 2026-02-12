import { useParams, useNavigate } from '@tanstack/react-router';
import { useCurrentUser } from '../hooks/useCurrentUser';
import {
  useGetJobById,
  useGetJobApplications,
  useApplyToJob,
  useAssignWorkerToJob,
  useCompleteJob,
  useGetUserProfile,
  useRateOwner,
  useMarkPayoutAsPaid,
  useGetPayoutsForWorker,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, DollarSign, Clock, ArrowLeft, MessageSquare, CheckCircle, Users, Star, UserCheck } from 'lucide-react';
import { JobStatus, PayType, PayoutStatus } from '../backend';
import { toast } from 'sonner';
import { useState } from 'react';
import { Principal } from '@dfinity/principal';

export default function JobDetailsPage() {
  const { jobId } = useParams({ from: '/jobs/$jobId' });
  const navigate = useNavigate();
  const { identity, isOwner, isWorker } = useCurrentUser();
  const { data: job, isLoading } = useGetJobById(BigInt(jobId));
  const { data: applications = [] } = useGetJobApplications(job ? job.id : null);
  const applyToJob = useApplyToJob();
  const assignWorker = useAssignWorkerToJob();
  const completeJob = useCompleteJob();
  const rateOwner = useRateOwner();
  const markPaid = useMarkPayoutAsPaid();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showRatingDialog, setShowRatingDialog] = useState(false);

  const isJobOwner = job && identity && job.ownerPrincipal.toString() === identity.getPrincipal().toString();
  const isAssignedWorker = job && identity && job.assignedWorker?.toString() === identity.getPrincipal().toString();
  const hasApplied = applications.some(app => identity && app.worker.toString() === identity.getPrincipal().toString());

  const { data: ownerProfile } = useGetUserProfile(job?.ownerPrincipal || null);
  const { data: payouts = [] } = useGetPayoutsForWorker(identity?.getPrincipal() || null);
  const jobPayout = payouts.find(p => job && p.jobId === job.id);

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
        <Button onClick={() => navigate({ to: '/jobs' })}>Back to Jobs</Button>
      </div>
    );
  }

  const handleApply = async () => {
    try {
      await applyToJob.mutateAsync(job.id);
      toast.success('Application submitted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to apply');
    }
  };

  const handleAssignWorker = async (workerPrincipal: Principal) => {
    try {
      await assignWorker.mutateAsync({ jobId: job.id, worker: workerPrincipal });
      toast.success('Worker assigned successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign worker');
    }
  };

  const handleComplete = async () => {
    try {
      await completeJob.mutateAsync(job.id);
      toast.success('Job marked as completed!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete job');
    }
  };

  const handleRateOwner = async () => {
    try {
      await rateOwner.mutateAsync({
        owner: job.ownerPrincipal,
        rating: BigInt(rating),
        comment,
      });
      toast.success('Rating submitted successfully!');
      setShowRatingDialog(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit rating');
    }
  };

  const handleMarkPaid = async () => {
    try {
      await markPaid.mutateAsync(job.id);
      toast.success('Payout marked as paid!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark as paid');
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case JobStatus.open:
        return <Badge variant="default" className="text-base px-3 py-1">Open</Badge>;
      case JobStatus.assigned:
        return <Badge variant="secondary" className="text-base px-3 py-1">Assigned</Badge>;
      case JobStatus.completed:
        return <Badge variant="outline" className="text-base px-3 py-1">Completed</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/jobs' })}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Jobs
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
              <CardDescription className="text-base">
                Posted by {ownerProfile?.displayName || 'Unknown'} on{' '}
                {new Date(Number(job.createdAt) / 1000000).toLocaleDateString()}
              </CardDescription>
            </div>
            {getStatusBadge(job.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-semibold text-lg">${job.amount.toString()}</div>
                <div className="text-sm text-muted-foreground">
                  {job.payType === PayType.hourly ? 'Per Hour' : 'Per Day'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-semibold text-lg">{job.workersNeeded.toString()}</div>
                <div className="text-sm text-muted-foreground">
                  Worker{Number(job.workersNeeded) !== 1 ? 's' : ''} Needed
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-semibold">{job.location}</div>
                <div className="text-sm text-muted-foreground">Location</div>
              </div>
            </div>
          </div>

          {job.completedAt && (
            <div className="flex items-center gap-3 p-4 bg-accent/50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-primary" />
              <div>
                <div className="font-semibold">Completed</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(Number(job.completedAt) / 1000000).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Worker Actions */}
          {isWorker && job.status === JobStatus.open && !hasApplied && (
            <Button onClick={handleApply} disabled={applyToJob.isPending} className="w-full" size="lg">
              {applyToJob.isPending ? 'Applying...' : 'Apply for This Job'}
            </Button>
          )}

          {isWorker && hasApplied && job.status === JobStatus.open && (
            <div className="p-4 bg-accent/50 rounded-lg text-center">
              <p className="font-semibold">Application Submitted</p>
              <p className="text-sm text-muted-foreground">Waiting for owner to review</p>
            </div>
          )}

          {/* Chat Button */}
          {(isAssignedWorker || isJobOwner) && job.status !== JobStatus.open && (
            <Button
              onClick={() => navigate({ to: '/chat/$jobId', params: { jobId: job.id.toString() } })}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Open Chat
            </Button>
          )}

          {/* Owner Actions */}
          {isJobOwner && job.status === JobStatus.open && applications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Applicants ({applications.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {applications.map((app) => (
                  <ApplicationCard
                    key={app.worker.toString()}
                    application={app}
                    onAccept={() => handleAssignWorker(app.worker)}
                    isAccepting={assignWorker.isPending}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {isJobOwner && job.status === JobStatus.assigned && (
            <Button onClick={handleComplete} disabled={completeJob.isPending} className="w-full" size="lg">
              {completeJob.isPending ? 'Completing...' : 'Mark as Completed'}
            </Button>
          )}

          {/* Payout Section */}
          {isJobOwner && job.status === JobStatus.completed && jobPayout && (
            <Card>
              <CardHeader>
                <CardTitle>Payout Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <Badge variant={jobPayout.status === PayoutStatus.paid ? 'default' : 'secondary'}>
                    {jobPayout.status === PayoutStatus.paid ? 'Paid' : 'Unpaid'}
                  </Badge>
                </div>
                {jobPayout.status === PayoutStatus.unpaid && (
                  <Button onClick={handleMarkPaid} disabled={markPaid.isPending} className="w-full">
                    {markPaid.isPending ? 'Processing...' : 'Mark as Paid'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Worker Rating Section */}
          {isAssignedWorker && job.status === JobStatus.completed && (
            <Card>
              <CardHeader>
                <CardTitle>Rate the Job Owner</CardTitle>
                <CardDescription>Share your experience working on this job</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Star className="mr-2 h-5 w-5" />
                      Submit Rating
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rate {ownerProfile?.displayName}</DialogTitle>
                      <DialogDescription>Your feedback helps build trust in the community</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Rating (1-5 stars)</Label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="transition-colors"
                            >
                              <Star
                                className={`h-8 w-8 ${
                                  star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="comment">Comment (optional)</Label>
                        <Textarea
                          id="comment"
                          placeholder="Share your experience..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <Button onClick={handleRateOwner} disabled={rateOwner.isPending} className="w-full">
                        {rateOwner.isPending ? 'Submitting...' : 'Submit Rating'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ApplicationCard({
  application,
  onAccept,
  isAccepting,
}: {
  application: { worker: Principal; appliedAt: bigint };
  onAccept: () => void;
  isAccepting: boolean;
}) {
  const { data: workerProfile } = useGetUserProfile(application.worker);

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div>
        <p className="font-semibold">{workerProfile?.displayName || 'Unknown Worker'}</p>
        <p className="text-sm text-muted-foreground">
          Applied {new Date(Number(application.appliedAt) / 1000000).toLocaleDateString()}
        </p>
      </div>
      <Button onClick={onAccept} disabled={isAccepting} size="sm">
        {isAccepting ? 'Assigning...' : 'Accept'}
      </Button>
    </div>
  );
}
