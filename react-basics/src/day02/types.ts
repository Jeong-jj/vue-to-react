export type Category = 'apartment' | 'officetel' | 'oneroom'

export interface Property {
  id: number
  title: string
  category: Category
  deposit: number // 보증금 (만원)
  monthlyRent: number // 월세 (만원)
  area: number // 전용면적 (㎡)
  description: string
}

export const CATEGORY_LABEL: Record<Category, string> = {
  apartment: '아파트',
  officetel: '오피스텔',
  oneroom: '원룸',
}
