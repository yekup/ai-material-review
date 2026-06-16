# AI 使用说明

本项目的 AI 功能采用 **Mock（模拟）** 实现，不接入真实大模型 API。

## 设计决策

面试题目明确要求「真实 AI 接入不是必须，可用 Mock 模拟」：

1. **减少运行依赖**：接入真实 API 需要面试官额外配置 API Key，增加「跑不起来」的风险
2. **逻辑可迁移**：Mock 接口签名与真实 API 对齐，换真实模型只改 `aiMock.ts` 一个文件
3. **面试可讲清楚**：能说出"这里如果接 GPT-4o / 本地 Qwen2.5 改哪个文件"

## AI 功能一览

| 功能 | 触发方式 | Mock 行为 |
|---|---|---|
| **智能摘要** | 详情页 → 点击「AI 分析」按钮 | 根据名称/分类/格式拼接模板句子，延迟 600-1000ms |
| **标签推荐** | 同上，同步返回 | 从 24 个预设标签中随机选 2-5 个，延迟 800-1500ms |
| **一键采纳** | 点击 AI 推荐标签 → 自动添加到素材标签 | 前端直接调用 updateTags |

## AI Mock 实现架构

`src/services/aiMock.ts` 包含三个导出函数：

```ts
mockAIAnalyze(name, category, type, format, existingTags)
// → { summary: string, suggestedTags: string[] }

mockGenerateSummary(name, category, type, format)
// → string

mockSuggestTags(existingTags)
// → string[]
```

每个函数都包含 `await delay()` 模拟网络延迟，返回结构化的模拟数据。

## 替换为真实 AI API

```ts
// 方案 A：替换为 ChatGPT / DeepSeek API
export async function mockGenerateSummary(name, category, type, format) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: '为素材生成中文摘要' },
        { role: 'user', content: `名称: ${name}, 分类: ${category}` },
      ],
    }),
  })
  const data = await response.json()
  return data.choices[0].message.content
}
```

```ts
// 方案 B：替换为本地模型（通过 Ollama）
export async function mockSuggestTags(existingTags) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    body: JSON.stringify({
      model: 'qwen2.5:7b',
      prompt: `为素材推荐中文标签，已有标签: ${existingTags.join(',')}`,
    }),
  })
  // ...
}
```

## Mock 的局限性

- 摘要是模板拼接，不是真实语义理解
- 标签推荐是随机抽取，与素材内容无关
- Mock 仅用于演示交互流程，实际需要辅助评审价值时应替换为真实 AI
