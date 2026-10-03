import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { githubKeys } from '@/lib/query-keys';
import {
  fetchAllPages,
  fetchUserProfile,
  unfollowUser,
  followUser,
  GitHubUserBasic,
  RelationshipAnalysis,
} from '@/lib/api/github';

export function useGitHubProfile(token: string | null) {
  return useQuery({
    queryKey: githubKeys.profile(token ?? ''),
    queryFn: async (): Promise<GitHubUserBasic> => {
      if (!token) throw new Error('GitHub PAT diperlukan.');
      return fetchUserProfile(token);
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useGitHubRelationships(token: string | null) {
  return useQuery({
    queryKey: githubKeys.relationships.comparison(token ?? ''),
    queryFn: async (): Promise<RelationshipAnalysis> => {
      if (!token) throw new Error('GitHub PAT diperlukan.');

      // Fetch user profile and parallel followers & following lists
      const [profile, followers, following] = await Promise.all([
        fetchUserProfile(token),
        fetchAllPages<GitHubUserBasic>('/user/followers', token),
        fetchAllPages<GitHubUserBasic>('/user/following', token),
      ]);

      const followersMap = new Map(followers.map((u) => [u.login.toLowerCase(), u]));
      const followingMap = new Map(following.map((u) => [u.login.toLowerCase(), u]));

      // 1. Akun yang kita ikuti tapi mereka tidak follow back
      const notFollowingBack = following.filter((u) => !followersMap.has(u.login.toLowerCase()));

      // 2. Saling follow (Mutuals)
      const mutuals = following.filter((u) => followersMap.has(u.login.toLowerCase()));

      // 3. Akun yang mem-follow kita tapi belum kita follow (Fans)
      const fans = followers.filter((u) => !followingMap.has(u.login.toLowerCase()));

      return {
        userProfile: profile,
        followers,
        following,
        notFollowingBack,
        mutuals,
        fans,
      };
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 15, // Cache valid selama 15 menit
    gcTime: 1000 * 60 * 60,    // Pertahankan di memory 1 jam
  });
}

export function useUnfollowMutation(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) => unfollowUser(username, token),
    onSuccess: (_, username) => {
      const lower = username.toLowerCase();
      // Optimistic update pada query relationship
      queryClient.setQueryData<RelationshipAnalysis>(
        githubKeys.relationships.comparison(token),
        (old) => {
          if (!old) return old;
          const updatedFollowing = old.following.filter((u) => u.login.toLowerCase() !== lower);
          const updatedNotFollowingBack = old.notFollowingBack.filter((u) => u.login.toLowerCase() !== lower);
          const updatedMutuals = old.mutuals.filter((u) => u.login.toLowerCase() !== lower);
          
          // If the target user was in mutuals, they become a Fan (they follow us, but we no longer follow them)
          const wasMutual = old.mutuals.find((u) => u.login.toLowerCase() === lower);
          const updatedFans = wasMutual ? [...old.fans, wasMutual] : old.fans;

          return {
            ...old,
            following: updatedFollowing,
            notFollowingBack: updatedNotFollowingBack,
            mutuals: updatedMutuals,
            fans: updatedFans,
          };
        }
      );
    },
  });
}

export function useFollowMutation(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) => followUser(username, token),
    onSuccess: (_, username) => {
      const lower = username.toLowerCase();
      queryClient.setQueryData<RelationshipAnalysis>(
        githubKeys.relationships.comparison(token),
        (old) => {
          if (!old) return old;
          const fanUser = old.fans.find((u) => u.login.toLowerCase() === lower);
          if (!fanUser) return old;

          return {
            ...old,
            following: [...old.following, fanUser],
            mutuals: [...old.mutuals, fanUser],
            fans: old.fans.filter((u) => u.login.toLowerCase() !== lower),
          };
        }
      );
    },
  });
}
