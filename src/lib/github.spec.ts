import { searchRepositories, getRepositoryDetails, GitHubApiError } from './github';
import { Repository } from './types';

describe('GitHub API', () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-ignore
    global.fetch = mockFetch;
  });

  describe('searchRepositories', () => {
    it('should return search results when successful', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            name: 'test-repo',
            full_name: 'user/test-repo',
            owner: { login: 'user', avatar_url: 'https://example.com/avatar.jpg' },
            stargazers_count: 100,
            watchers_count: 50,
            forks_count: 25,
            open_issues_count: 10,
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchRepositories('test', 1);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/search/repositories?q=test&page=1&per_page=30',
        {
          headers: {
            Authorization: 'Bearer test-github-pat-token',
          },
        }
      );
    });

    it('should throw GitHubApiError on 403 error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      await expect(searchRepositories('test')).rejects.toThrow(
        new GitHubApiError('認証エラーが発生しました', 403, 'Forbidden')
      );
    });

    it('should throw GitHubApiError on 429 error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      await expect(searchRepositories('test')).rejects.toThrow(
        new GitHubApiError('APIレート制限に達しました', 429, 'Too Many Requests')
      );
    });

    it('should throw GitHubApiError with default message on unknown error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(searchRepositories('test')).rejects.toThrow(
        new GitHubApiError(
          'エラーが発生しました: 500 Internal Server Error',
          500,
          'Internal Server Error'
        )
      );
    });
  });

  describe('getRepositoryDetails', () => {
    it('should return repository details when successful', async () => {
      const mockRepository = {
        id: 1,
        name: 'test-repo',
        full_name: 'user/test-repo',
        owner: { login: 'user', avatar_url: 'https://example.com/avatar.jpg' },
        stargazers_count: 100,
        watchers_count: 50,
        forks_count: 25,
        open_issues_count: 10,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepository,
      });

      const result = await getRepositoryDetails('user', 'test-repo');

      expect(result).toEqual(mockRepository);
      expect(mockFetch).toHaveBeenCalledWith('https://api.github.com/repos/user/test-repo', {
        headers: {
          Authorization: 'Bearer test-github-pat-token',
        },
      });
    });

    it('should throw GitHubApiError on 404 error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(getRepositoryDetails('user', 'nonexistent')).rejects.toThrow(
        new GitHubApiError('リポジトリが見つかりませんでした', 404, 'Not Found')
      );
    });
  });
});
