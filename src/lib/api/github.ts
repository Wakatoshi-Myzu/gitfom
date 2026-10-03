export interface GitHubUserBasic {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  type: string;
  bio?: string;
  name?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
}

export interface RelationshipAnalysis {
  userProfile?: GitHubUserBasic;
  followers: GitHubUserBasic[];
  following: GitHubUserBasic[];
  notFollowingBack: GitHubUserBasic[];
  mutuals: GitHubUserBasic[];
  fans: GitHubUserBasic[];
}

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Fetch authenticated GitHub User profile
 */
export async function fetchUserProfile(token: string): Promise<GitHubUserBasic> {
  const res = await fetch(`${GITHUB_API_BASE}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    let errorDetail = res.statusText;
    try {
      const errJson = await res.json();
      if (errJson.message) errorDetail = errJson.message;
    } catch {}

    if (res.status === 401) throw new Error('Invalid or expired Personal Access Token.');
    if (res.status === 403) {
      if (errorDetail.includes('Resource not accessible')) {
        throw new Error('Insufficient Personal Access Token permissions. Ensure "Account permissions" -> "Followers" is set to "Read and write" (for Fine-grained PAT) or enable "user:follow" scope (for Classic Token).');
      }
      throw new Error(`GitHub Access Denied (403): ${errorDetail}`);
    }
    throw new Error(`Failed to fetch GitHub profile: ${errorDetail}`);
  }

  return res.json();
}

/**
 * Generic fetcher to retrieve all pages automatically
 */
export async function fetchAllPages<T>(
  endpoint: string,
  token: string,
  onProgress?: (count: number) => void
): Promise<T[]> {
  let results: T[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const res = await fetch(`${GITHUB_API_BASE}${endpoint}?per_page=${perPage}&page=${page}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      let errorDetail = res.statusText;
      try {
        const errJson = await res.json();
        if (errJson.message) errorDetail = errJson.message;
      } catch {}

      if (res.status === 401) throw new Error('Invalid or expired Personal Access Token.');
      if (res.status === 403) {
        if (errorDetail.includes('Resource not accessible')) {
          throw new Error('Insufficient Personal Access Token permissions. Ensure "Account permissions" -> "Followers" is set to "Read and write" (for Fine-grained PAT) or enable "user:follow" scope (for Classic Token).');
        }
        throw new Error(`GitHub Access Denied (403): ${errorDetail}`);
      }
      throw new Error(`Failed to fetch data from GitHub: ${errorDetail}`);
    }

    const data: T[] = await res.json();
    if (!data.length) break;

    results = results.concat(data);
    if (onProgress) onProgress(results.length);

    if (data.length < perPage) break;
    page++;
  }

  return results;
}

/**
 * Unfollow single user via GitHub REST API
 */
export async function unfollowUser(username: string, token: string): Promise<void> {
  const res = await fetch(`${GITHUB_API_BASE}/user/following/${username}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to unfollow @${username}: ${res.statusText}`);
  }
}

/**
 * Follow user via GitHub REST API
 */
export async function followUser(username: string, token: string): Promise<void> {
  const res = await fetch(`${GITHUB_API_BASE}/user/following/${username}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Length': '0',
    },
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to follow @${username}: ${res.statusText}`);
  }
}
