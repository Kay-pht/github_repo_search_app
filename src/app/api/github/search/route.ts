import { NextResponse, NextRequest } from 'next/server';
import { searchRepositories } from '@/lib/github';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const pageParam = searchParams.get('page') || '1';
  const page = Number(pageParam);

  if (!query) {
    return NextResponse.json({ message: "Query parameter 'q' is required" }, { status: 400 });
  }

  try {
    const { items } = await searchRepositories(query, page);
    const nextPage = items.length === 30 ? page + 1 : null;
    return NextResponse.json({ items, nextPage });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? 'Unexpected error' }, { status: 500 });
  }
}
