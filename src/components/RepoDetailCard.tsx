import Image from 'next/image';
import { Repository } from '@/lib/types';

interface Props {
  repo: Repository;
}

export default function RepoDetailCard({ repo }: Props) {
  const format = (n: number) => new Intl.NumberFormat('en-US').format(n);

  return (
    <div className="w-full max-w-2xl rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Image
          src={repo.owner.avatar_url}
          alt={`${repo.owner.login} avatar`}
          width={60}
          height={60}
          className="rounded-full border border-slate-700"
        />
        <div>
          <h1 className="text-xl font-semibold">{repo.full_name}</h1>
          {repo.language && <p className="text-sm text-slate-300">{repo.language}</p>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <Stat label="Stars" value={format(repo.stargazers_count)} />
        <Stat label="Watchers" value={format(repo.watchers_count)} />
        <Stat label="Forks" value={format(repo.forks_count)} />
        <Stat label="Issues" value={format(repo.open_issues_count)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-md bg-slate-800 py-4">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-lg font-medium">{value}</span>
    </div>
  );
}
