import { Input, Tag, Space, Button, Divider, Typography, Alert, Descriptions, message } from 'antd'
import { PlusOutlined, BulbOutlined, LoadingOutlined, CheckOutlined, HistoryOutlined, EditOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useStore } from '../stores/useStore'
import { analyzeAsset, generateConclusion } from '../services/aiApi'
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
  const setAISuggestedName = useStore(s => s.setAISuggestedName)
  const setAISuggestedTags = useStore(s => s.setAISuggestedTags)
  const submitReview = useStore(s => s.submitReview)
  const [newTag, setNewTag] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [conclusionLoading, setConclusionLoading] = useState(false)
  const [generatedConclusion, setGeneratedConclusion] = useState<string | null>(null)

  const isReviewed = !!asset.reviewedAt

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
      const result = await analyzeAsset(
        asset.name, asset.category, asset.type, asset.format, asset.tags,
      )
      setAISummary(asset.id, result.summary)
      if (result.suggestedName && result.suggestedName !== asset.name) {
        setAISuggestedName(asset.id, result.suggestedName)
      }
      setAISuggestedTags(asset.id, result.suggestedTags)
    } finally {
      setAiLoading(false)
    }
  }

  const handleStatusChange = async (status: 'pending' | 'approved' | 'rejected') => {
    updateStatus(asset.id, status)
    setConclusionLoading(true)
    try {
      const text = await generateConclusion(status, asset.notes, asset.name)
      setGeneratedConclusion(text)
    } finally {
      setConclusionLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (asset.status === 'pending') {
      message.warning('请先选择评审状态（通过/拒绝）再提交')
      return
    }
    submitReview(asset.id)
    setConclusionLoading(true)
    try {
      const conclusion = await generateConclusion(asset.status, asset.notes, asset.name)
      setGeneratedConclusion(conclusion)
      message.success('评审结论已提交')
    } finally {
      setConclusionLoading(false)
    }
  }

  // Accept AI-suggested name as the asset's display name
  const handleAcceptName = () => {
    if (asset.aiSuggestedName) {
      updateTags(asset.id, [...asset.tags, `曾用名:${asset.name}`])
      message.success('命名建议已采纳')
    }
  }

  useEffect(() => {
    setNewTag('')
    setGeneratedConclusion(null)
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
              onClick={() => handleStatusChange(s)}
            >
              {s === 'pending' ? '⏳ 待评审' : s === 'approved' ? '✅ 已通过' : '❌ 已拒绝'}
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
            {aiLoading ? '分析中...' : 'AI 分析'}
          </Button>
        </Space>

        {/* AI 命名建议 */}
        {asset.aiSuggestedName && asset.aiSuggestedName !== asset.name && (
          <Alert
            type="info"
            message={
              <Space>
                <span><EditOutlined /> 命名建议</span>
                <Tag color="blue" style={{ fontSize: 13, padding: '2px 8px' }}>
                  {asset.aiSuggestedName}
                </Tag>
                <Button size="small" type="primary" ghost onClick={handleAcceptName}>
                  采纳
                </Button>
              </Space>
            }
            description="AI 建议的名称将作为备选标签保存"
            style={{ marginBottom: 8, fontSize: 13 }}
            showIcon
          />
        )}

        {/* AI 摘要 */}
        {asset.aiSummary && (
          <Alert
            type="info"
            message="AI 摘要"
            description={asset.aiSummary}
            style={{ marginBottom: 8, fontSize: 13 }}
            showIcon
          />
        )}

        {/* AI 推荐标签 */}
        {asset.aiSuggestedTags.length > 0 && (
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>AI 推荐标签（点击采纳）：</Text>
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

        {/* No AI result yet */}
        {!asset.aiSummary && asset.aiSuggestedTags.length === 0 && !asset.aiSuggestedName && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            点击「AI 分析」自动生成摘要、命名建议和标签推荐
          </Text>
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
          {asset.tags.length === 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}>暂无标签</Text>
          )}
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
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ display: 'block', marginBottom: 6 }}>评审备注</Text>
        <TextArea
          rows={4}
          value={asset.notes}
          onChange={e => updateNotes(asset.id, e.target.value)}
          placeholder="输入评审意见、待修改项、引用依据等..."
        />
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* Review Conclusion */}
      <div style={{ marginBottom: 0 }}>
        <Space style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
          <Text strong><HistoryOutlined /> 评审结论</Text>
          <Button
            type="primary"
            size="small"
            icon={conclusionLoading ? <LoadingOutlined /> : <CheckOutlined />}
            onClick={handleSubmitReview}
            disabled={asset.status === 'pending'}
            loading={conclusionLoading}
          >
            提交结论
          </Button>
        </Space>

        {isReviewed && (
          <Descriptions size="small" column={1} style={{ marginBottom: 8 }}>
            <Descriptions.Item label="评审时间">
              {new Date(asset.reviewedAt!).toLocaleString('zh-CN')}
            </Descriptions.Item>
            <Descriptions.Item label="评审状态">
              <StatusBadge status={asset.status} />
            </Descriptions.Item>
            <Descriptions.Item label="标签数">{asset.tags.length} 个</Descriptions.Item>
          </Descriptions>
        )}

        {!isReviewed && asset.status !== 'pending' && (
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            状态已标记，点击「提交结论」确认并锁定评审记录
          </Text>
        )}

        {generatedConclusion && (
          <Alert
            type="success"
            message="评审结论"
            description={generatedConclusion}
            style={{ fontSize: 13 }}
            showIcon
          />
        )}

        {!isReviewed && asset.status === 'pending' && !generatedConclusion && (
          <Alert
            type="warning"
            message="待评审"
            description="选择评审状态 → 填写备注 → 点击「提交结论」完成评审"
            style={{ fontSize: 13 }}
            showIcon
          />
        )}
      </div>
    </div>
  )
}
