import { Descriptions, Space, Tag, Typography, Button, Divider } from 'antd'
import { ArrowLeftOutlined, SwapOutlined } from '@ant-design/icons'
import { useStore } from '../stores/useStore'
import ImageViewer from './ImageViewer'
import ModelViewer from './ModelViewer'
import AnnotationPanel from './AnnotationPanel'
import StatusBadge from './StatusBadge'
import type { Asset } from '../types'

const { Title } = Typography

function getAssetFileUrl(asset: Asset): string {
  return `/sample-assets/${asset.file}`
}

export default function DetailView() {
  const assets = useStore(s => s.assets)
  const selectedAssetId = useStore(s => s.selectedAssetId)
  const setSelectedAsset = useStore(s => s.setSelectedAsset)
  const toggleCompare = useStore(s => s.toggleCompare)
  const compareList = useStore(s => s.compareList)

  const asset = assets.find(a => a.id === selectedAssetId)
  if (!asset) return null

  const fileUrl = getAssetFileUrl(asset)

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => setSelectedAsset(null)}>
          返回列表
        </Button>
        <Button
          icon={<SwapOutlined />}
          onClick={() => toggleCompare(asset.id)}
          type={compareList.includes(asset.id) ? 'primary' : 'default'}
        >
          {compareList.includes(asset.id) ? '已加入对比' : '加入对比'}
        </Button>
      </Space>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Viewer */}
        <div style={{ flex: '1 1 480px', minWidth: 320 }}>
          {asset.type === 'image' ? (
            <ImageViewer src={fileUrl} alt={asset.name} />
          ) : (
            <ModelViewer file={fileUrl} format={asset.format} />
          )}
        </div>

        {/* Info + Annotation */}
        <div style={{ flex: '1 1 320px', minWidth: 280 }}>
          <Title level={4} style={{ marginTop: 0 }}>{asset.name}</Title>
          <Space style={{ marginBottom: 12 }}>
            <StatusBadge status={asset.status} />
            <Tag>{asset.category}</Tag>
            <Tag>{asset.format.toUpperCase()}</Tag>
          </Space>

          <Descriptions size="small" column={1} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="类型">{asset.type === 'image' ? '图片' : '3D 模型'}</Descriptions.Item>
            <Descriptions.Item label="优先级">{asset.priority} 级</Descriptions.Item>
            <Descriptions.Item label="添加时间">{new Date(asset.createdAt).toLocaleDateString('zh-CN')}</Descriptions.Item>
            <Descriptions.Item label="描述">{asset.description}</Descriptions.Item>
          </Descriptions>

          <Divider style={{ margin: '12px 0' }} />
          <Tag>共 {asset.tags.length} 个标签</Tag>
          <Space size={[4, 4]} wrap style={{ marginBottom: 16 }}>
            {asset.tags.map(t => <Tag key={t}>{t}</Tag>)}
          </Space>

          <Divider style={{ margin: '16px 0' }} />
          <AnnotationPanel asset={asset} />
        </div>
      </div>
    </div>
  )
}
