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
      className="flex items-center gap-4 border p-4 rounded hover:bg-gray-50 transition"
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
