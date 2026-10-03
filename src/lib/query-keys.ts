export const githubKeys = {
  all: ['github'] as const,
  profile: (token: string) => [...githubKeys.all, 'profile', token] as const,
  relationships: {
    all: (token: string) => [...githubKeys.all, 'relationships', token] as const,
    followers: (token: string) => [...githubKeys.relationships.all(token), 'followers'] as const,
    following: (token: string) => [...githubKeys.relationships.all(token), 'following'] as const,
    comparison: (token: string) => [...githubKeys.relationships.all(token), 'comparison'] as const,
  },
};
