import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces input before calling onSearch', async () => {
    const onSearch = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar onSearch={onSearch} delayMs={300} />);

    await user.type(screen.getByRole('searchbox'), 'aqua');
    expect(onSearch).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('aqua');
  });

  it('clears the input via the clear button and emits an empty search', async () => {
    const onSearch = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar onSearch={onSearch} delayMs={300} />);

    await user.type(screen.getByRole('searchbox'), 'prado');
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(onSearch).toHaveBeenLastCalledWith('prado');

    await user.click(screen.getByRole('button', { name: /clear search/i }));
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(onSearch).toHaveBeenLastCalledWith('');
  });
});
