import { get, set } from 'idb-keyval'
import type { AssetStatus } from '../types'

const STORAGE_KEY = 'material-review-data'

export interface PersistedReview {
  status: AssetStatus
  notes: string
  tags: string[]
  aiSummary: string
  aiSuggestedName: string
  aiSuggestedTags: string[]
  reviewedAt: string | null
}

/** 从 IndexedDB 加载所有评审记录 */
export async function loadAllReviews(): Promise<Record<string, PersistedReview>> {
  try {
    const data = await get(STORAGE_KEY)
    return data || {}
  } catch {
    return {}
  }
}

/** 全量写入评审记录到 IndexedDB */
export async function writeAllReviews(
  data: Record<string, PersistedReview>,
) {
  await set(STORAGE_KEY, data)
}
