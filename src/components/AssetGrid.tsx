import { useStore } from '../stores/useStore'
import AssetCard from './AssetCard'
import { Empty } from 'antd'

export default function AssetGrid() {
  const filteredAssets = useStore(s => s.filteredAssets)

  if (filteredAssets.length === 0) {
    return <Empty description="没有匹配的素材，试试调整筛选条件" style={{ marginTop: 80 }} />
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 16,
      }}
    >
      {filteredAssets.map(asset => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  )
}
