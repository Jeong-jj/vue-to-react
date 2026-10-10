import { useState } from 'react'

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])

  const isFavorite = (id: number) => favoriteIds.includes(id)

  const toggleFavorite = (id: number) => {
    setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  return { isFavorite, toggleFavorite }
}
