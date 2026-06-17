/**
 * 真实 AI API 调用（DeepSeek）
 * 在没有 API Key 时自动降级为 Mock
 */
import type { AISuggestion } from '../types'

const API_KEY = (import.meta as any).env?.VITE_DEEPSEEK_API_KEY || ''
const API_URL = 'https://api.deepseek.com/v1/chat/completions'

function isConfigured(): boolean {
  return !!API_KEY && API_KEY.length > 10
}

async function callDeepSeek(system: string, user: string): Promise<string> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text.slice(0, 100)}`)
  }

  const data = await res.json()
  return data.choices[0].message.content
}

/* ========================== Mock Fallback ========================== */

const TAG_POOL = [
  '高精度', '低多边形', 'PBR材质', '写实', '卡通', '科幻',
  '复古', '极简', '精细', '粗糙', '有动画', '无动画',
  '有纹理', '无纹理', '彩色', '黑白', '明亮', '暗黑',
  '温暖', '冷色', '医学精度', '解剖结构', '体素重建', 'CT扫描',
]

function randomSubset(arr: string[], min: number, max: number): string[] {
  const count = min + Math.floor(Math.random() * (max - min + 1))
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, arr.length))
}

function mockTags(existing: string[]): string[] {
  return randomSubset(TAG_POOL.filter(t => !existing.includes(t)), 2, 5)
}

function mockSummary(name: string, category: string, type: string, format: string): string {
  const mood = ['明亮柔和', '色调偏暗', '色彩丰富', '色调统一', '对比强烈']
  const usage = ['设计参考', '素材库归档', '项目展示', '教学演示', '视觉参考']
  const detail = ['细节丰富', '结构清晰', '拓扑规整', '纹理完整']
  const quality = ['整体质量较高', '可用状态', '需要进一步优化']
  if (type === 'image') {
    return `这是一张${category}类素材，画面${mood[Math.floor(Math.random() * mood.length)]}，主要展示${name}，适合用于${usage[Math.floor(Math.random() * usage.length)]}场景。`
  }
  return `这是一个${format.toUpperCase()}格式的${category}3D模型，${detail[Math.floor(Math.random() * detail.length)]}，${quality[Math.floor(Math.random() * quality.length)]}`
}

function mockName(name: string): string {
  return name
}

function mockConclusion(status: string, notes: string): string {
  if (status === 'approved') return `评审通过。${notes || '素材质量符合要求，可直接入库。'}`
  if (status === 'rejected') return `评审不通过。${notes || '建议优化后重新提交。'}`
  return '待定，需要进一步确认。'
}

/* ========================== Exported APIs ========================== */

/**
 * AI 综合分析：摘要 + 命名建议 + 标签推荐
 */
export async function analyzeAsset(
  name: string,
  category: string,
  type: string,
  format: string,
  existingTags: string[],
): Promise<AISuggestion & { suggestedName: string }> {
  if (!isConfigured()) {
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400))
    return {
      summary: mockSummary(name, category, type, format),
      suggestedName: mockName(name),
      suggestedTags: mockTags(existingTags),
    }
  }

  const sysPrompt = `你是一个专业的素材评审助手。根据用户提供的素材信息，完成三项任务并以 JSON 格式返回：
1. summary：生成一段 1-2 句的中文素材描述摘要
2. suggestedName：给出一个更适合该素材的中文名称建议（4-12 字，比原名更精准）
3. suggestedTags：推荐 3-5 个中文标签（不要与已有标签重复）

返回格式：{"summary":"...","suggestedName":"...","suggestedTags":["...","..."]}
只返回 JSON，不要任何其他文字。`

  const userPrompt = `素材名称：${name}
素材分类：${category}
素材类型：${type === 'image' ? '图片' : '3D 模型'}
文件格式：${format}
已有标签：${existingTags.join(', ') || '无'}`

  try {
    const text = await callDeepSeek(sysPrompt, userPrompt)
    const result = JSON.parse(text)
    return {
      summary: result.summary || '',
      suggestedName: result.suggestedName || name,
      suggestedTags: result.suggestedTags || [],
    }
  } catch (e) {
    console.warn('AI API 调用失败，降级到 Mock:', e)
    return {
      summary: mockSummary(name, category, type, format),
      suggestedName: mockName(name),
      suggestedTags: mockTags(existingTags),
    }
  }
}

/**
 * AI 生成评审结论
 */
export async function generateConclusion(
  status: string,
  notes: string,
  name: string,
): Promise<string> {
  if (!isConfigured()) {
    await new Promise(r => setTimeout(r, 300 + Math.random() * 200))
    return mockConclusion(status, notes)
  }

  const sysPrompt = `你是一个素材评审系统的评审助理。根据素材名称、评审状态和评审备注，生成一段 1-2 句的正式评审结论。
状态说明：approved=已通过, rejected=已拒绝, pending=待评审
结论要具体、专业，直接输出结论文本，不要任何前缀。`

  const userPrompt = `素材名称：${name}
评审状态：${status === 'approved' ? '已通过' : status === 'rejected' ? '已拒绝' : '待评审'}
评审备注：${notes || '无'}`

  try {
    return await callDeepSeek(sysPrompt, userPrompt)
  } catch (e) {
    console.warn('AI API 调用失败，降级到 Mock:', e)
    return mockConclusion(status, notes)
  }
}
