import { create } from 'zustand'
import { loadAllReviews } from '../services/persistence'
import type { Asset, AssetStatus, FilterState } from '../types'
import type { PersistedReview } from '../services/persistence'

interface AppState {
  assets: Asset[]
  filteredAssets: Asset[]
  selectedAssetId: string | null
  compareList: string[]
  filter: FilterState
  viewMode: 'grid' | 'detail' | 'compare'
  aiLoading: boolean
  initialized: boolean // true after persistence merge

  loadAssets: (assets: Asset[]) => void
  /** 从 IndexedDB 合并持久化数据（在 loadAssets 之后调用） */
  mergePersistedData: () => Promise<void>
  setSelectedAsset: (id: string | null) => void
  toggleCompare: (id: string) => void
  clearCompare: () => void
  setFilter: (partial: Partial<FilterState>) => void
  setViewMode: (mode: 'grid' | 'detail' | 'compare') => void
  updateStatus: (id: string, status: AssetStatus) => void
  updateNotes: (id: string, notes: string) => void
  updateTags: (id: string, tags: string[]) => void
  setAISummary: (id: string, summary: string) => void
  setAISuggestedName: (id: string, name: string) => void
  setAISuggestedTags: (id: string, tags: string[]) => void
  submitReview: (id: string) => void
  setAiLoading: (loading: boolean) => void
}

function applyFilter(assets: Asset[], filter: FilterState): Asset[] {
  return assets.filter(a => {
    if (filter.status !== 'all' && a.status !== filter.status) return false
    if (filter.category !== 'all' && a.category !== filter.category) return false
    if (filter.type !== 'all' && a.type !== filter.type) return false
    if (filter.search) {
      const q = filter.search.toLowerCase()
      if (
        !a.name.toLowerCase().includes(q) &&
        !a.tags.some(t => t.toLowerCase().includes(q)) &&
        !a.description.toLowerCase().includes(q)
      ) return false
    }
    return true
  })
}

/** 触发持久化（防抖：500ms 内多次变更只写一次） */
let persistTimer: ReturnType<typeof setTimeout> | null = null
function schedulePersist(getState: () => AppState) {
  if (persistTimer) clearTimeout(persistTimer)
  persistTimer = setTimeout(async () => {
    persistTimer = null
    const { assets } = getState()
    const allData: Record<string, PersistedReview> = {}
    for (const a of assets) {
      // Only persist assets that have been touched (not default pending)
      if (a.status !== 'pending' || a.notes || a.tags.length > 0 || a.aiSummary) {
        allData[a.id] = {
          status: a.status,
          notes: a.notes,
          tags: a.tags,
          aiSummary: a.aiSummary,
          aiSuggestedName: a.aiSuggestedName || '',
          aiSuggestedTags: a.aiSuggestedTags,
          reviewedAt: a.reviewedAt || null,
        }
      }
    }
    try {
      const { writeAllReviews } = await import('../services/persistence')
      await writeAllReviews(allData)
    } catch (e) {
      console.error('持久化失败:', e)
    }
  }, 500)
}

export const useStore = create<AppState>((set, get) => ({
  assets: [],
  filteredAssets: [],
  selectedAssetId: null,
  compareList: [],
  filter: { search: '', status: 'all', category: 'all', type: 'all' },
  viewMode: 'grid',
  aiLoading: false,
  initialized: false,

  loadAssets: (assets) => {
    set({ assets, filteredAssets: applyFilter(assets, get().filter) })
  },

  mergePersistedData: async () => {
    const allData = await loadAllReviews()
    if (Object.keys(allData).length === 0) {
      set({ initialized: true })
      return
    }
    const assets = get().assets.map(a => {
      const p = allData[a.id]
      if (!p) return a
      return { ...a, ...p }
    })
    set({ assets, filteredAssets: applyFilter(assets, get().filter), initialized: true })
  },

  setSelectedAsset: (id) => {
    set({ selectedAssetId: id, viewMode: id ? 'detail' : 'grid' })
  },

  toggleCompare: (id) => {
    const { compareList } = get()
    if (compareList.includes(id)) {
      set({ compareList: compareList.filter(x => x !== id) })
    } else if (compareList.length < 2) {
      set({ compareList: [...compareList, id] })
    }
  },

  clearCompare: () => set({ compareList: [] }),

  setFilter: (partial) => {
    const filter = { ...get().filter, ...partial }
    set({ filter, filteredAssets: applyFilter(get().assets, filter) })
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  updateStatus: (id, status) => {
    const assets = get().assets.map(a =>
      a.id === id ? { ...a, status, reviewedAt: new Date().toISOString() } : a,
    )
    set({ assets, filteredAssets: applyFilter(assets, get().filter) })
    schedulePersist(get)
  },

  updateNotes: (id, notes) => {
    const assets = get().assets.map(a => a.id === id ? { ...a, notes } : a)
    set({ assets, filteredAssets: applyFilter(assets, get().filter) })
    schedulePersist(get)
  },

  updateTags: (id, tags) => {
    const assets = get().assets.map(a => a.id === id ? { ...a, tags } : a)
    set({ assets, filteredAssets: applyFilter(assets, get().filter) })
    schedulePersist(get)
  },

  setAISummary: (id, summary) => {
    const assets = get().assets.map(a => a.id === id ? { ...a, aiSummary: summary } : a)
    set({ assets })
    schedulePersist(get)
  },

  setAISuggestedName: (id, name) => {
    const assets = get().assets.map(a => a.id === id ? { ...a, aiSuggestedName: name } : a)
    set({ assets })
  },

  setAISuggestedTags: (id, tags) => {
    const assets = get().assets.map(a => a.id === id ? { ...a, aiSuggestedTags: tags } : a)
    set({ assets })
    schedulePersist(get)
  },

  submitReview: (id) => {
    const assets = get().assets.map(a =>
      a.id === id
        ? { ...a, reviewedAt: new Date().toISOString(), status: a.status as AssetStatus }
        : a,
    )
    set({ assets, filteredAssets: applyFilter(assets, get().filter) })
    schedulePersist(get)
  },

  setAiLoading: (loading) => set({ aiLoading: loading }),
}))
