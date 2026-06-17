import { useEffect } from 'react'
import { Layout, Space, Typography, Spin, Statistic, Row, Col } from 'antd'
import { BoxPlotOutlined, LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useStore } from './stores/useStore'
import Toolbar from './components/Toolbar'
import AssetGrid from './components/AssetGrid'
import AssetListView from './components/AssetListView'
import DetailView from './components/DetailView'
import CompareView from './components/CompareView'
import type { CasesData } from './types'

const { Header, Content } = Layout
const { Title, Text } = Typography
const { Countdown } = Statistic

function App() {
  const viewMode = useStore(s => s.viewMode)
  const loadAssets = useStore(s => s.loadAssets)
  const mergePersistedData = useStore(s => s.mergePersistedData)
  const assets = useStore(s => s.assets)
  const initialized = useStore(s => s.initialized)
  const selectedAssetId = useStore(s => s.selectedAssetId)
  const compareList = useStore(s => s.compareList)

  useEffect(() => {
    fetch('/sample-assets/cases.json')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then((data: CasesData) => {
        loadAssets(data.assets)
        // After loading defaults, merge persisted data
        return mergePersistedData()
      })
      .catch(err => console.error('加载素材失败:', err))
  }, [])

  useEffect(() => {
    if (compareList.length === 2) {
      useStore.getState().setViewMode('compare')
    }
  }, [compareList])

  const pendingCount = assets.filter(a => a.status === 'pending').length
  const approvedCount = assets.filter(a => a.status === 'approved').length
  const rejectedCount = assets.filter(a => a.status === 'rejected').length

  if (!initialized) {
    return (
      <div style={{
        height: '100vh', display: 'flex', justifyContent: 'center',
        alignItems: 'center', flexDirection: 'column', gap: 16,
      }}>
        <Spin indicator={<LoadingOutlined spin />} size="large" />
        <Text type="secondary">正在加载素材库...</Text>
      </div>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <Header style={{
        background: '#001529',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 56,
      }}>
        <Space>
          <BoxPlotOutlined style={{ fontSize: 22, color: '#fff' }} />
          <Title level={4} style={{ color: '#fff', margin: 0, fontSize: 16 }}>素材评审工作台</Title>
        </Space>
        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
          {assets.length} 个素材 · {pendingCount} 个待评审
        </Text>
      </Header>

      {/* Stats bar */}
      {viewMode === 'grid' && (
        <div style={{
          padding: '12px 32px', background: '#fafafa',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <Row gutter={24}>
            <Col span={6}>
              <Statistic
                title="待评审"
                value={pendingCount}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14', fontSize: 20 }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="已通过"
                value={approvedCount}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a', fontSize: 20 }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="已拒绝"
                value={rejectedCount}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="评审完成率"
                value={assets.length ? Math.round((approvedCount + rejectedCount) / assets.length * 100) : 0}
                suffix="%"
                valueStyle={{ fontSize: 20 }}
              />
            </Col>
          </Row>
        </div>
      )}

      <Content style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        {viewMode === 'grid' && (
          <>
            <Toolbar />
            <AssetGrid />
          </>
        )}
        {viewMode === 'detail' && selectedAssetId && <DetailView />}
        {viewMode === 'detail' && !selectedAssetId && (
          <>
            <Toolbar />
            <AssetListView />
          </>
        )}
        {viewMode === 'compare' && <CompareView />}
      </Content>
    </Layout>
  )
}

export default App
