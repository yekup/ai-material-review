import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// antd 5 使用 CSS-in-JS，无需手动导入样式文件
// 如果需要 CSS Reset 可在此处引入

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
