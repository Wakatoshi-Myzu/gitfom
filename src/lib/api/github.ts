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

    if (res.status === 401) throw new Error('Token PAT tidak valid atau telah kedaluwarsa.');
    if (res.status === 403) {
      if (errorDetail.includes('Resource not accessible')) {
        throw new Error('Izin Token PAT tidak mencukupi. Pastikan izin "Account permissions" -> "Followers" diatur ke "Read and write" (untuk Fine-grained PAT) atau centang "user:follow" (untuk Token Classic).');
      }
      throw new Error(`Akses GitHub Ditolak (403): ${errorDetail}`);
    }
    throw new Error(`Gagal mengambil profil GitHub: ${errorDetail}`);
  }

  return res.json();
}

/**
 * Generic fetcher untuk mengambil seluruh page secara otomatis
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

    if (res.status === 401) throw new Error('Token PAT tidak valid atau telah kedaluwarsa.');
    if (res.status === 403) {
      if (errorDetail.includes('Resource not accessible')) {
        throw new Error('Izin Token PAT tidak mencukupi. Jika menggunakan Fine-grained PAT, pastikan izin "Account permissions" -> "Followers" diatur ke "Read and write". Atau gunakan Token Classic (ghp_) dengan scope "user:follow".');
      }
      throw new Error(`Akses GitHub Ditolak (403): ${errorDetail}`);
    }
    throw new Error(`Gagal mengambil data dari GitHub: ${errorDetail}`);
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
    throw new Error(`Gagal unfollow ${username}: ${res.statusText}`);
  }
}

/**
 * Follow user via GitHub REST API (Optional feature for fans tab)
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
    throw new Error(`Gagal follow ${username}: ${res.statusText}`);
  }
}
