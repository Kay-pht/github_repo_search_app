import Image from 'next/image';
import Link from 'next/link';
import { Repository } from '@/lib/types';

interface Props {
  repo: Repository;
}

export default function RepoCard({ repo }: Props) {
  return (
    <Link
      href={`/repo/${repo.owner.login}/${repo.name}`}
      className="flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-900 p-4 text-slate-300 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:border-slate-700 hover:bg-slate-800"
    >
      <Image
        src={repo.owner.avatar_url}
        alt={`${repo.owner.login} avatar`}
        width={40}
        height={40}
        className="rounded-full"
      />
      <span className="font-medium">{repo.full_name}</span>
    </Link>
  );
}
