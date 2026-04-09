"use client";

import { useReducer, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tasks, materials } from "@/lib/mockData";
import { Task, Material, GenerationMode } from "@/lib/types";
import { Loader2, Sparkles, Plus, X, ChevronRight } from "lucide-react";

const tasksData = tasks;

function StatusBadge({ status }: { status: Task["status"] }) {
  const config = {
    已完成: { bg: "bg-green-100", text: "text-green-700" },
    处理中: { bg: "bg-blue-100", text: "text-blue-700" },
    排队中: { bg: "bg-yellow-100", text: "text-yellow-700" },
    失败: { bg: "bg-red-100", text: "text-red-700" },
  };
  const { bg, text } = config[status];
  return <Badge className={`${bg} ${text} hover:${bg}`}>{status}</Badge>;
}

// ============ 状态管理重构：使用 useReducer ============

// 状态类型定义
interface FormState {
  // 基础信息
  taskName: string;
  // 生成模式
  generationMode: GenerationMode;
  // video模式
  referenceVideo: string;
  direction: "角色" | "场景" | "画风" | "氛围" | "其他";
  splitByShot: boolean;  // 分镜拆分
  // text模式
  textPrompt: string;
  // narration模式
  originalNarration: string;
  // creative模式
  requiredElements: string;
  creativeDescriptions: string[];
  creativeCount: number;
  // 通用参数
  model: "seedance_2.0" | "wan_2.6";
  aspectRatio: "16:9" | "9:16" | "1:1";
  resolution: "720p" | "1080p" | "2k";
  generationCount: number;
  // UI状态
  editingIndex: number | null;
  editValue: string;
  isGenerating: boolean;
  isGeneratingCreative: boolean;
  // 模式切换动画
  modeTransitioning: boolean;
}

// Action类型定义
type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: FormState[keyof FormState] }
  | { type: "RESET_MODE_STATE"; mode: GenerationMode }
  | { type: "SET_MODE_TRANSITIONING"; value: boolean }
  | { type: "ADD_CREATIVE_DESCRIPTION" }
  | { type: "UPDATE_CREATIVE_DESCRIPTION"; index: number; value: string }
  | { type: "DELETE_CREATIVE_DESCRIPTION"; index: number }
  | { type: "RESET_ALL" };

// 初始状态
const initialState: FormState = {
  taskName: "",
  generationMode: "video",
  referenceVideo: "",
  direction: "角色",
  splitByShot: false,
  textPrompt: "",
  originalNarration: "",
  requiredElements: "",
  creativeDescriptions: [],
  creativeCount: 10,
  model: "seedance_2.0",
  aspectRatio: "16:9",
  resolution: "720p",
  generationCount: 3,
  editingIndex: null,
  editValue: "",
  isGenerating: false,
  isGeneratingCreative: false,
  modeTransitioning: false,
};

// Reducer函数
function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "RESET_MODE_STATE":
      // 模式切换时重置相关状态
      const modeResetMap: Record<GenerationMode, Partial<FormState>> = {
        video: {
          referenceVideo: "",
          direction: "角色",
          splitByShot: false,
          textPrompt: "",
                    originalNarration: "",
          requiredElements: "",
          creativeDescriptions: [],
        },
        text: {
          referenceVideo: "",
          textPrompt: "",
          originalNarration: "",
          requiredElements: "",
          creativeDescriptions: [],
        },
        narration: {
          referenceVideo: "",
          textPrompt: "",
                    originalNarration: "",
          requiredElements: "",
          creativeDescriptions: [],
        },
        creative: {
          referenceVideo: "",
          textPrompt: "",
                    originalNarration: "",
          creativeDescriptions: [],
        },
      };
      return { ...state, ...modeResetMap[action.mode], editingIndex: null, editValue: "" };

    case "SET_MODE_TRANSITIONING":
      return { ...state, modeTransitioning: action.value };

    case "ADD_CREATIVE_DESCRIPTION":
      return {
        ...state,
        creativeDescriptions: [...state.creativeDescriptions, ""],
        editingIndex: state.creativeDescriptions.length,
        editValue: "",
      };

    case "UPDATE_CREATIVE_DESCRIPTION":
      const updatedCreative = [...state.creativeDescriptions];
      updatedCreative[action.index] = action.value;
      return { ...state, creativeDescriptions: updatedCreative, editingIndex: null, editValue: "" };

    case "DELETE_CREATIVE_DESCRIPTION":
      return {
        ...state,
        creativeDescriptions: state.creativeDescriptions.filter((_, i) => i !== action.index),
      };

    case "RESET_ALL":
      return initialState;

    default:
      return state;
  }
}

