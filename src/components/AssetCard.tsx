import { Card, Tag, Space, Typography, Checkbox, Tooltip } from 'antd'
import { PictureOutlined, BoxPlotOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useStore } from '../stores/useStore'
import type { Asset } from '../types'
import StatusBadge from './StatusBadge'

const { Text } = Typography

interface Props {
  asset: Asset
}

function getThumbnailUrl(asset: Asset): string {
  if (asset.type === 'image') return `/sample-assets/${asset.file}`
  return ''
}

export default function AssetCard({ asset }: Props) {
  const selectedAssetId = useStore(s => s.selectedAssetId)
  const setSelectedAsset = useStore(s => s.setSelectedAsset)
  const toggleCompare = useStore(s => s.toggleCompare)
  const compareList = useStore(s => s.compareList)
  const isSelected = selectedAssetId === asset.id
  const isComparing = compareList.includes(asset.id)
  const [imgError, setImgError] = useState(false)

  const imageCover = (
    <div style={{ height: 166, background: '#f0f0f0', overflow: 'hidden' }}>
      {imgError ? (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 28 }}>
          <PictureOutlined />
        </div>
      ) : (
        <img
          src={getThumbnailUrl(asset)}
          alt={asset.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      )}
    </div>
  )

  const modelCover = (
    <div style={{
      height: 166, width: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: 36,
    }}>
      <BoxPlotOutlined />
    </div>
  )

  return (
    <Card
      size="small"
      hoverable
      style={{
        border: isSelected ? '2px solid #1677ff' : isComparing ? '2px solid #52c41a' : '1px solid #f0f0f0',
        cursor: 'pointer',
      }}
      onClick={() => setSelectedAsset(asset.id)}
      cover={asset.type === 'image' ? imageCover : modelCover}
      actions={[
        <Tooltip title={isComparing ? '移出对比' : '加入对比'} key="compare">
          <Checkbox
            checked={isComparing}
            onClick={e => { e.stopPropagation(); toggleCompare(asset.id) }}
          />
        </Tooltip>,
      ]}
    >
      <Space direction="vertical" size={2} style={{ width: '100%' }}>
        <Text ellipsis strong style={{ fontSize: 13 }}>{asset.name}</Text>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <StatusBadge status={asset.status} />
          <Tag icon={asset.type === 'image' ? <PictureOutlined /> : <BoxPlotOutlined />} color="processing" style={{ margin: 0 }}>
            {asset.format.toUpperCase()}
          </Tag>
        </div>
        <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
          {asset.category} · {asset.tags.slice(0, 3).join(', ')}
        </Text>
      </Space>
    </Card>
  )
}
