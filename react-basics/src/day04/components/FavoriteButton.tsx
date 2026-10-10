interface Props {
  active: boolean
  onToggle: () => void
}

export function FavoriteButton({ active, onToggle }: Props) {
  return (
    <button type="button" onClick={onToggle} aria-pressed={active}>
      {active ? '★ 즐겨찾기 해제' : '☆ 즐겨찾기'}
    </button>
  )
}
