# AI 图片与 3D 素材筛选评审工作台 Lite

基于 React + Three.js + TypeScript 的轻量素材评审工具，支持图片和 3D 模型（GLB/STL）的浏览、筛选、标注和对比。

## 快速启动

```bash
npm install
npm run dev
# → http://localhost:3000
```

## 目标用户与场景

**目标用户**：游戏/影视/医学可视化团队的素材审核人员

**核心场景**：
- 团队对候选素材进行初筛、标记通过/拒绝
- 两名评审人对同一批素材进行独立标注后对比
- 医学 CT 重建模型（STL）的可视化检查
- 用 AI 快速生成摘要和标签建议辅助评审

## 核心功能

| 功能 | 说明 |
|---|---|
| **素材浏览** | 响应式网格列表，图片显示缩略图，3D 显示分类图标 |
| **多维筛选** | 名称/标签搜索 + 状态(pending/approved/rejected) + 分类 + 类型(图片/3D) |
| **详情查看** | 点击卡片进入详情页，大图/3D 预览 + 完整信息 |
| **3D 模型查看** | 旋转/缩放/平移，**GLB(PBR材质)**和**STL(医学模型)**双格式支持 |
| **自动缩放** | 不同尺寸模型统一适配视口，不会太大或太小 |
| **状态标记** | 三态切换，网格卡片和详情页同步更新 |
| **标签管理** | 增删标签，按标签筛选过滤 |
| **左右对比** | 勾选 2 个素材进入对比视图，图片或 3D 并列展示 |
| **评审备注** | 每条素材可记录评审意见，刷新不丢失 |
| **AI 辅助** | 一键生成摘要 + 推荐标签（Mock 实现，可替换为真实 API） |
| **错误容错** | 3D 加载失败显示错误信息 + 重试按钮，不白屏 |

## 素材库

项目内置 24 个素材，由 `public/sample-assets/cases.json` 驱动：

| 类型 | 数量 | 格式 | 来源 |
|---|---|---|---|
| 图片 | 10 张 | JPG | picsum.photos (Unsplash) |
| 3D 模型 | 10 个 | GLB | Khronos glTF-Sample-Assets |
| 医学模型 | 4 个 | STL | CT 重建解剖数据 |

## 技术栈

| 技术 | 用途 |
|---|---|
| React 18 + TypeScript | 框架、类型安全 |
| Vite 6 | 构建工具、HMR |
| Three.js + @react-three/fiber | 3D 渲染 |
| @react-three/drei | OrbitControls、useGLTF |
| three-stdlib | STLLoader（加载 STL 格式） |
| Zustand | 全局状态管理 |
| Ant Design 5 | UI 组件库 |
| idb-keyval | IndexedDB 持久化（标注存储预留） |

## 项目结构

```
ai-material-review/
├── public/sample-assets/
│   ├── images/       ← 10 张图片
│   ├── models/       ← 10 个 GLB 模型
│   ├── stl/          ← 4 个 STL 医学模型
│   └── cases.json    ← 素材元数据
├── src/
│   ├── components/
│   │   ├── AssetGrid.tsx       ← 素材网格列表
│   │   ├── AssetCard.tsx       ← 单素材卡片（缩略图/状态）
│   │   ├── ImageViewer.tsx     ← 图片查看器
│   │   ├── ModelViewer.tsx     ← 3D 查看器（GLB + STL 双加载器）
│   │   ├── CompareView.tsx     ← 左右对比视图
│   │   ├── DetailView.tsx      ← 详情+标注+AI 面板
│   │   ├── AnnotationPanel.tsx ← 评审面板
│   │   ├── StatusBadge.tsx     ← 状态徽标
│   │   └── Toolbar.tsx         ← 搜索+筛选+视图切换
│   ├── stores/useStore.ts      ← Zustand 状态管理
│   ├── services/aiMock.ts      ← AI Mock 服务
│   ├── types/index.ts          ← TypeScript 定义
│   ├── App.tsx                 ← 主布局
│   └── main.tsx                ← 入口
├── package.json
├── vite.config.ts
└── tsconfig.json
```



## License

MIT
