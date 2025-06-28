import RepoDetailCard from '@/components/RepoDetailCard';
import { Repository } from '@/lib/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRepositoryDetails } from '@/lib/github';

async function fetchRepo(owner: string, name: string): Promise<Repository | null> {
  try {
    return await getRepositoryDetails(owner, name);
  } catch {
    return null;
  }
}

interface Props {
  params: { owner: string; name: string };
}

export default async function RepoDetailPage({ params }: Props) {
  const repo = await fetchRepo(params.owner, params.name);
  if (!repo) notFound();

  return (
    <main className="flex flex-col items-center px-4 py-8 gap-6">
      <Link href="/" className="self-start text-blue-300 hover:underline">
        ← 検索に戻る
      </Link>
      <RepoDetailCard repo={repo} />
    </main>
  );
}
