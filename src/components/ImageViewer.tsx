import { Image } from 'antd'

interface Props {
  src: string
  alt?: string
  style?: React.CSSProperties
}

export default function ImageViewer({ src, alt, style }: Props) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f0f0',
        overflow: 'hidden',
        ...style,
      }}
    >
      <Image
        src={src}
        alt={alt || ''}
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        preview={{ mask: '点击查看大图' }}
      />
    </div>
  )
}
