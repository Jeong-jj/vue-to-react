// 메모리 배열로 동작하는 가짜 API. 실제 서버처럼 지연과 실패를 흉내 낸다.
import { properties } from '../day02/data'
import type { Category, Property } from '../day02/types'

export type PropertyInput = Omit<Property, 'id'>

let db: Property[] = [...properties]
let nextId = db.length + 1
let failMode = false

// true로 두면 모든 요청이 실패한다 (error UI 확인용)
export function setFailMode(on: boolean) {
  failMode = on
}

async function request<T>(fn: () => T, ms = 600): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, ms))
  if (failMode) throw new Error('서버 오류가 발생했습니다 (mock)')
  return fn()
}

export function fetchProperties(category: Category | 'all'): Promise<Property[]> {
  return request(() =>
    category === 'all' ? [...db] : db.filter((p) => p.category === category),
  )
}

export function fetchProperty(id: number): Promise<Property> {
  return request(() => {
    const found = db.find((p) => p.id === id)
    if (!found) throw new Error(`매물 ${id}을 찾을 수 없습니다`)
    return { ...found }
  }, 400)
}

export function createProperty(input: PropertyInput): Promise<Property> {
  return request(() => {
    const created = { ...input, id: nextId++ }
    db = [...db, created]
    return created
  }, 800)
}

export function deleteProperty(id: number): Promise<void> {
  return request(() => {
    db = db.filter((p) => p.id !== id)
  }, 800)
}
