import { render, screen } from '@testing-library/react';
import RepoDetailCard from '@/components/RepoDetailCard';
import { Repository } from '@/lib/types';
import '@testing-library/jest-dom';

const mockRepository: Repository = {
  id: 12345,
  name: 'react',
  full_name: 'facebook/react',
  owner: {
    login: 'facebook',
    avatar_url: 'https://example.com/avatar.jpg',
  },
  stargazers_count: 200000,
  watchers_count: 200000,
  forks_count: 40000,
  open_issues_count: 1000,
  language: 'JavaScript',
};

describe('RepoDetailCard', () => {
  it('should render basic repository information', () => {
    render(<RepoDetailCard repo={mockRepository} />);

    // Repository name and owner
    expect(screen.getByText('facebook/react')).toBeInTheDocument();

    // Language
    expect(screen.getByText('JavaScript')).toBeInTheDocument();

    // Stats - using getAllByText for duplicate values
    const starAndWatcherCount = screen.getAllByText('200,000');
    expect(starAndWatcherCount).toHaveLength(2);
    expect(screen.getByText('40,000')).toBeInTheDocument(); // Fork count
    expect(screen.getByText('1,000')).toBeInTheDocument(); // Issue count
  });

  it('should render without language', () => {
    const repoWithoutLanguage = { ...mockRepository };
    delete repoWithoutLanguage.language;
    render(<RepoDetailCard repo={repoWithoutLanguage} />);

    // Should not crash and still render other information
    expect(screen.getByText('facebook/react')).toBeInTheDocument();

    // Language should not be rendered
    expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
  });

  it('should format large numbers correctly', () => {
    const repoWithLargeNumbers = {
      ...mockRepository,
      stargazers_count: 1234567,
      watchers_count: 9876543,
      forks_count: 123456,
      open_issues_count: 12345,
    };

    render(<RepoDetailCard repo={repoWithLargeNumbers} />);

    expect(screen.getByText('1,234,567')).toBeInTheDocument();
    expect(screen.getByText('9,876,543')).toBeInTheDocument();
    expect(screen.getByText('123,456')).toBeInTheDocument();
    expect(screen.getByText('12,345')).toBeInTheDocument();
  });

  it('should handle zero values correctly', () => {
    const repoWithZeros = {
      ...mockRepository,
      stargazers_count: 0,
      watchers_count: 0,
      forks_count: 0,
      open_issues_count: 0,
    };

    render(<RepoDetailCard repo={repoWithZeros} />);

    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(4);
  });

  it('should render all stat labels', () => {
    render(<RepoDetailCard repo={mockRepository} />);

    expect(screen.getByText('Stars')).toBeInTheDocument();
    expect(screen.getByText('Watchers')).toBeInTheDocument();
    expect(screen.getByText('Forks')).toBeInTheDocument();
    expect(screen.getByText('Issues')).toBeInTheDocument();
  });
});
