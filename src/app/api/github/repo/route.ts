import { NextRequest, NextResponse } from 'next/server';
import { getRepositoryDetails } from '@/lib/github';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');
  const name = searchParams.get('name');

  if (!owner || !name) {
    return NextResponse.json(
      { message: "Query parameters 'owner' and 'name' are required" },
      { status: 400 }
    );
  }

  try {
    const repo = await getRepositoryDetails(owner, name);
    return NextResponse.json({ repo });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? 'Unexpected error' }, { status: 500 });
  }
}
