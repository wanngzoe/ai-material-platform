// Mock data types
export interface Material {
  id: string;
  name: string;
  duration: string;
  uploadTime: string;
  thumbnail: string;
  status?: string;
  episode?: string;
}

// 生成模式类型
export type GenerationMode = "video" | "text" | "narration" | "creative";

// 前贴生成任务配置
export interface GenerationTaskConfig {
  id: string;
  name: string;
  generationMode: GenerationMode;         // 生成模式
  referenceVideo: Material | null;        // 参考视频
  textPrompt?: string;                     // 文字生成提示词（单条输入）
  textDescriptions?: string[];              // 文字生成描述列表（多条）
  derivedCount?: number;                   // 衍生数量 (1-10)
  // 模式三：仅生成旁白
  originalNarration?: string;              // 原文案
  // 模式四：创意描述
  creativeType?: string;                   // 创意类型
  creativeDescriptions?: string[];         // 创意描述列表
  model: "seedance_2.0" | "wan_2.6";      // 模型
  aspectRatio: "16:9" | "9:16" | "1:1";   // 画面比例
  resolution: "720p" | "1080p" | "2k";    // 分辨率
  generationCount: number;                 // 生成数量 (1-10)
  params: {
    character: string;      // 角色
    scene: string;         // 场景
    style: string;         // 画风
    atmosphere: string;    // 氛围
    others: string;        // 其他
  };
}

// 视频生成状态
export type VideoGenerationStatus = "pending" | "generating" | "completed" | "failed";

// 单个生成结果
export interface GenerationResult {
  id: string;
  name: string;            // 名称，如"结果1"、"结果1_副本1"
  status: VideoGenerationStatus;
  prompt: string;          // 提示词
  videoUrl?: string;       // 生成后的视频URL
  narrationText?: string;  // 旁白文案
  voice?: string;          // 音色
  emotion?: string;        // 情绪
  progress?: number;       // 生成进度 0-100
  referenceVideo?: Material; // 参考视频（任务创建时选择）
}

// 任务状态
export type TaskStatus = "draft" | "generating" | "completed" | "failed";

// 前贴生成任务
export interface GenerationTask {
  id: string;
  name: string;
  config: GenerationTaskConfig;
  results: GenerationResult[];
  status: TaskStatus;
  createTime: string;
  updateTime: string;
}

// 通用任务（素材拼接等）
export interface Task {
  id: string;
  name: string;
  type: string;
  status: "已完成" | "处理中" | "排队中" | "失败";
  createTime: string;
  endTime: string;
  // 生成模式
  generationMode?: GenerationMode;
  // 参考视频ID
  referenceVideo?: string;
  // 文字生成的提示词
  textPrompt?: string;
  // 任务缩略图
  thumbnail?: string;
}

export interface MaterialsData {
  前贴: Material[];
  投放: Material[];
  原剧: Material[];
}

export interface TasksData {
  前贴生成: Task[];
  素材拼接: Task[];
}
