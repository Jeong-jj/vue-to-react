import { CATEGORY_LABEL } from '../../day02/types'
import { usePropertyQuery } from '../api/queries'
import { QueryError } from './QueryError'

interface Props {
  id: number
}

export function PropertyDetail({ id }: Props) {
  const { data: property, isPending, isError, error, isFetching, refetch } = usePropertyQuery(id)

  if (isPending) return <p>상세 정보를 불러오는 중...</p>
  if (isError) return <QueryError error={error} retrying={isFetching} onRetry={() => refetch()} />

  return (
    <article>
      <h2>{property.title}</h2>
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
