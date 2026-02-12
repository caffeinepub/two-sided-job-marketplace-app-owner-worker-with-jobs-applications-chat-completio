import { useCurrentUser } from '../hooks/useCurrentUser';
import { useGetAllJobs } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@tanstack/react-router';
import { Briefcase, PlusCircle, List, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { JobStatus } from '../backend';

export default function HomePage() {
  const { userProfile, isOwner, isWorker, identity } = useCurrentUser();
  const { data: jobs = [] } = useGetAllJobs();

  if (!userProfile || !identity) {
    return null;
  }

  const myJobs = jobs.filter(job => job.ownerPrincipal.toString() === identity.getPrincipal().toString());
  const myApplications = jobs.filter(job => 
    job.assignedWorker?.toString() === identity.getPrincipal().toString()
  );
  const openJobs = jobs.filter(job => job.status === JobStatus.open);

  const myCompletedJobs = myJobs.filter(job => job.status === JobStatus.completed);
  const myAssignedJobs = myApplications.filter(job => job.status === JobStatus.assigned);
  const myCompletedWork = myApplications.filter(job => job.status === JobStatus.completed);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome back, {userProfile.displayName}!</h1>
        <p className="text-muted-foreground text-lg">
          {isOwner ? 'Manage your jobs and find the right workers' : 'Find your next opportunity'}
        </p>
      </div>

      {isOwner && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myJobs.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Jobs</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {myJobs.filter(j => j.status === JobStatus.open).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myCompletedJobs.length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your job postings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full" size="lg">
                  <Link to="/create-job">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create New Job
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link to="/jobs">
                    <List className="mr-2 h-5 w-5" />
                    View All Jobs
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest job postings</CardDescription>
              </CardHeader>
              <CardContent>
                {myJobs.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No jobs posted yet</p>
                ) : (
                  <div className="space-y-2">
                    {myJobs.slice(0, 3).map(job => (
                      <Link
                        key={job.id.toString()}
                        to="/jobs/$jobId"
                        params={{ jobId: job.id.toString() }}
                        className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="font-medium">{job.title}</div>
                        <div className="text-sm text-muted-foreground capitalize">{job.status}</div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {isWorker && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Jobs</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openJobs.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myAssignedJobs.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myCompletedWork.length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Find Work</CardTitle>
                <CardDescription>Browse available opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" size="lg">
                  <Link to="/jobs">
                    <List className="mr-2 h-5 w-5" />
                    Browse Jobs
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Jobs</CardTitle>
                <CardDescription>Jobs you're currently working on</CardDescription>
              </CardHeader>
              <CardContent>
                {myAssignedJobs.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No active jobs</p>
                ) : (
                  <div className="space-y-2">
                    {myAssignedJobs.slice(0, 3).map(job => (
                      <Link
                        key={job.id.toString()}
                        to="/jobs/$jobId"
                        params={{ jobId: job.id.toString() }}
                        className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="font-medium">{job.title}</div>
                        <div className="text-sm text-muted-foreground">In Progress</div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
