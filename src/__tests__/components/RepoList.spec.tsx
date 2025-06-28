import { render, screen, waitFor } from '@testing-library/react';
import RepoList from '@/components/RepoList';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useSearchParams } from 'next/navigation';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('@tanstack/react-query');
jest.mock('react-intersection-observer');
jest.mock('next/navigation');

const mockRepositories = [
  {
    id: 1,
    name: 'react',
    full_name: 'facebook/react',
    owner: { login: 'facebook', avatar_url: 'https://example.com/avatar1.jpg' },
    stargazers_count: 200000,
    watchers_count: 200000,
    forks_count: 40000,
    open_issues_count: 1000,
    language: 'JavaScript',
  },
  {
    id: 2,
    name: 'vue',
    full_name: 'vuejs/vue',
    owner: { login: 'vuejs', avatar_url: 'https://example.com/avatar2.jpg' },
    stargazers_count: 180000,
    watchers_count: 180000,
    forks_count: 30000,
    open_issues_count: 500,
    language: 'TypeScript',
  },
];

describe('RepoList', () => {
  const mockFetchNextPage = jest.fn();
  const mockUseInfiniteQuery = useInfiniteQuery as jest.Mock;
  const mockUseInView = useInView as jest.Mock;
  const mockUseSearchParams = useSearchParams as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock for useInView
    mockUseInView.mockReturnValue({ ref: jest.fn(), inView: false });

    // Default mock for useSearchParams
    mockUseSearchParams.mockReturnValue({
      get: jest.fn((key) => (key === 'q' ? 'react' : null)),
    });
  });

  it('should show loading state initially', () => {
    mockUseInfiniteQuery.mockReturnValue({
      data: undefined,
      status: 'pending',
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      error: null,
    });

    render(<RepoList />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('should show empty state when no results', () => {
    mockUseInfiniteQuery.mockReturnValue({
      data: { pages: [{ items: [] }] },
      status: 'success',
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      error: null,
    });

    render(<RepoList />);

    expect(screen.getByText('0 件でした')).toBeInTheDocument();
  });

  it('should render repository cards', () => {
    mockUseInfiniteQuery.mockReturnValue({
      data: { pages: [{ items: mockRepositories }] },
      status: 'success',
      isFetchingNextPage: false,
      hasNextPage: true,
      fetchNextPage: mockFetchNextPage,
      error: null,
    });

    render(<RepoList />);

    expect(screen.getByText('facebook/react')).toBeInTheDocument();
    expect(screen.getByText('vuejs/vue')).toBeInTheDocument();
  });

  it('should fetch next page when scrolled to bottom', async () => {
    const mockRef = jest.fn();

    // First render: not in view
    mockUseInView.mockReturnValue({ ref: mockRef, inView: false });

    mockUseInfiniteQuery.mockReturnValue({
      data: { pages: [{ items: mockRepositories }] },
      status: 'success',
      isFetchingNextPage: false,
      hasNextPage: true,
      fetchNextPage: mockFetchNextPage,
      error: null,
    });

    const { rerender } = render(<RepoList />);

    // Verify ref is attached to trigger element
    expect(mockRef).toHaveBeenCalled();

    // Simulate scrolling to bottom (inView becomes true)
    mockUseInView.mockReturnValue({ ref: mockRef, inView: true });

    rerender(<RepoList />);

    await waitFor(() => {
      expect(mockFetchNextPage).toHaveBeenCalled();
    });
  });

  it('should show loading more indicator when fetching next page', () => {
    mockUseInfiniteQuery.mockReturnValue({
      data: { pages: [{ items: mockRepositories }] },
      status: 'success',
      isFetchingNextPage: true,
      hasNextPage: true,
      fetchNextPage: mockFetchNextPage,
      error: null,
    });

    render(<RepoList />);

    expect(screen.getByText('読み込み中...', { selector: '.py-4' })).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseInfiniteQuery.mockReturnValue({
      data: undefined,
      status: 'error',
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      error: new Error('API Error'),
    });

    render(<RepoList />);

    expect(screen.getByText('API Error')).toBeInTheDocument();
  });

  it('should pass correct parameters to useInfiniteQuery', () => {
    mockUseSearchParams.mockReturnValue({
      get: jest.fn((key) => (key === 'q' ? 'typescript' : null)),
    });

    mockUseInfiniteQuery.mockReturnValue({
      data: undefined,
      status: 'pending',
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      error: null,
    });

    render(<RepoList />);

    expect(mockUseInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['repos', 'typescript'],
        queryFn: expect.any(Function),
        getNextPageParam: expect.any(Function),
        initialPageParam: 1,
        enabled: true,
      })
    );
  });

  it('should not render when query is empty', () => {
    mockUseSearchParams.mockReturnValue({
      get: jest.fn(() => null),
    });

    mockUseInfiniteQuery.mockReturnValue({
      data: undefined,
      status: 'success',
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      error: null,
    });

    const { container } = render(<RepoList />);

    expect(container.firstChild).toBeNull();
  });
});
