import { Repository } from './types';

const GITHUB_API_BASE_URL = 'https://api.github.com';

type SearchResult = {
  items: Repository[];
};

export async function searchRepositories(
  query: string,
  page = 1,
  perPage = 30
): Promise<SearchResult> {
  const encodedQuery = encodeURIComponent(query);
  const response = await fetch(
    `${GITHUB_API_BASE_URL}/search/repositories?q=${encodedQuery}&page=${page}&per_page=${perPage}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GH_PAT}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch repositories: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getRepositoryDetails(owner: string, repo: string): Promise<Repository> {
  const response = await fetch(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${process.env.GH_PAT}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch repository details: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}
