import { useCurrentUser } from '../hooks/useCurrentUser';
import { useGetAllJobs } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@tanstack/react-router';
import { MapPin, DollarSign, Clock, Briefcase, UserCheck } from 'lucide-react';
import { JobStatus, PayType } from '../backend';

export default function JobListPage() {
  const { identity, isOwner } = useCurrentUser();
  const { data: jobs = [], isLoading } = useGetAllJobs();

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Loading jobs...</p>
      </div>
    );
  }

  const myJobs = isOwner && identity
    ? jobs.filter(job => job.ownerPrincipal.toString() === identity.getPrincipal().toString())
    : [];

  const openJobs = jobs.filter(job => job.status === JobStatus.open);
  const displayJobs = isOwner ? myJobs : openJobs;

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case JobStatus.open:
        return <Badge variant="default">Open</Badge>;
      case JobStatus.assigned:
        return <Badge variant="secondary">Assigned</Badge>;
      case JobStatus.completed:
        return <Badge variant="outline">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          {isOwner ? 'My Jobs' : 'Available Jobs'}
        </h1>
        <p className="text-muted-foreground text-lg">
          {isOwner
            ? `Manage your ${myJobs.length} job posting${myJobs.length !== 1 ? 's' : ''}`
            : `Browse ${openJobs.length} open opportunity${openJobs.length !== 1 ? 'ies' : 'y'}`}
        </p>
      </div>

      {displayJobs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground">
              {isOwner ? 'Create your first job to get started' : 'Check back later for new opportunities'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayJobs.map((job) => (
            <Link
              key={job.id.toString()}
              to="/jobs/$jobId"
              params={{ jobId: job.id.toString() }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-xl line-clamp-2">{job.title}</CardTitle>
                    {getStatusBadge(job.status)}
                  </div>
                  <CardDescription className="line-clamp-3">{job.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">${job.amount.toString()}</span>
                    <span className="text-muted-foreground">
                      / {job.payType === PayType.hourly ? 'hour' : 'day'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{job.workersNeeded.toString()}</span>
                    <span className="text-muted-foreground">
                      worker{Number(job.workersNeeded) !== 1 ? 's' : ''} needed
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(Number(job.createdAt) / 1000000).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
