import { searchRepositories, getRepositoryDetails } from './github';
import { Repository } from './types';

describe('searchRepositories', () => {
  let mockFetch: jest.SpyInstance;

  beforeEach(() => {
    mockFetch = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should correctly encode the query and return repositories', async () => {
    const mockRepo: Repository = {
      id: 1,
      name: 'test-repo',
      full_name: 'owner/test-repo',
      owner: { login: 'owner', avatar_url: 'url' },
      stargazers_count: 10,
      watchers_count: 10,
      forks_count: 5,
      open_issues_count: 2,
    };
    const mockResponse = { items: [mockRepo] };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const query = 'react native';
    const encodedQuery = encodeURIComponent(query);
    const data = await searchRepositories(query);

    expect(data).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      `https://api.github.com/search/repositories?q=${encodedQuery}`,
      {
        headers: {
          Authorization: `token ${process.env.GH_PAT}`,
        },
      }
    );
  });

  it('should throw an error on failed fetch', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    });

    await expect(searchRepositories('test')).rejects.toThrow(
      'Failed to fetch repositories: 403 Forbidden'
    );
  });
});

describe('getRepositoryDetails', () => {
  let mockFetch: jest.SpyInstance;

  beforeEach(() => {
    mockFetch = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return repository details on successful fetch', async () => {
    const mockRepo: Repository = {
      id: 1,
      name: 'test-repo',
      full_name: 'owner/test-repo',
      owner: { login: 'owner', avatar_url: 'url' },
      language: 'TypeScript',
      stargazers_count: 10,
      watchers_count: 10,
      forks_count: 5,
      open_issues_count: 2,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRepo,
    });

    const data = await getRepositoryDetails('owner', 'test-repo');
    expect(data).toEqual(mockRepo);
    expect(mockFetch).toHaveBeenCalledWith('https://api.github.com/repos/owner/test-repo', {
      headers: {
        Authorization: `token ${process.env.GH_PAT}`,
      },
    });
  });

  it('should throw an error on failed fetch', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(getRepositoryDetails('owner', 'non-existent-repo')).rejects.toThrow(
      'Failed to fetch repository details: 404 Not Found'
    );
  });
});
