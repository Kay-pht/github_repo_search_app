import { Repository } from './types';

const GITHUB_API_BASE_URL = 'https://api.github.com';

type SearchResult = {
  items: Repository[];
};

export async function searchRepositories(query: string): Promise<SearchResult> {
  const encodedQuery = encodeURIComponent(query);
  const response = await fetch(`${GITHUB_API_BASE_URL}/search/repositories?q=${encodedQuery}`, {
    headers: {
      Authorization: `token ${process.env.GH_PAT}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch repositories: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getRepositoryDetails(owner: string, repo: string): Promise<Repository> {
  const response = await fetch(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `token ${process.env.GH_PAT}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch repository details: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}
