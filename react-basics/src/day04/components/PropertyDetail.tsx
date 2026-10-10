import { CATEGORY_LABEL } from '../../day02/types'
import { usePropertyQuery } from '../api/queries'
import { FavoriteButton } from './FavoriteButton'
import { QueryError } from './QueryError'

interface Props {
  id: number
  favorite: boolean
  onToggleFavorite: (id: number) => void
}

export function PropertyDetail({ id, favorite, onToggleFavorite }: Props) {
  const { data: property, isPending, isError, error, isFetching, refetch } = usePropertyQuery(id)

  if (isPending) return <p>상세 정보를 불러오는 중...</p>
  if (isError) return <QueryError error={error} retrying={isFetching} onRetry={() => refetch()} />

  return (
    <article>
      <h2>{property.title}</h2>
      <FavoriteButton active={favorite} onToggle={() => onToggleFavorite(property.id)} />
      <dl>
        <dt>유형</dt>
        <dd>{CATEGORY_LABEL[property.category]}</dd>
        <dt>보증금 / 월세</dt>
        <dd>
          {property.deposit} / {property.monthlyRent} (만원)
        </dd>
        <dt>전용면적</dt>
        <dd>{property.area}㎡</dd>
        <dt>설명</dt>
        <dd>{property.description}</dd>
      </dl>
    </article>
  )
}
