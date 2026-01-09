export type EmotionType = 
  | 'Joyful' 
  | 'Grateful' 
  | 'Proud' 
  | 'Peaceful' 
  | 'Reflective' 
  | 'Intentional' // ✅ 新增：规划/目标场景
  | 'Inspired'    // ✅ 新增：学习/启发场景
  | 'Down' 
  | 'Anxious' 
  | 'Venting' 
  | 'Drained';

export interface EmotionConfig {
  labelEn: string;
  labelZh: string;
  color: string;
  darkText: boolean;
}

// 情绪配色表 (Based on your Design) - 🎨 Balanced Vibrant Colors
export const EMOTION_MAP: Record<EmotionType, EmotionConfig> = {
  // Positives - 温和提升饱和度,保持柔和
  Joyful:     { labelEn: 'Joyful',     labelZh: '喜悦', color: '#FEF7A5', darkText: true }, // 温暖金黄
  Grateful:   { labelEn: 'Grateful',   labelZh: '感恩', color: '#FFD6F3', darkText: true }, // 柔和粉色
  Proud:      { labelEn: 'Proud',      labelZh: '自豪', color: '#FFCCB3', darkText: true }, // 柔和橙色
  
  // Neutrals/Constructive - 清晰但不刺眼
  Peaceful:    { labelEn: 'Peaceful',    labelZh: '平静', color: '#C8F2E3', darkText: true }, // 柔和绿色
  Reflective:  { labelEn: 'Reflective',  labelZh: '感悟', color: '#FFE4B3', darkText: true }, // 柔和橙黄
  Intentional: { labelEn: 'Intentional', labelZh: '笃定', color: '#D1EFFC', darkText: true }, // 柔和蓝色
  Inspired:    { labelEn: 'Inspired',    labelZh: '启迪', color: '#E8F5B3', darkText: true }, // 柔和黄绿
  
  // Negatives / Release - 保持柔和表现力
  Down:       { labelEn: 'Down',       labelZh: '低落', color: '#D1E5FF', darkText: true }, // 柔和蓝色
  Anxious:    { labelEn: 'Anxious',    labelZh: '焦虑', color: '#E8DDFF', darkText: true }, // 柔和紫色
  Venting:    { labelEn: 'Venting',    labelZh: '宣泄', color: '#FFCCCC', darkText: true }, // 柔和红色
  Drained:    { labelEn: 'Drained',    labelZh: '耗竭', color: '#D1E5FF', darkText: true }, // 与Down一致的柔和蓝色
};

// 默认兜底配置
export const DEFAULT_EMOTION: EmotionConfig = EMOTION_MAP.Reflective;

export interface EmotionData {
  emotion: string;
  confidence: number;
  rationale?: string;
}
