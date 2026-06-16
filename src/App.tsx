import { useEffect } from 'react'
import { Layout, Space, Typography, Spin } from 'antd'
import { BoxPlotOutlined, LoadingOutlined } from '@ant-design/icons'
import { useStore } from './stores/useStore'
import Toolbar from './components/Toolbar'
import AssetGrid from './components/AssetGrid'
import DetailView from './components/DetailView'
import CompareView from './components/CompareView'
import type { CasesData } from './types'

const { Header, Content } = Layout
const { Title, Text } = Typography

function App() {
  const viewMode = useStore(s => s.viewMode)
  const loadAssets = useStore(s => s.loadAssets)
  const assets = useStore(s => s.assets)
  const selectedAssetId = useStore(s => s.selectedAssetId)
  const compareList = useStore(s => s.compareList)

  useEffect(() => {
    fetch('/sample-assets/cases.json')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then((data: CasesData) => loadAssets(data.assets))
      .catch(err => console.error('加载 cases.json 失败:', err))
  }, [])

  useEffect(() => {
    if (compareList.length === 2) {
      useStore.getState().setViewMode('compare')
    }
  }, [compareList])

  // Still loading
  if (assets.length === 0) {
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
      }}>
        <Space>
          <BoxPlotOutlined style={{ fontSize: 24, color: '#fff' }} />
          <Title level={4} style={{ color: '#fff', margin: 0 }}>素材评审工作台</Title>
        </Space>
        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
          {assets.length} 个素材 · {assets.filter(a => a.status === 'pending').length} 个待评审
        </Text>
      </Header>

      <Content style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        {viewMode === 'grid' && (
          <>
            <Toolbar />
            <AssetGrid />
          </>
        )}
        {viewMode === 'detail' && selectedAssetId && <DetailView />}
        {viewMode === 'compare' && <CompareView />}
      </Content>
    </Layout>
  )
}

export default App
