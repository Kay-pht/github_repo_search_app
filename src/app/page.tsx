import Image from 'next/image';
import SearchBar from '@/components/SearchBar';
import RepoList from '@/components/RepoList';
import { Suspense } from 'react';

export default function Home() {
  return (
    <main className="flex flex-col items-center px-4 py-8">
      <Suspense fallback={<div className="mt-2" />}>
        <SearchBar />
      </Suspense>
      <Suspense fallback={<div className="mt-8 text-center">読み込み中...</div>}>
        <RepoList />
      </Suspense>
    </main>
  );
}
