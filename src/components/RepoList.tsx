'use client';

import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import RepoCard from './RepoCard';
import { Repository } from '@/lib/types';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

async function fetchRepos(query: string, pageParam: number) {
  const res = await fetch(`/api/github/search?q=${encodeURIComponent(query)}&page=${pageParam}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default function RepoList() {
  const params = useSearchParams();
  const q = params.get('q') ?? '';

  const { data, fetchNextPage, hasNextPage, status, error, isFetchingNextPage } = useInfiniteQuery<{
    items: Repository[];
    nextPage: number | null;
  }>({
    queryKey: ['repos', q],
    enabled: !!q,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    queryFn: ({ pageParam = 1 }) => fetchRepos(q, pageParam as number),
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!q) return null;

  if (status === 'pending') {
    return <div className="mt-8 text-center">読み込み中...</div>;
  }

  if (status === 'error') {
    return <div className="mt-8 text-center text-red-500">{(error as Error).message}</div>;
  }

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  if (items.length === 0) {
    return <div className="mt-8 text-center">0 件でした</div>;
  }

  return (
    <div className="mt-8 flex flex-col gap-4 w-full max-w-xl">
      {items.map((repo) => (
        <RepoCard key={repo.id} repo={repo} />
      ))}
      {/* Sentinel for infinite scroll */}
      <div ref={ref} />
      {isFetchingNextPage && <div className="text-center py-4">読み込み中...</div>}
    </div>
  );
}
