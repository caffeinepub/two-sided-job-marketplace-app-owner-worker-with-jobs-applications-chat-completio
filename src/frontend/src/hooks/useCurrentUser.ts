import { useInternetIdentity } from './useInternetIdentity';
import { useActor } from './useActor';
import { useGetCallerUserProfile } from './useQueries';
import { UserRole } from '../backend';

export function useCurrentUser() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const needsRoleSelection = isAuthenticated && !profileLoading && isFetched && userProfile === null;
  const currentRole = userProfile?.role;
  const isOwner = currentRole === UserRole.owner;
  const isWorker = currentRole === UserRole.worker;

  return {
    identity,
    actor,
    userProfile,
    isAuthenticated,
    needsRoleSelection,
    currentRole,
    isOwner,
    isWorker,
    isLoading: actorFetching || profileLoading,
    isFetched,
  };
}
