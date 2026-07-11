import { act, renderHook } from '@testing-library/react';

import { useFavourites } from '../useFavourites';

const STORAGE_KEY = 'autovista:favourites';

describe('useFavourites', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts empty and becomes ready after mount', () => {
    const { result } = renderHook(() => useFavourites());

    expect(result.current.isReady).toBe(true);
    expect(result.current.favourites).toEqual([]);
  });

  it('toggles a favourite on and off, persisting to localStorage', () => {
    const { result } = renderHook(() => useFavourites());

    act(() => result.current.toggleFavourite('av-001'));
    expect(result.current.isFavourite('av-001')).toBe(true);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual(['av-001']);

    act(() => result.current.toggleFavourite('av-001'));
    expect(result.current.isFavourite('av-001')).toBe(false);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([]);
  });

  it('keeps multiple hook instances in sync', () => {
    const first = renderHook(() => useFavourites());
    const second = renderHook(() => useFavourites());

    act(() => first.result.current.toggleFavourite('av-002'));

    expect(second.result.current.isFavourite('av-002')).toBe(true);
  });

  it('recovers from corrupted storage', () => {
    window.localStorage.setItem(STORAGE_KEY, 'not-json{');
    const { result } = renderHook(() => useFavourites());

    expect(result.current.favourites).toEqual([]);
  });
});
