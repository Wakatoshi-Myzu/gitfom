import { GitHubUserBasic, RelationshipAnalysis } from './api/github';

export const DEMO_PROFILE: GitHubUserBasic = {
  id: 1029384,
  login: 'demo_developer',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  html_url: 'https://github.com',
  type: 'User',
  name: 'Demo Developer',
  bio: 'Building awesome web apps & exploring GitHub API relationships.',
  public_repos: 42,
  followers: 1100,
  following: 2300,
};

const SAMPLE_LOGINS = [
  'torvalds', 'shadcn', 'vercel', 'gaearon', 'sundarpichai',
  'dan_abramov', 'rich_harris', 'yyx990803', 'addyosmani', 'sindresorhus',
  'tj', 'rauchg', 'swyx', 'sebmarkbage', 'bvaughn',
  'sophiebits', 'lukeed', 'tannerlinsley', 'leeerob', 'delbaoliveira',
  'shadcn_fan_1', 'code_ninja_88', 'dev_warrior_99', 'tech_lead_pro', 'byte_master'
];

export function generateDemoData(): RelationshipAnalysis {
  const followers: GitHubUserBasic[] = [];
  const following: GitHubUserBasic[] = [];

  // Generate 25 followers
  for (let i = 0; i < 25; i++) {
    const login = i < SAMPLE_LOGINS.length ? SAMPLE_LOGINS[i] : `github_user_${i + 1}`;
    followers.push({
      id: 1000 + i,
      login,
      avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${login}`,
      html_url: `https://github.com/${login}`,
      type: 'User',
    });
  }

  // Generate 40 following
  for (let i = 0; i < 40; i++) {
    let login = '';
    if (i < 10) {
      // First 10 are mutual (present in followers)
      login = followers[i].login;
    } else {
      login = `non_follower_dev_${i - 9}`;
    }

    following.push({
      id: 5000 + i,
      login,
      avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${login}`,
      html_url: `https://github.com/${login}`,
      type: 'User',
    });
  }

  const followersMap = new Map(followers.map((u) => [u.login.toLowerCase(), u]));
  const followingMap = new Map(following.map((u) => [u.login.toLowerCase(), u]));

  const notFollowingBack = following.filter((u) => !followersMap.has(u.login.toLowerCase()));
  const mutuals = following.filter((u) => followersMap.has(u.login.toLowerCase()));
  const fans = followers.filter((u) => !followingMap.has(u.login.toLowerCase()));

  return {
    userProfile: DEMO_PROFILE,
    followers,
    following,
    notFollowingBack,
    mutuals,
    fans,
  };
}
