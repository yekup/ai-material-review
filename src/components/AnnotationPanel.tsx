import { Input, Tag, Space, Button, Divider, Typography, Alert } from 'antd'
import { PlusOutlined, BulbOutlined, LoadingOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useStore } from '../stores/useStore'
import { mockAIAnalyze } from '../services/aiMock'
import type { Asset } from '../types'
import StatusBadge from './StatusBadge'

const { TextArea } = Input
const { Text } = Typography

interface Props {
  asset: Asset
}

export default function AnnotationPanel({ asset }: Props) {
  const updateNotes = useStore(s => s.updateNotes)
  const updateTags = useStore(s => s.updateTags)
  const updateStatus = useStore(s => s.updateStatus)
  const setAISummary = useStore(s => s.setAISummary)
  const setAISuggestedTags = useStore(s => s.setAISuggestedTags)
  const [newTag, setNewTag] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const handleAddTag = () => {
    const tag = newTag.trim()
    if (tag && !asset.tags.includes(tag)) {
      updateTags(asset.id, [...asset.tags, tag])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    updateTags(asset.id, asset.tags.filter(t => t !== tag))
  }

  const handleAIAnalyze = async () => {
    setAiLoading(true)
    try {
      const result = await mockAIAnalyze(
        asset.name, asset.category, asset.type, asset.format, asset.tags,
      )
      setAISummary(asset.id, result.summary)
      setAISuggestedTags(asset.id, result.suggestedTags)
    } finally {
      setAiLoading(false)
    }
  }

  useEffect(() => {
    setNewTag('')
  }, [asset.id])

  return (
    <div style={{ padding: '0 4px' }}>
      {/* Status */}
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ display: 'block', marginBottom: 6 }}>评审状态</Text>
        <Space>
          {(['pending', 'approved', 'rejected'] as const).map(s => (
            <Button
              key={s}
              size="small"
              type={asset.status === s ? 'primary' : 'default'}
              onClick={() => updateStatus(asset.id, s)}
            >
              {s === 'pending' ? '待评审' : s === 'approved' ? '已通过' : '已拒绝'}
            </Button>
          ))}
        </Space>
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* AI Section */}
      <div style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 8 }}>
          <Text strong>AI 辅助</Text>
          <Button
            size="small"
            icon={aiLoading ? <LoadingOutlined /> : <BulbOutlined />}
            onClick={handleAIAnalyze}
            loading={aiLoading}
          >
            AI 分析
          </Button>
        </Space>
        {asset.aiSummary && (
          <Alert
            type="info"
            message="AI 摘要"
            description={asset.aiSummary}
            style={{ marginBottom: 8, fontSize: 13 }}
            showIcon
          />
        )}
        {asset.aiSuggestedTags.length > 0 && (
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>AI 推荐标签：</Text>
            <Space size={[4, 4]} wrap style={{ marginTop: 4 }}>
              {asset.aiSuggestedTags.map(tag => (
                <Tag
                  key={tag}
                  style={{ cursor: 'pointer', margin: 0 }}
                  onClick={() => {
                    if (!asset.tags.includes(tag)) {
                      updateTags(asset.id, [...asset.tags, tag])
                    }
                  }}
                >
                  + {tag}
                </Tag>
              ))}
            </Space>
          </div>
        )}
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* Tags */}
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ display: 'block', marginBottom: 6 }}>标签</Text>
        <Space size={[4, 4]} wrap style={{ marginBottom: 8 }}>
          {asset.tags.map(tag => (
            <Tag key={tag} closable onClose={() => handleRemoveTag(tag)}>
              {tag}
            </Tag>
          ))}
        </Space>
        <Input
          size="small"
          placeholder="添加标签"
          value={newTag}
          onChange={e => setNewTag(e.target.value)}
          onPressEnter={handleAddTag}
          suffix={<PlusOutlined style={{ color: '#999' }} />}
          style={{ width: 140 }}
        />
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* Notes */}
      <div>
        <Text strong style={{ display: 'block', marginBottom: 6 }}>评审备注</Text>
        <TextArea
          rows={4}
          value={asset.notes}
          onChange={e => updateNotes(asset.id, e.target.value)}
          placeholder="输入评审意见、待修改项等..."
        />
      </div>
    </div>
  )
}
