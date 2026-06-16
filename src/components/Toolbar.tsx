import { Input, Select, Segmented, message } from 'antd'
import { SearchOutlined, AppstoreOutlined, BarsOutlined, SwapOutlined } from '@ant-design/icons'
import { useStore } from '../stores/useStore'

export default function Toolbar() {
  const filter = useStore(s => s.filter)
  const setFilter = useStore(s => s.setFilter)
  const viewMode = useStore(s => s.viewMode)
  const setViewMode = useStore(s => s.setViewMode)
  const assets = useStore(s => s.assets)

  const categories = [...new Set(assets.map(a => a.category))]

  const handleViewModeChange = (v: string | number) => {
    const mode = v as 'grid' | 'detail' | 'compare'
    const state = useStore.getState()

    if (mode === 'detail' && !state.selectedAssetId) {
      message.info('请先在网格中点击一个素材卡片查看详情')
      return
    }

    if (mode === 'compare' && state.compareList.length === 0) {
      message.warning('请先在网格中勾选要对比的素材（点击复选框）')
      return
    }

    setViewMode(mode)
  }

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
      <Input
        prefix={<SearchOutlined />}
        placeholder="搜索素材名称、标签、描述..."
        value={filter.search}
        onChange={e => setFilter({ search: e.target.value })}
        style={{ width: 260 }}
        allowClear
      />
      <Select
        value={filter.status}
        onChange={v => setFilter({ status: v })}
        style={{ width: 120 }}
        options={[
          { value: 'all', label: '全部状态' },
          { value: 'pending', label: '待评审' },
          { value: 'approved', label: '已通过' },
          { value: 'rejected', label: '已拒绝' },
        ]}
      />
      <Select
        value={filter.category}
        onChange={v => setFilter({ category: v })}
        style={{ width: 130 }}
        options={[
          { value: 'all', label: '全部分类' },
          ...categories.map(c => ({ value: c, label: c })),
        ]}
      />
      <Select
        value={filter.type}
        onChange={v => setFilter({ type: v })}
        style={{ width: 120 }}
        options={[
          { value: 'all', label: '全部类型' },
          { value: 'image', label: '图片' },
          { value: 'model3d', label: '3D 模型' },
        ]}
      />
      <div style={{ flex: 1 }} />
      <Segmented
        value={viewMode}
        onChange={handleViewModeChange}
        options={[
          { value: 'grid', icon: <AppstoreOutlined />, label: '网格' },
          { value: 'detail', icon: <BarsOutlined />, label: '详情' },
          { value: 'compare', icon: <SwapOutlined />, label: '对比' },
        ]}
      />
    </div>
  )
}
