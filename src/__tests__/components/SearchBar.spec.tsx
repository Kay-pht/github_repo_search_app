import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '@/components/SearchBar';
import { useRouter, useSearchParams } from 'next/navigation';
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe('SearchBar', () => {
  const mockPush = jest.fn();
  const mockRouter = { push: mockPush };

  beforeEach(() => {
    jest.clearAllMocks();
    window.location.search = '';
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => null),
    });
  });

  it('should render the search input', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('リポジトリ名を入力してください');
    expect(input).toBeInTheDocument();
  });

  it('should initialize with query param value', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key) => (key === 'q' ? 'initial query' : null)),
    });

    render(<SearchBar />);
    const input = screen.getByPlaceholderText('リポジトリ名を入力してください') as HTMLInputElement;
    expect(input.value).toBe('initial query');
  });

  it('should update URL after 300ms debounce', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });

    render(<SearchBar />);

    const input = screen.getByPlaceholderText('リポジトリ名を入力してください');

    // Type "react"
    await user.type(input, 'react');

    // Fast-forward time by 300ms
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/?q=react');
    });

    jest.useRealTimers();
  });

  it('should clear query param when input is empty', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });

    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key) => (key === 'q' ? 'test' : null)),
    });

    render(<SearchBar />);
    const input = screen.getByPlaceholderText('リポジトリ名を入力してください');

    // Clear the input
    await user.clear(input);

    // Fast-forward time
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/?');
    });

    jest.useRealTimers();
  });

  it('should reset page param when query changes', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });

    // Mock current URL with page param
    window.location.search = '?page=2';

    render(<SearchBar />);
    const input = screen.getByPlaceholderText('リポジトリ名を入力してください');

    await user.type(input, 'typescript');

    // Fast-forward time
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/?q=typescript');
    });

    jest.useRealTimers();
  });
});
