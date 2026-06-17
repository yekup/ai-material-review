export type AssetType = 'image' | 'model3d'
export type AssetStatus = 'pending' | 'approved' | 'rejected'

export interface Asset {
  id: string
  name: string
  type: AssetType
  file: string
  format: string
  category: string
  tags: string[]
  status: AssetStatus
  priority: number
  description: string
  aiSummary: string
  aiSuggestedName: string
  aiSuggestedTags: string[]
  notes: string
  createdAt: string
  /** 评审提交时间（由 submitReview 设置） */
  reviewedAt?: string | null
}

export interface ReviewConfig {
  statusOptions: AssetStatus[]
  priorityOptions: number[]
  categories: string[]
  defaultStatus: AssetStatus
}

export interface AiMockConfig {
  summaryPrompt: string
  tagSuggestionPool: string[]
  aiSuggestFn: string
}

export interface CasesData {
  version: string
  description: string
  generatedAt: string
  assets: Asset[]
  reviewConfig: ReviewConfig
  aiMockConfig: AiMockConfig
}

export interface FilterState {
  search: string
  status: AssetStatus | 'all'
  category: string | 'all'
  type: AssetType | 'all'
}

export interface AISuggestion {
  summary: string
  suggestedName: string
  suggestedTags: string[]
}
