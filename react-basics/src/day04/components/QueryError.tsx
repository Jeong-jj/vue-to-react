interface Props {
  error: Error
  retrying: boolean
  onRetry: () => void
}

export function QueryError({ error, retrying, onRetry }: Props) {
  return (
    <div role="alert">
      <p>{error.message}</p>
      <button type="button" onClick={onRetry} disabled={retrying}>
        {retrying ? '다시 시도 중...' : '다시 시도'}
      </button>
    </div>
  )
}
