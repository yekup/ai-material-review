import { create } from 'zustand'
import type { Asset, AssetStatus, FilterState, AssetType } from '../types'

interface AppState {
  // data
  assets: Asset[]
  filteredAssets: Asset[]

  // selection
  selectedAssetId: string | null
  compareList: string[] // max 2 ids for comparison

  // filter
  filter: FilterState

  // view
  viewMode: 'grid' | 'detail' | 'compare'

  // ai mock loading
  aiLoading: boolean

  // actions
  loadAssets: (assets: Asset[]) => void
  setSelectedAsset: (id: string | null) => void
  toggleCompare: (id: string) => void
  clearCompare: () => void
  setFilter: (partial: Partial<FilterState>) => void
  setViewMode: (mode: 'grid' | 'detail' | 'compare') => void
  updateStatus: (id: string, status: AssetStatus) => void
  updateNotes: (id: string, notes: string) => void
  updateTags: (id: string, tags: string[]) => void
  setAISummary: (id: string, summary: string) => void
  setAISuggestedTags: (id: string, tags: string[]) => void
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

export const useStore = create<AppState>((set, get) => ({
  assets: [],
  filteredAssets: [],
  selectedAssetId: null,
  compareList: [],
  filter: { search: '', status: 'all', category: 'all', type: 'all' },
  viewMode: 'grid',
  aiLoading: false,

  loadAssets: (assets) => {
    set({ assets, filteredAssets: applyFilter(assets, get().filter) })
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
    const assets = get().assets.map(a => a.id === id ? { ...a, status } : a)
    set({ assets, filteredAssets: applyFilter(assets, get().filter) })
  },

  updateNotes: (id, notes) => {
    const assets = get().assets.map(a => a.id === id ? { ...a, notes } : a)
    set({ assets, filteredAssets: applyFilter(assets, get().filter) })
  },

  updateTags: (id, tags) => {
    const assets = get().assets.map(a => a.id === id ? { ...a, tags } : a)
    set({ assets, filteredAssets: applyFilter(assets, get().filter) })
  },

  setAISummary: (id, summary) => {
    const assets = get().assets.map(a => a.id === id ? { ...a, aiSummary: summary } : a)
    set({ assets })
  },

  setAISuggestedTags: (id, tags) => {
    const assets = get().assets.map(a => a.id === id ? { ...a, aiSuggestedTags: tags } : a)
    set({ assets })
  },

  setAiLoading: (loading) => set({ aiLoading: loading }),
}))
