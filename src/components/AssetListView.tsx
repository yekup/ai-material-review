import { List, Tag, Typography, Space, Button, Input, Empty } from 'antd'
import { ArrowLeftOutlined, PictureOutlined, BoxPlotOutlined, SearchOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useStore } from '../stores/useStore'
import StatusBadge from './StatusBadge'
import type { Asset } from '../types'

const { Text } = Typography

export default function AssetListView() {
  const filteredAssets = useStore(s => s.filteredAssets)
  const setSelectedAsset = useStore(s => s.setSelectedAsset)
  const setViewMode = useStore(s => s.setViewMode)
  const [search, setSearch] = useState('')

  const list = search
    ? filteredAssets.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.tags.some(t => t.toLowerCase().includes(search.toLowerCase())),
      )
    : filteredAssets

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16, gap: 12,
      }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => setViewMode('grid')}>
            返回网格
          </Button>
          <Text strong style={{ fontSize: 16 }}>素材列表（{filteredAssets.length}）</Text>
        </Space>
        <Input
          prefix={<SearchOutlined />}
          placeholder="在当前列表中筛选..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 240 }}
          allowClear
        />
      </div>

      {list.length === 0 ? (
        <Empty description="没有匹配的素材" style={{ marginTop: 80 }} />
      ) : (
        <List
          style={{ background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0' }}
          dataSource={list}
          renderItem={(asset: Asset) => (
            <List.Item
              key={asset.id}
              onClick={() => setSelectedAsset(asset.id)}
              style={{
                cursor: 'pointer', padding: '14px 20px', transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              extra={
                <Space>
                  <StatusBadge status={asset.status} />
                  <Tag
                    icon={asset.type === 'image' ? <PictureOutlined /> : <BoxPlotOutlined />}
                    color="processing"
                    style={{ margin: 0 }}
                  >
                    {asset.format.toUpperCase()}
                  </Tag>
                </Space>
              }
            >
              <List.Item.Meta
                title={
                  <Space size={8}>
                    <Text strong style={{ fontSize: 15 }}>{asset.name}</Text>
                    <Tag style={{ fontSize: 11 }}>{asset.category}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {asset.type === 'image' ? '图片' : '3D 模型'}
                    </Text>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <Text type="secondary" style={{ fontSize: 13 }} ellipsis>
                      {asset.description}
                    </Text>
                    <Space size={[4, 4]} wrap>
                      {asset.tags.slice(0, 6).map(t => (
                        <Tag key={t} style={{ fontSize: 11, margin: 0 }}>{t}</Tag>
                      ))}
                      {asset.tags.length > 6 && (
                        <Text type="secondary" style={{ fontSize: 11 }}>+{asset.tags.length - 6}</Text>
                      )}
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  )
}
