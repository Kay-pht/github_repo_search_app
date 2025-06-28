# GitHub Repository Search App – Architecture & Overview

## 1. Purpose

GitHub の **search/repositories** API を用いて、リポジトリ検索・詳細表示を行う Web アプリケーション。
学習用途でありながら、実務レベルの品質を目指した最小構成の実装。

### 主要機能

- リアルタイムキーワード検索（300msデバウンス）
- 無限スクロール（30件ずつ自動読み込み）
- リポジトリ詳細表示（Star/Fork/Issue/Watcher数）

## 2. MVP Scope (YAGNI原則適用)

| 画面                                    | 要件                                                        | 実装詳細                                                                                            |
| --------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **トップページ** (`/`)                  | 検索フォーム／結果カード／**無限スクロール**                | - デバウンス検索（300ms）<br>- URLクエリパラメータ保持<br>- IntersectionObserver による自動読み込み |
| **詳細ページ** (`/repo/[owner]/[name]`) | リポジトリ名・オーナー・言語・Star／Watcher／Fork／Issue 数 | - Server Component で SSR<br>- 統計情報カード表示<br>- 戻るリンク                                   |
| **API Routes**                          | PAT 認証・検索／詳細取得                                    | - `/api/github/search`: ページネーション対応<br>- `/api/github/repo`: 詳細情報取得                  |
| **エラーハンドリング**                  | API エラー処理                                              | - 429/403: レート制限エラー<br>- 404: Not Found ページ遷移<br>- その他: エラーメッセージ表示        |

## 3. Tech Stack

| Layer         | Library / Version                      | 選定理由                                                                      |
| ------------- | -------------------------------------- | ----------------------------------------------------------------------------- |
| Runtime       | **Node.js – 最新 LTS**                 | 安定性と長期サポート                                                          |
| Framework     | **Next.js 15.3.4** (App Router)        | - SSR/CSRの柔軟な組み合わせ<br>- ファイルベースルーティング<br>- API Routes   |
| Language      | **TypeScript 5**                       | - 型安全性（strict mode + exactOptionalPropertyTypes）<br>- IDE サポート      |
| Styling       | **Tailwind CSS 4**                     | - ユーティリティファースト<br>- ダークテーマ対応<br>- JIT コンパイル          |
| UI Components | **shadcn/ui**                          | - アクセシビリティ対応<br>- カスタマイズ可能                                  |
| Data Fetching | **TanStack Query 5.29.3**              | - キャッシュ管理（staleTime: 60秒）<br>- 無限スクロール対応<br>- 自動リトライ |
| Testing       | **Jest 30 + React Testing Library 16** | - ユニットテスト<br>- コンポーネントテスト                                    |
| CI/CD         | **GitHub Actions**                     | - 自動テスト実行<br>- Lintチェック（警告0件）                                 |

## 4. Directory Structure (実装済み)

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # トップページ (検索画面)
│   ├── layout.tsx               # ルートレイアウト
│   ├── globals.css              # グローバルスタイル
│   ├── repo/
│   │   └── [owner]/[name]/
│   │       └── page.tsx         # リポジトリ詳細ページ
│   └── api/github/
│       ├── search/
│       │   └── route.ts         # 検索API (GET)
│       └── repo/
│           └── route.ts         # 詳細API (GET)
├── components/
│   ├── SearchBar.tsx            # 検索バー (デバウンス付き)
│   ├── RepoList.tsx             # リポジトリ一覧 (無限スクロール)
│   ├── RepoCard.tsx             # リポジトリカード
│   ├── RepoDetailCard.tsx       # 詳細情報カード
│   ├── Providers.tsx            # QueryClientProvider
│   └── ToastProvider.tsx        # react-hot-toast ラッパー
├── lib/
│   ├── github.ts                # GitHub API クライアント
│   ├── types.ts                 # TypeScript 型定義
│   ├── use-debounce.ts          # デバウンスカスタムフック
│   └── utils.ts                 # ユーティリティ関数
└── __tests__/
    └── components/              # コンポーネントテスト
```

## 5. Data Flow & State Management

### 5.1 検索フロー

```
1. SearchBar入力
   ↓ (300ms debounce)
2. URLクエリパラメータ更新 (?q=keyword)
   ↓
3. RepoListがクエリを検知
   ↓
4. useInfiniteQueryが/api/github/searchを呼び出し
   ↓
5. APIがGitHub APIにリクエスト (PAT認証付き)
   ↓
