import { CATEGORY_LABEL } from '../../day02/types'
import { usePropertyQuery } from '../api/queries'

interface Props {
  id: number
}

export function PropertyDetail({ id }: Props) {
  const { data: property } = usePropertyQuery(id)

  if (!property) return null

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
