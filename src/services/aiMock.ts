import type { AISuggestion } from '../types'

const TAG_POOL = [
  '高精度', '低多边形', 'PBR材质', '写实', '卡通', '科幻',
  '复古', '极简', '精细', '粗糙', '有动画', '无动画',
  '有纹理', '无纹理', '彩色', '黑白', '明亮', '暗黑',
  '温暖', '冷色', '医学精度', '解剖结构', '体素重建', 'CT扫描',
]

const SUMMARY_TEMPLATES: Record<string, string[]> = {
  image: [
    '这是一张{category}类素材，画面{mood}，主要展示{subject}，适合用于{usage}场景。',
    '{category}风格素材，{subject}为主体，整体{mood}，可以作为{usage}的参考图。',
  ],
  model3d: [
    '这是一个{format}格式的{category}3D模型，{detail}，{quality}',
    '{category}类三维资产，{format}格式，{quality}，适用于{usage}',
  ],
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomSubset(arr: string[], min: number, max: number): string[] {
  const count = min + Math.floor(Math.random() * (max - min + 1))
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, arr.length))
}

function generateSummary(name: string, category: string, type: string, format: string): string {
  const templates = SUMMARY_TEMPLATES[type] || SUMMARY_TEMPLATES.model3d!
  const template = randomItem(templates)
  const mood = randomItem(['明亮柔和', '色调偏暗', '色彩丰富', '色调统一', '对比强烈'])
  const subject = name
  const usage = randomItem(['设计参考', '素材库归档', '项目展示', '教学演示', '视觉参考'])
  const detail = randomItem(['细节丰富', '结构清晰', '拓扑规整', '纹理完整'])
  const quality = randomItem(['整体质量较高', '可用状态', '需要进一步优化'])

  return template
    .replace('{category}', category)
    .replace('{mood}', mood)
    .replace('{subject}', subject)
    .replace('{usage}', usage)
    .replace('{format}', format.toUpperCase())
    .replace('{detail}', detail)
    .replace('{quality}', quality)
}

/** 模拟 AI 延迟 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** 模拟 AI 生成摘要 */
export async function mockGenerateSummary(
  name: string,
  category: string,
  type: string,
  format: string,
): Promise<string> {
  await delay(600 + Math.random() * 400)
  return generateSummary(name, category, type, format)
}

/** 模拟 AI 推荐标签（从池中选 2-5 个） */
export async function mockSuggestTags(existingTags: string[]): Promise<string[]> {
  await delay(300 + Math.random() * 300)
  const pool = TAG_POOL.filter(t => !existingTags.includes(t))
  return randomSubset(pool, 2, 5)
}

/** 模拟 AI 一键摘要 + 标签建议 */
export async function mockAIAnalyze(
  name: string,
  category: string,
  type: string,
  format: string,
  existingTags: string[],
): Promise<AISuggestion> {
  await delay(800 + Math.random() * 700)
  return {
    summary: generateSummary(name, category, type, format),
    suggestedTags: randomSubset(TAG_POOL.filter(t => !existingTags.includes(t)), 2, 5),
  }
}

/** 模拟 AI 评审结论生成 */
export async function mockReviewConclusion(status: string, notes: string): Promise<string> {
  await delay(400 + Math.random() * 300)
  if (status === 'approved') {
    return `评审通过。${notes || '素材质量符合要求，可直接入库。'}`
  }
  if (status === 'rejected') {
    return `评审不通过。${notes || '建议优化后重新提交。'}`
  }
  return '待定，需要进一步确认。'
}
