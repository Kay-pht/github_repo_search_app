| Data & State | **TanStack Query – 最新安定版** |
| Test | **Jest / Playwright – 最新安定版** |

## 4. Directory Structure (proposal)

src/
├─ app/
│ ├─ page.tsx
│ ├─ repo/[owner]/[name]/page.tsx
│ └─ api/github/search/route.ts
├─ components/
│ ├─ providers/
│ │ └─ query-provider.tsx
│ └─ search/
│ ├─ SearchBar.tsx
│ ├─ RepoCard.tsx
│ └─ RepoList.tsx
├─ hooks/
│ └─ use-infinite-scroll.ts
├─ lib/
│ ├─ github.ts
│ └─ types.ts
├─ tests/
└─ e2e/

## 5. Routing & Data Flow

1. `/` で検索ボタンクリック → URL クエリ (`?q=...`) を更新
2. _useInfiniteQuery_ が URL クエリを検知し `/api/github/search` をページング取得
3. `RepoList` 内の `react-intersection-observer` がリスト末尾を検知し、自動で次ページをロード
4. カードクリック → `/repo/[owner]/[name]`
5. Server Component が `lib/github.ts` の関数を直接呼び出し、リポジトリ詳細を描画

## 6. Error / Loading UX

- shadcn/ui の Skeleton (`animate-pulse`)
- 429/403 エラー → shadcn/ui の Toast
- 0 件 → Empty State
