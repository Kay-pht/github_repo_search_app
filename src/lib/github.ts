import { Repository } from './types';

const GITHUB_API_BASE_URL = 'https://api.github.com';

// 環境変数チェック
if (!process.env.GH_PAT) {
  throw new Error(
    '環境変数 GH_PAT が設定されていません。GitHub Personal Access Token を設定してください。'
  );
}

// カスタムエラークラス
export class GitHubApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

// エラーメッセージの定義
const ERROR_MESSAGES: Record<number, string> = {
  403: '認証エラーが発生しました',
  404: 'リポジトリが見つかりませんでした',
  429: 'APIレート制限に達しました',
};

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
    const message =
      ERROR_MESSAGES[response.status] ||
      `エラーが発生しました: ${response.status} ${response.statusText}`;
    throw new GitHubApiError(message, response.status, response.statusText);
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
    const message =
      ERROR_MESSAGES[response.status] ||
      `エラーが発生しました: ${response.status} ${response.statusText}`;
    throw new GitHubApiError(message, response.status, response.statusText);
  }

  return response.json();
}