6. レスポンスをキャッシュして表示
```

### 5.2 無限スクロール実装

- **react-intersection-observer** でビューポート監視
- リスト末尾の要素が表示されたら `fetchNextPage` 実行
- 30件ずつ追加読み込み（GitHub API のデフォルト）

### 5.3 キャッシュ戦略

- **staleTime**: 60秒（再検証までの時間）
- **refetchOnWindowFocus**: false（フォーカス時の再取得無効）
- ページ遷移時もキャッシュを維持

## 6. Component Details

### 6.1 SearchBar

- **役割**: キーワード入力と検索実行
- **実装詳細**:
  - `useDebounce` フックで300ms遅延
  - URLクエリパラメータとの同期
  - ページパラメータのリセット

### 6.2 RepoList

- **役割**: 検索結果の表示と無限スクロール
- **実装詳細**:
  - `useInfiniteQuery` でページネーション管理
  - `useInView` でスクロール位置検知
  - ローディング/エラー/空状態の表示

### 6.3 RepoDetailCard

- **役割**: リポジトリ詳細情報の表示
- **デザイン詳細**:
  - ダークテーマ（bg-slate-900）
  - 統計情報カード（ホバーエフェクト付き）
  - レスポンシブグリッド（2列→4列）

## 7. API Design

### 7.1 /api/github/search

**Request**:

```
GET /api/github/search?q={keyword}&page={number}
```

**Response**:

```json
{
  "items": [Repository[]],
  "nextPage": number | null
}
```

### 7.2 /api/github/repo

**Request**:

```
GET /api/github/repo?owner={owner}&name={name}
```

**Response**:

```json
Repository object
```

## 8. Type Definitions

```typescript
type Repository = {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  language?: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
};
```

## 9. Error Handling Strategy

| エラー種別         | 処理方法             | ユーザー体験                |
| ------------------ | -------------------- | --------------------------- |
| 429 (Rate Limit)   | エラーメッセージ表示 | "APIレート制限に達しました" |
| 403 (Forbidden)    | エラーメッセージ表示 | "認証エラーが発生しました"  |
| 404 (Not Found)    | notFound() 呼び出し  | Next.js の 404 ページ       |
| ネットワークエラー | エラーメッセージ表示 | "通信エラーが発生しました"  |
| 空検索結果         | Empty State 表示     | "0 件でした"                |

## 10. Testing Strategy

| テスト種別     | 対象                 | ツール                 | カバレッジ                               |
| -------------- | -------------------- | ---------------------- | ---------------------------------------- |
| Unit Test      | API クライアント関数 | Jest                   | searchRepositories, getRepositoryDetails |
| Component Test | UI コンポーネント    | Jest + RTL             | SearchBar, RepoList, RepoDetailCard      |
| E2E Test       | ユーザーフロー       | MCP Playwright（手動） | 検索→無限スクロール→詳細表示             |

### 10.1 テスト詳細

- **SearchBar**: デバウンス動作、URLクエリ同期
- **RepoList**: 無限スクロール、各種状態表示
- **RepoDetailCard**: props表示、数値フォーマット
- **github.ts**: API呼び出し、エラーハンドリング

## 11. CI/CD Pipeline

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    - actions/checkout@v4
    - actions/setup-node@v4 (node-version: lts/*)
    - npm ci
    - npm run lint -- --max-warnings 0
    - npm run test
```

## 12. Performance Optimizations

| 最適化項目     | 実装内容         | 効果               |
| -------------- | ---------------- | ------------------ |
| デバウンス     | 300ms 遅延       | API呼び出し削減    |
| キャッシュ     | staleTime: 60秒  | 重複リクエスト防止 |
| 無限スクロール | 30件ずつ読み込み | 初期表示の高速化   |
| Next.js Image  | 自動最適化       | 画像の遅延読み込み |

## 13. Security Considerations

- GitHub PAT は環境変数で管理（.env.local）
- API Routes 経由で PAT を隠蔽
- クライアントサイドに認証情報を露出しない

## 14. Future Improvements (Out of Scope)

- 検索フィルター（言語、スター数など）
- ソート機能
- お気に入り機能
- 検索履歴
- PWA対応
- i18n対応

## 15. Development Timeline

- **Phase 1**: プロジェクト基盤構築（完了）
- **Phase 2**: GitHub API 実装（完了）
- **Phase 3**: 検索ページ実装（完了）
- **Phase 4**: 詳細ページ実装（完了）
- **Phase 5**: テスト実装（完了）
- **Phase 6**: ドキュメント整備（完了）
- **期間**: 2025-06-21 〜 2025-07-03
