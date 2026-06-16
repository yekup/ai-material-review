import { Tag } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import type { AssetStatus } from '../types'

const STATUS_MAP: Record<AssetStatus, { color: string; label: string; icon: React.ReactNode }> = {
  approved: { color: 'success', label: '已通过', icon: <CheckCircleOutlined /> },
  rejected: { color: 'error', label: '已拒绝', icon: <CloseCircleOutlined /> },
  pending: { color: 'default', label: '待评审', icon: <ClockCircleOutlined /> },
}

export default function StatusBadge({ status }: { status: AssetStatus }) {
  const s = STATUS_MAP[status]
  return <Tag color={s.color} icon={s.icon}>{s.label}</Tag>
}
