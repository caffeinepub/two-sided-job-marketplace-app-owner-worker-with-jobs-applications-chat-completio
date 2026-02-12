import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Job, UserProfile, JobApplication, ChatMessage, Payout, UserRole, PayType } from '../backend';
import { Principal } from '@dfinity/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ displayName, role, phoneNumber }: { displayName: string; role: UserRole; phoneNumber: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(displayName, role, phoneNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetUserProfile(principal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

export function useGetAllUserProfiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['allUserProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUserProfiles();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Job Queries
export function useGetAllJobs() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllJobs();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetJobById(jobId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Job | null>({
    queryKey: ['job', jobId?.toString()],
    queryFn: async () => {
      if (!actor || jobId === null) return null;
      return actor.getJobById(jobId);
    },
    enabled: !!actor && !actorFetching && jobId !== null,
  });
}

export function useCreateJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      payType,
      amount,
      workersNeeded,
      location,
    }: {
      title: string;
      description: string;
      payType: PayType;
      amount: bigint;
      workersNeeded: bigint;
      location: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createJob(title, description, payType, amount, workersNeeded, location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useCompleteJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.completeJob(jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job'] });
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
    },
  });
}

// Job Application Queries
export function useGetJobApplications(jobId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<JobApplication[]>({
    queryKey: ['jobApplications', jobId?.toString()],
    queryFn: async () => {
      if (!actor || jobId === null) return [];
      return actor.getJobApplications(jobId);
    },
    enabled: !!actor && !actorFetching && jobId !== null,
  });
}

export function useApplyToJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.applyToJob(jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useAssignWorkerToJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, worker }: { jobId: bigint; worker: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignWorkerToJob(jobId, worker);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job'] });
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
    },
  });
}

// Chat Queries
export function useGetChatMessages(jobId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ChatMessage[]>({
    queryKey: ['chatMessages', jobId?.toString()],
    queryFn: async () => {
      if (!actor || jobId === null) return [];
      return actor.getChatMessages(jobId);
    },
    enabled: !!actor && !actorFetching && jobId !== null,
    refetchInterval: 3000, // Poll every 3 seconds
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, to, text }: { jobId: bigint; to: Principal; text: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(jobId, to, text);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', variables.jobId.toString()] });
    },
  });
}

// Payout Queries
export function useGetPayoutsForWorker(worker: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Payout[]>({
    queryKey: ['payouts', worker?.toString()],
    queryFn: async () => {
      if (!actor || !worker) return [];
      return actor.getPayoutsForWorker(worker);
    },
    enabled: !!actor && !actorFetching && !!worker,
  });
}

export function useMarkPayoutAsPaid() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markPayoutAsPaid(jobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
    },
  });
}

// Rating Queries
export function useGetOwnerRating(owner: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number | null>({
    queryKey: ['ownerRating', owner?.toString()],
    queryFn: async () => {
      if (!actor || !owner) return null;
      return actor.getOwnerRating(owner);
    },
    enabled: !!actor && !actorFetching && !!owner,
  });
}

export function useRateOwner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ owner, rating, comment }: { owner: Principal; rating: bigint; comment: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rateOwner(owner, rating, comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerRating'] });
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
    },
  });
}