// 生成模式配置
const modeConfig = {
  video: { label: "参考生成视频", icon: "📹", desc: "保留旁白故事", color: "blue" },
  text: { label: "文案生成视频", icon: "✏️", desc: "输入前贴文案，生成视频", color: "purple" },
  narration: { label: "参考生成旁白", icon: "🎬", desc: "保留画面", color: "green" },
  creative: { label: "生成前贴文案", icon: "💡", desc: "输入原剧剧情，生成前贴文案", color: "orange" },
} as const;

// 模式颜色映射
const modeColors = {
  blue: { selected: "border-blue-500 bg-blue-50 text-blue-700", button: "bg-blue-600 hover:bg-blue-700" },
  purple: { selected: "border-purple-500 bg-purple-50 text-purple-700", button: "bg-purple-600 hover:bg-purple-700" },
  green: { selected: "border-green-500 bg-green-50 text-green-700", button: "bg-green-600 hover:bg-green-700" },
  orange: { selected: "border-orange-500 bg-orange-50 text-orange-700", button: "bg-orange-600 hover:bg-orange-700" },
} as const;

// 创建任务表单组件
function CreateTaskForm({
  taskType,
  onClose,
  onCreate,
}: {
  taskType: string;
  onClose: () => void;
  onCreate: (task: Task) => void;
}) {
  const [state, dispatch] = useReducer(formReducer, initialState);

  // 模式切换时重置状态
  const handleModeChange = useCallback((mode: GenerationMode) => {
    dispatch({ type: "SET_MODE_TRANSITIONING", value: true });
    setTimeout(() => {
      dispatch({ type: "RESET_MODE_STATE", mode });
      dispatch({ type: "SET_MODE_TRANSITIONING", value: false });
    }, 150);
  }, []);

  // Mock AI 生成前贴文案（模式四）
  const handleGenerateCreativeDescriptions = useCallback(() => {
    if (!state.originalNarration.trim() || !state.requiredElements.trim()) return;
    dispatch({ type: "SET_FIELD", field: "isGeneratingCreative", value: true });

    setTimeout(() => {
      const results = Array.from({ length: state.creativeCount }, (_, i) =>
        `【版本${i + 1}】${state.originalNarration}，保留要素：${state.requiredElements}，风格版本${i + 1}`
      );
      dispatch({ type: "SET_FIELD", field: "creativeDescriptions", value: results });
      dispatch({ type: "SET_FIELD", field: "isGeneratingCreative", value: false });
    }, 1500);
  }, [state.originalNarration, state.requiredElements, state.creativeCount]);

  const handleSubmit = () => {
    if (!state.taskName.trim()) return;

    const newTask: Task = {
      id: `QG-${Date.now().toString().slice(-6)}`,
      name: state.taskName,
      type: taskType,
      status: "排队中",
      createTime: new Date().toISOString().slice(0, 16).replace("T", " "),
      endTime: "-",
      generationMode: state.generationMode,
      referenceVideo: state.generationMode === "video" ? state.referenceVideo : undefined,
      textPrompt: state.generationMode === "text" ? state.textPrompt : undefined,
    };

    onCreate(newTask);
    dispatch({ type: "RESET_ALL" });
    onClose();
  };

  // 清理编辑状态
  useEffect(() => {
    return () => {
      dispatch({ type: "RESET_ALL" });
    };
  }, []);

  const { modeTransitioning, isGenerating, isGeneratingCreative, generationMode, editingIndex, editValue } = state;
  const modeColorKey = modeConfig[generationMode].color as keyof typeof modeColors;

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {/* 基本信息 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
          基本信息
        </h3>
        <div className="space-y-4">
          <div>
            <Label>任务名称 *</Label>
            <Input
              placeholder="请输入任务名称"
              value={state.taskName}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "taskName", value: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* 生成模式选择 */}
          {taskType === "前贴生成" && (
            <div>
              <Label className="mb-2 block">生成模式</Label>
              <div className={`grid grid-cols-2 gap-3 transition-opacity duration-150 ${modeTransitioning ? "opacity-50" : "opacity-100"}`}>
                {(Object.keys(modeConfig) as GenerationMode[]).map((mode) => {
                  const config = modeConfig[mode];
                  const isSelected = generationMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleModeChange(mode)}
                      className={`relative py-3 px-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? `border-${config.color === "blue" ? "blue" : config.color === "purple" ? "purple" : config.color === "green" ? "green" : "orange"}-500 bg-${
                              config.color === "blue" ? "blue" : config.color === "purple" ? "purple" : config.color === "green" ? "green" : "orange"
                            }-50 text-${config.color === "blue" ? "blue" : config.color === "purple" ? "purple" : config.color === "green" ? "green" : "orange"}-700 shadow-sm`
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {isSelected && (
                        <div className={`absolute -top-2 -right-2 w-5 h-5 bg-${config.color === "blue" ? "blue" : config.color === "purple" ? "purple" : config.color === "green" ? "green" : "orange"}-500 rounded-full flex items-center justify-center`}>
                          <ChevronRight className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="font-medium">{config.icon} {config.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{config.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 参考视频选择 - 视频模式或旁白模式显示 */}
          {(generationMode === "video" || generationMode === "narration") && (
            <div className={`transition-all duration-150 ${modeTransitioning ? "opacity-0 transform translate-y-2" : "opacity-100"}`}>
              <Label>参考视频</Label>
              <Select
                value={state.referenceVideo}
                onValueChange={(v) => dispatch({ type: "SET_FIELD", field: "referenceVideo", value: v || "" })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="选择参考视频" />
                </SelectTrigger>
                <SelectContent>
                  {materials.前贴.map((video) => (
                    <SelectItem key={video.id} value={video.id}>
                      <div className="flex items-center gap-2">
                        <img
                          src={video.thumbnail}
                          alt={video.name}
                          className="w-16 h-10 object-cover rounded"
                        />
                        <span>{video.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 模式三：旁白生成 - 原文案输入 */}
          {generationMode === "narration" && (
            <div className={`transition-all duration-150 ${modeTransitioning ? "opacity-0 transform translate-y-2" : "opacity-100"}`}>
              <Label>原文案</Label>
              <Textarea
                placeholder="请输入原始旁白文案..."
                value={state.originalNarration}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "originalNarration", value: e.target.value })}
                rows={3}
                className="mt-1"
              />
            </div>
          )}

          {/* 模式四：生成前贴文案 - 原剧文案和需保留的要素 */}
          {generationMode === "creative" && (
            <div className={`space-y-4 transition-all duration-150 ${modeTransitioning ? "opacity-0 transform translate-y-2" : "opacity-100"}`}>
              <div>
                <Label>原剧文案</Label>
                <Textarea
                  placeholder="请输入前贴需要衔接的原剧剧情文案，30-60秒左右"
                  value={state.originalNarration}
                  onChange={(e) => dispatch({ type: "SET_FIELD", field: "originalNarration", value: e.target.value })}
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>需保留的要素</Label>
                <Input
                  placeholder="请输入生成的前贴文案中，需要保留的要素，如「围绕小女孩，父亲，卖肉写」"
                  value={state.requiredElements}
                  onChange={(e) => dispatch({ type: "SET_FIELD", field: "requiredElements", value: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* 文字输入 - 当选择文字生成模式时显示 */}
          {generationMode === "text" && (
            <div className={`transition-all duration-150 ${modeTransitioning ? "opacity-0 transform translate-y-2" : "opacity-100"}`}>
              <Label>基础视频描述</Label>
              <Textarea
                placeholder="请详细描述你想要生成的视频内容..."
                value={state.textPrompt}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "textPrompt", value: e.target.value })}
                rows={3}
                className="mt-1"
              />
            </div>
          )}

          {/* 模式四：创意描述生成 */}
          {generationMode === "creative" && (
            <div className={`border rounded-xl p-4 bg-gradient-to-br from-orange-50 to-white transition-all duration-150 ${modeTransitioning ? "opacity-0 transform translate-y-2" : "opacity-100"}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                前贴文案
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <Label className="whitespace-nowrap text-sm">生成数量: {state.creativeCount}</Label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={state.creativeCount}
                  onChange={(e) => dispatch({ type: "SET_FIELD", field: "creativeCount", value: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
                <Button
                  onClick={handleGenerateCreativeDescriptions}
                  disabled={!state.originalNarration.trim() || !state.requiredElements.trim() || isGeneratingCreative}
                  className="bg-orange-600 hover:bg-orange-700 gap-2"
                >
                  {isGeneratingCreative ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      生成中
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      AI生成
                    </>
                  )}
                </Button>
              </div>

              {/* 创意描述列表 */}
              {state.creativeDescriptions.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {state.creativeDescriptions.map((desc, index) => (
                    <div key={index} className="group flex items-start gap-2 p-3 bg-white rounded-lg border border-orange-100 hover:border-orange-200 transition-colors">
                      <span className="text-sm text-orange-600 font-medium mt-2 w-6">{index + 1}.</span>
                      {editingIndex === index ? (
                        <Textarea
                          value={editValue}
                          onChange={(e) => dispatch({ type: "SET_FIELD", field: "editValue", value: e.target.value })}
                          onBlur={() => {
                            dispatch({ type: "UPDATE_CREATIVE_DESCRIPTION", index, value: editValue });
                          }}
                          rows={2}
                          className="flex-1"
                          autoFocus
                        />
                      ) : (
                        <div
                          className="flex-1 text-sm py-1 px-2 cursor-pointer hover:bg-orange-50 rounded transition-colors"
                          onClick={() => {
                            dispatch({ type: "SET_FIELD", field: "editingIndex", value: index });
                            dispatch({ type: "SET_FIELD", field: "editValue", value: desc });
                          }}
                        >
                          {desc}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => dispatch({ type: "DELETE_CREATIVE_DESCRIPTION", index })}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch({ type: "ADD_CREATIVE_DESCRIPTION" })}
                className="mt-3 border-orange-200 text-orange-600 hover:bg-orange-50 gap-1"
              >
                <Plus className="w-4 h-4" /> 添加描述
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 生成参数 - 仅视频和文字模式显示 */}
      {(generationMode === "video" || generationMode === "text") && (
        <div className={`transition-all duration-150 ${modeTransitioning ? "opacity-0 transform translate-y-2" : "opacity-100"}`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-green-500 rounded-full"></span>
            生成参数
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>模型</Label>
              <Select
                value={state.model}
                onValueChange={(v) => dispatch({ type: "SET_FIELD", field: "model", value: v as "seedance_2.0" | "wan_2.6" })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seedance_2.0">Seedance 2.0</SelectItem>
                  <SelectItem value="wan_2.6">Wan 2.6</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>画面比例</Label>
              <Select
                value={state.aspectRatio}
                onValueChange={(v) => dispatch({ type: "SET_FIELD", field: "aspectRatio", value: v as "16:9" | "9:16" | "1:1" })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9</SelectItem>
                  <SelectItem value="9:16">9:16</SelectItem>
                  <SelectItem value="1:1">1:1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>分辨率</Label>
              <Select
                value={state.resolution}
                onValueChange={(v) => dispatch({ type: "SET_FIELD", field: "resolution", value: v as "720p" | "1080p" | "2k" })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                  <SelectItem value="2k">2K</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* 生成数量 - 仅视频模式显示 */}
            {generationMode === "video" && (
              <div>
                <Label>生成数量: {state.generationCount}</Label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={state.generationCount}
                  onChange={(e) => dispatch({ type: "SET_FIELD", field: "generationCount", value: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                />
              </div>
            )}
            {/* 分镜拆分 - 仅视频模式显示 */}
            {generationMode === "video" && (
              <div className="col-span-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">分镜拆分</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {state.splitByShot
                        ? "开启：按分镜拆分成多个提示词（适合15秒以上长视频）"
                        : "关闭：所有分镜合并生成一个提示词（适合15秒内短视频）"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "SET_FIELD", field: "splitByShot", value: !state.splitByShot })}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      state.splitByShot ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                        state.splitByShot ? "translate-x-6" : "translate-x-2"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 变更方向 - 仅视频模式显示 */}
      {generationMode === "video" && (
        <div className={`border rounded-xl p-4 transition-all duration-150 ${modeTransitioning ? "opacity-0 transform translate-y-2" : "opacity-100"}`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
            变更方向
          </h3>
          <div className="flex flex-wrap gap-2">
            {(["角色", "场景", "画风", "氛围", "其他"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => dispatch({ type: "SET_FIELD", field: "direction", value: v })}
                className={`px-4 py-2 rounded-full text-sm border transition-all duration-200 ${
                  state.direction === v
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      <DialogFooter className="pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          取消
        </Button>
        <Button
          onClick={handleSubmit}
          className={`${modeColors[modeColorKey].button} gap-2`}
          disabled={!state.taskName.trim()}
        >
          {generationMode === "narration" && "生成旁白"}
          {generationMode === "creative" && "创建任务"}
          {(generationMode === "video" || generationMode === "text") && "创建任务"}
        </Button>
      </DialogFooter>
    </div>
  );
}

function TaskTable({
  tasks,
  taskType,
  onCreateTask,
  onDeleteTask,
}: {
  tasks: Task[];
  taskType: string;
  onCreateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}) {
  const [statusFilter, setStatusFilter] = useState("全部");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const router = useRouter();

  const handleCreateAndRedirect = (newTask: Task) => {
    onCreateTask(newTask);
    setIsDialogOpen(false);
    // Redirect to task detail page
    if (taskType === "前贴生成") {
      router.push(`/tasks/generation?id=${newTask.id}`);
    }
  };

  const handleDeleteTask = () => {
    if (deleteTaskId) {
      onDeleteTask(deleteTaskId);
      setIsDeleteDialogOpen(false);
      setDeleteTaskId(null);
    }
  };

  const filteredTasks = tasks.filter(
    (t) => statusFilter === "全部" || t.status === statusFilter
  );

  const handleRowClick = (task: Task) => {
    if (taskType === "前贴生成") {
      router.push(`/tasks/generation?id=${task.id}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold">任务列表</h2>
        <div className="flex gap-4 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="全部">全部</option>
            <option value="已完成">已完成</option>
            <option value="处理中">处理中</option>
            <option value="排队中">排队中</option>
            <option value="失败">失败</option>
          </select>

          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsDialogOpen(true)}
          >
            ➕ 新建任务
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>新建{taskType}任务</DialogTitle>
                <DialogDescription>填写任务配置信息</DialogDescription>
              </DialogHeader>
              <CreateTaskForm
                taskType={taskType}
                onClose={() => setIsDialogOpen(false)}
                onCreate={handleCreateAndRedirect}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Card List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTasks.map((task) => (
          <Card
            key={task.id}
            className={`cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden group ${
              taskType === "前贴生成" ? "hover:border-blue-300 hover:-translate-y-1" : ""
            }`}
          >
            {/* 缩略图 */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              {task.thumbnail ? (
                <img
                  src={task.thumbnail}
                  alt={task.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <span className="text-4xl opacity-30">
                    {task.type === "前贴生成" ? "🎬" : "🎞️"}
                  </span>
                </div>
              )}
              {/* 删除按钮 - 右上角 */}
              <div
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTaskId(task.id);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <button className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
            <CardContent className="p-4">
              <div
                className="cursor-pointer"
                onClick={() => handleRowClick(task)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{task.name}</div>
                    <div className="text-sm text-gray-500">{task.id}</div>
                  </div>
                  <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                    {task.createTime}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              确定要删除「{filteredTasks.find(t => t.id === deleteTaskId)?.name}」吗？
            </DialogTitle>
            <DialogDescription className="text-red-500 text-sm pt-2">
              删除后，该任务下的所有内容（包括提示词、已生成的视频、历史记录等）将被永久删除且无法恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTask}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 py-4">
        <Button variant="outline" size="sm" disabled>
          ◀ 上一页
        </Button>
        <span className="text-gray-500">
          第 1 / {Math.max(1, Math.ceil(filteredTasks.length / 10))} 页
        </span>
        <Button variant="outline" size="sm" disabled={filteredTasks.length <= 10}>
          下一页 ▶
        </Button>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("前贴生成");
  const [tasks, setTasks] = useState(tasksData);

  const handleCreateTask = (newTask: Task) => {
    if (activeTab === "前贴生成") {
      setTasks((prev) => ({
        ...prev,
        前贴生成: [newTask, ...prev.前贴生成],
      }));
    } else {
      setTasks((prev) => ({
        ...prev,
        素材拼接: [newTask, ...prev.素材拼接],
      }));
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (activeTab === "前贴生成") {
      setTasks((prev) => ({
        ...prev,
        前贴生成: prev.前贴生成.filter((t) => t.id !== taskId),
      }));
    } else {
      setTasks((prev) => ({
        ...prev,
        素材拼接: prev.素材拼接.filter((t) => t.id !== taskId),
      }));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">任务中心</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="前贴生成">前贴生成</TabsTrigger>
          <TabsTrigger value="素材拼接">素材拼接</TabsTrigger>
        </TabsList>

        <TabsContent value="前贴生成">
          <TaskTable
            tasks={tasks.前贴生成}
            taskType="前贴生成"
            onCreateTask={handleCreateTask}
            onDeleteTask={handleDeleteTask}
          />
        </TabsContent>

        <TabsContent value="素材拼接">
          <TaskTable
            tasks={tasks.素材拼接}
            taskType="素材拼接"
            onCreateTask={handleCreateTask}
            onDeleteTask={handleDeleteTask}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
