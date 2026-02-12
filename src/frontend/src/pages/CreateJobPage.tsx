import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useCreateJob } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { PayType } from '../backend';
import { ArrowLeft } from 'lucide-react';

export default function CreateJobPage() {
  const { isOwner } = useCurrentUser();
  const navigate = useNavigate();
  const createJob = useCreateJob();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [payType, setPayType] = useState<PayType>(PayType.hourly);
  const [amount, setAmount] = useState('');
  const [workersNeeded, setWorkersNeeded] = useState('1');
  const [location, setLocation] = useState('');

  if (!isOwner) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-muted-foreground">Only job owners can create jobs.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !location.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const workersNum = parseInt(workersNeeded);
    if (isNaN(workersNum) || workersNum < 1) {
      toast.error('Workers needed must be at least 1');
      return;
    }

    try {
      await createJob.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        payType,
        amount: BigInt(Math.floor(amountNum)),
        workersNeeded: BigInt(workersNum),
        location: location.trim(),
      });
      toast.success('Job created successfully!');
      navigate({ to: '/jobs' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create job');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Create New Job</CardTitle>
          <CardDescription>Post a job and find the right worker for your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                placeholder="e.g., House Cleaning, Lawn Maintenance"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the job requirements, expectations, and any specific details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="payType">Pay Type *</Label>
                <Select value={payType} onValueChange={(value) => setPayType(value as PayType)}>
                  <SelectTrigger id="payType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PayType.hourly}>Hourly</SelectItem>
                    <SelectItem value={PayType.daily}>Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workersNeeded">Workers Needed *</Label>
                <Input
                  id="workersNeeded"
                  type="number"
                  placeholder="1"
                  value={workersNeeded}
                  onChange={(e) => setWorkersNeeded(e.target.value)}
                  min="1"
                  step="1"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Downtown, 123 Main St"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={createJob.isPending} className="flex-1">
                {createJob.isPending ? 'Creating...' : 'Create Job'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/' })}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
