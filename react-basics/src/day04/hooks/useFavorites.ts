import { useEffect, useState } from 'react'

const STORAGE_KEY = 'day04:favorites'

function loadFavoriteIds(): number[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((v): v is number => typeof v === 'number') : []
  } catch {
    return []
  }
}

export function useFavorites() {
  // lazy initializer: localStorage 읽기를 첫 렌더링에서 한 번만 한다
  const [favoriteIds, setFavoriteIds] = useState<number[]>(loadFavoriteIds)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds))
  }, [favoriteIds])

  const isFavorite = (id: number) => favoriteIds.includes(id)

  const toggleFavorite = (id: number) => {
    setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  return { isFavorite, toggleFavorite }
}
