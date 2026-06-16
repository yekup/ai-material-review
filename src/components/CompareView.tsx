import { Button, Space, Typography, Empty } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useStore } from '../stores/useStore'
import ImageViewer from './ImageViewer'
import ModelViewer from './ModelViewer'
import type { Asset } from '../types'

const { Title, Text } = Typography

function getFileUrl(asset: Asset): string {
  return `/sample-assets/${asset.file}`
}

function AssetCompareCard({ asset }: { asset: Asset }) {
  const fileUrl = getFileUrl(asset)

  return (
    <div style={{ flex: 1, minWidth: 300 }}>
      <Title level={5} style={{ textAlign: 'center' }}>{asset.name}</Title>
      <div style={{ height: 400, marginBottom: 12 }}>
        {asset.type === 'image' ? (
          <ImageViewer src={fileUrl} alt={asset.name} style={{ height: '100%' }} />
        ) : (
          <ModelViewer file={fileUrl} format={asset.format} style={{ height: '100%' }} />
        )}
      </div>
      <div style={{ padding: '0 8px' }}>
        <Text type="secondary">{asset.description}</Text>
        <div style={{ marginTop: 8 }}>
          <Text strong>状态：</Text>
          <Text>
            {asset.status === 'approved' ? '✅ 已通过' :
             asset.status === 'rejected' ? '❌ 已拒绝' : '⏳ 待评审'}
          </Text>
        </div>
        <div style={{ marginTop: 4 }}>
          <Text strong>标签：</Text>
          <Text>{asset.tags.join(', ') || '无'}</Text>
        </div>
        {asset.notes && (
          <div style={{ marginTop: 4 }}>
            <Text strong>备注：</Text>
            <Text>{asset.notes}</Text>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CompareView() {
  const assets = useStore(s => s.assets)
  const compareList = useStore(s => s.compareList)
  const clearCompare = useStore(s => s.clearCompare)
  const setViewMode = useStore(s => s.setViewMode)

  const compareAssets = compareList.map(id => assets.find(a => a.id === id)).filter(Boolean) as Asset[]

  const handleBack = () => {
    clearCompare()
    setViewMode('grid')
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          返回列表
        </Button>
        {compareAssets.length > 0 && (
          <Button onClick={clearCompare}>清空对比列表</Button>
        )}
      </Space>

      {compareAssets.length === 0 ? (
        <div style={{ marginTop: 60 }}>
          <Empty description="暂无待对比素材">
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              在网格视图中勾选素材卡片右下角的复选框加入对比（最多 2 个）
            </Text>
            <Button type="primary" icon={<ArrowLeftOutlined />} onClick={handleBack}>
              返回网格列表
            </Button>
          </Empty>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {compareAssets.map(asset => (
            <AssetCompareCard key={asset.id} asset={asset} />
          ))}
          {compareAssets.length === 1 && (
            <div style={{
              flex: 1, minWidth: 300, display: 'flex', alignItems: 'center',
              justifyContent: 'center', border: '2px dashed #d9d9d9',
              borderRadius: 8, minHeight: 400,
            }}>
              <Empty description="再选一个素材进行对比" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
