'use client';

import { useDebounce } from '@/lib/use-debounce';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SearchBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [input, setInput] = useState(searchParams.get('q') ?? '');
  const debounced = useDebounce(input, 300);

  useEffect(() => {
    // Update URL when debounced value changes
    const params = new URLSearchParams(window.location.search);
    if (debounced) {
      params.set('q', debounced);
    } else {
      params.delete('q');
    }
    // Reset page param when query changes
    params.delete('page');
    router.push(`/?${params.toString()}`);
  }, [debounced, router]);

  return (
    <div className="flex w-full max-w-xl gap-2">
      <input
        type="text"
        className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-slate-200 placeholder:text-slate-500 focus:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-700"
        placeholder="リポジトリ名を入力してください"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
    </div>
  );
}
