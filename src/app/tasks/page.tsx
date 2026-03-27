"use client";

import { useState } from "react";
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
import { Slider } from "@/components/ui/slider";
import { tasks, materials } from "@/lib/mockData";
import { Task, Material } from "@/lib/types";

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
  const [taskName, setTaskName] = useState("");
  const [generationMode, setGenerationMode] = useState<"video" | "text" | "narration" | "creative">("video");
  const [referenceVideo, setReferenceVideo] = useState<string>("");
  const [textPrompt, setTextPrompt] = useState<string>("");
  const [originalNarration, setOriginalNarration] = useState<string>("");
  const [creativeType, setCreativeType] = useState<string>("");
  const [model, setModel] = useState<string>("seedance_2.0");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [resolution, setResolution] = useState<string>("720p");
  const [generationCount, setGenerationCount] = useState<number>(3);
  const [character, setCharacter] = useState("");
  const [scene, setScene] = useState("");
  const [style, setStyle] = useState("");
  const [atmosphere, setAtmosphere] = useState("");
  const [others, setOthers] = useState("");
  const [direction, setDirection] = useState("角色");

  // 文字生成模式相关状态
  const [textDescriptions, setTextDescriptions] = useState<string[]>([]);
  const [derivedCount, setDerivedCount] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // 创意描述相关状态
  const [creativeDescriptions, setCreativeDescriptions] = useState<string[]>([]);
  const [creativeCount, setCreativeCount] = useState<number>(5);
  const [isGeneratingCreative, setIsGeneratingCreative] = useState(false);
  const [creativeEditingIndex, setCreativeEditingIndex] = useState<number | null>(null);
  const [creativeEditValue, setCreativeEditValue] = useState("");

  // Handler to convert null to empty string
  const handleSelectChange = (setter: (v: string) => void) => (value: string | null) => {
    setter(value || "");
  };

  // Mock AI 生成衍生描述（模式二）
  const handleGenerateDescriptions = () => {
    if (!textPrompt.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      const mockDerivatives = [
        `${textPrompt}，采用更加动感的镜头语言`,
        `${textPrompt}，强调情感表达`,
        `${textPrompt}，添加更多细节描写`,
        `${textPrompt}，变换叙事视角`,
        `${textPrompt}，融入更多情绪氛围`,
        `${textPrompt}，使用电影级调色`,
        `${textPrompt}，增加戏剧冲突`,
        `${textPrompt}，采用写实风格`,
        `${textPrompt}，添加浪漫元素`,
        `${textPrompt}，突出主题内核`,
      ];

      const newDescriptions = mockDerivatives.slice(0, derivedCount);
      setTextDescriptions([textPrompt, ...newDescriptions]);
      setIsGenerating(false);
    }, 1500);
  };

  // Mock AI 生成创意描述（模式四）
  const handleGenerateCreativeDescriptions = () => {
    if (!originalNarration.trim() || !creativeType) return;
    setIsGeneratingCreative(true);

    setTimeout(() => {
      const creativePrompts: Record<string, string[]> = {
        "搞笑": [
          `【搞笑版】${originalNarration}，使用夸张的表情和动作`,
          `【搞笑版】${originalNarration}，添加幽默的对白`,
          `【搞笑版】${originalNarration}，反转剧情`,
          `【搞笑版】${originalNarration}，使用方言配音`,
          `【搞笑版】${originalNarration}，恶搞风格`,
        ],
        "感人": [
          `【感人版】${originalNarration}，缓慢深情的镜头`,
          `【感人版】${originalNarration}，添加回忆片段`,
          `【感人版】${originalNarration}，温情的音乐`,
          `【感人版】${originalNarration}，突出情感细节`,
          `【感人版】${originalNarration}，煽情的配乐`,
        ],
        "热血": [
          `【热血版】${originalNarration}，激昂的背景音乐`,
          `【热血版】${originalNarration}，快速剪辑`,
          `【热血版】${originalNarration}，添加战斗画面`,
          `【热血版】${originalNarration}，突出主角光环`,
          `【热血版】${originalNarration}，震撼的特效`,
        ],
        "悬疑": [
          `【悬疑版】${originalNarration}，阴暗的色调`,
          `【悬疑版】${originalNarration}，紧张的配乐`,
          `【悬疑版】${originalNarration}，隐藏关键信息`,
          `【悬疑版】${originalNarration}，暗示结局`,
          `【悬疑版】${originalNarration}，神秘的气氛`,
        ],
        "浪漫": [
          `【浪漫版】${originalNarration}，唯美的画面`,
          `【浪漫版】${originalNarration}，粉色滤镜`,
          `【浪漫版】${originalNarration}，甜蜜的互动`,
          `【浪漫版】${originalNarration}，夕阳下的场景`,
          `【浪漫版】${originalNarration}，心动的配乐`,
        ],
      };

      const results = creativePrompts[creativeType] || creativePrompts["搞笑"];
      setCreativeDescriptions(results.slice(0, creativeCount));
      setIsGeneratingCreative(false);
    }, 1500);
  };

  const handleAddDescription = () => {
    setTextDescriptions([...textDescriptions, ""]);
    setEditingIndex(textDescriptions.length);
    setEditValue("");
  };

  const handleUpdateDescription = (index: number, value: string) => {
    const updated = [...textDescriptions];
    updated[index] = value;
    setTextDescriptions(updated);
  };

  const handleDeleteDescription = (index: number) => {
    setTextDescriptions(textDescriptions.filter((_, i) => i !== index));
  };

  const handleAddCreativeDescription = () => {
    setCreativeDescriptions([...creativeDescriptions, ""]);
    setCreativeEditingIndex(creativeDescriptions.length);
    setCreativeEditValue("");
  };

  const handleUpdateCreativeDescription = (index: number, value: string) => {
    const updated = [...creativeDescriptions];
    updated[index] = value;
    setCreativeDescriptions(updated);
  };

  const handleDeleteCreativeDescription = (index: number) => {
    setCreativeDescriptions(creativeDescriptions.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!taskName.trim()) return;

    const newTask: Task = {
      id: `QG-${Date.now().toString().slice(-6)}`,
      name: taskName,
      type: taskType,
      status: "排队中",
      createTime: new Date().toISOString().slice(0, 16).replace("T", " "),
      endTime: "-",
      generationMode,
      referenceVideo: generationMode === "video" ? referenceVideo : undefined,
      textPrompt: generationMode === "text" ? (textDescriptions.length > 0 ? textDescriptions[0] : textPrompt) : undefined,
    };

    onCreate(newTask);
    onClose();
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {/* 基本信息 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">基本信息</h3>
        <div className="space-y-4">
          <div>
            <Label>任务名称 *</Label>
            <Input
              placeholder="请输入任务名称"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="mt-1"
            />
          </div>
          {/* 生成模式选择 */}
          {taskType === "前贴生成" && (
            <div>
              <Label>生成模式</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setGenerationMode("video")}
                  className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                    generationMode === "video"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium">📹 参考视频生成</div>
                  <div className="text-xs text-gray-500 mt-1">保留旁白故事</div>
                </button>
                <button
                  type="button"
                  onClick={() => setGenerationMode("text")}
                  className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                    generationMode === "text"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium">✏️ 文字生成视频</div>
                  <div className="text-xs text-gray-500 mt-1">输入描述生成</div>
                </button>
                <button
                  type="button"
                  onClick={() => setGenerationMode("narration")}
                  className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                    generationMode === "narration"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium">🎬 仅生成旁白</div>
                  <div className="text-xs text-gray-500 mt-1">保留画面</div>
                </button>
                <button
                  type="button"
                  onClick={() => setGenerationMode("creative")}
                  className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                    generationMode === "creative"
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium">💡 创意描述生成</div>
                  <div className="text-xs text-gray-500 mt-1">AI创意描述</div>
                </button>
              </div>
            </div>
          )}

          {/* 参考视频选择 - 视频模式或旁白模式显示 */}
          {(generationMode === "video" || generationMode === "narration") && (
            <div>
              <Label>参考视频</Label>
              <Select value={referenceVideo} onValueChange={handleSelectChange(setReferenceVideo)}>
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
            <div>
              <Label>原文案</Label>
              <Textarea
                placeholder="请输入原始旁白文案..."
                value={originalNarration}
                onChange={(e) => setOriginalNarration(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          )}

          {/* 模式四：创意描述 - 原文案和创意类型 */}
          {generationMode === "creative" && (
            <>
              <div>
                <Label>原文案</Label>
                <Textarea
                  placeholder="请输入原始旁白文案..."
                  value={originalNarration}
                  onChange={(e) => setOriginalNarration(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>创意类型</Label>
                <Select value={creativeType} onValueChange={handleSelectChange(setCreativeType)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="选择创意类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="搞笑">搞笑</SelectItem>
                    <SelectItem value="感人">感人</SelectItem>
                    <SelectItem value="热血">热血</SelectItem>
                    <SelectItem value="悬疑">悬疑</SelectItem>
                    <SelectItem value="浪漫">浪漫</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* 文字输入 - 当选择文字生成模式时显示 */}
          {generationMode === "text" && (
            <div>
              <Label>基础视频描述</Label>
              <Textarea
                placeholder="请详细描述你想要生成的视频内容..."
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          )}

          {/* 文字生成模式：衍生描述管理 */}
          {generationMode === "text" && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">衍生描述</h3>
              <div className="flex items-center gap-4 mb-4">
                <Label className="whitespace-nowrap">衍生数量: {derivedCount}</Label>
                <Slider
                  value={[derivedCount]}
                  onValueChange={(val) => setDerivedCount(Array.isArray(val) ? val[0] : val)}
                  max={10}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <Button
                  onClick={handleGenerateDescriptions}
                  disabled={!textPrompt.trim() || isGenerating}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isGenerating ? "生成中..." : "AI生成"}
                </Button>
              </div>

              {/* 描述列表 */}
              {textDescriptions.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {textDescriptions.map((desc, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-500 mt-2 w-6">{index + 1}.</span>
                      {editingIndex === index ? (
                        <Textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => {
                            handleUpdateDescription(index, editValue);
                            setEditingIndex(null);
                          }}
                          rows={2}
                          className="flex-1"
                          autoFocus
                        />
                      ) : (
                        <div
                          className="flex-1 text-sm py-1 px-2 cursor-pointer hover:bg-gray-100 rounded"
                          onClick={() => {
                            setEditingIndex(index);
                            setEditValue(desc);
                          }}
                        >
                          {desc}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteDescription(index)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="outline" size="sm" onClick={handleAddDescription} className="mt-3">
                + 添加描述
              </Button>
            </div>
          )}

          {/* 模式四：创意描述生成 */}
          {generationMode === "creative" && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">创意描述</h3>
              <div className="flex items-center gap-4 mb-4">
                <Label className="whitespace-nowrap">生成数量: {creativeCount}</Label>
                <Slider
                  value={[creativeCount]}
                  onValueChange={(val) => setCreativeCount(Array.isArray(val) ? val[0] : val)}
                  max={10}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <Button
                  onClick={handleGenerateCreativeDescriptions}
                  disabled={!originalNarration.trim() || !creativeType || isGeneratingCreative}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isGeneratingCreative ? "生成中..." : "AI生成"}
                </Button>
              </div>

              {/* 创意描述列表 */}
              {creativeDescriptions.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {creativeDescriptions.map((desc, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg">
                      <span className="text-sm text-orange-600 mt-2 w-6">{index + 1}.</span>
                      {creativeEditingIndex === index ? (
                        <Textarea
                          value={creativeEditValue}
                          onChange={(e) => setCreativeEditValue(e.target.value)}
                          onBlur={() => {
                            handleUpdateCreativeDescription(index, creativeEditValue);
                            setCreativeEditingIndex(null);
                          }}
                          rows={2}
                          className="flex-1"
                          autoFocus
                        />
                      ) : (
                        <div
                          className="flex-1 text-sm py-1 px-2 cursor-pointer hover:bg-orange-100 rounded"
                          onClick={() => {
                            setCreativeEditingIndex(index);
                            setCreativeEditValue(desc);
                          }}
                        >
                          {desc}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteCreativeDescription(index)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="outline" size="sm" onClick={handleAddCreativeDescription} className="mt-3">
                + 添加描述
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 生成参数 - 仅视频和文字模式显示 */}
      {(generationMode === "video" || generationMode === "text") && (
        <div>
          <h3 className="text-lg font-semibold mb-4">生成参数</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>模型</Label>
            <Select value={model} onValueChange={handleSelectChange(setModel)}>
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
            <Select value={aspectRatio} onValueChange={handleSelectChange(setAspectRatio)}>
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
            <Select value={resolution} onValueChange={handleSelectChange(setResolution)}>
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
              <Label>生成数量: {generationCount}</Label>
              <Slider
                value={[generationCount]}
                onValueChange={(val) => setGenerationCount(Array.isArray(val) ? val[0] : val)}
                max={10}
                min={1}
                step={1}
                className="mt-3"
              />
            </div>
          )}
          {/* 任务数量提示 - 仅文字模式显示 */}
          {generationMode === "text" && textDescriptions.length > 0 && (
            <div className="flex items-center">
              <span className="text-sm text-gray-500">将创建 {textDescriptions.length} 个任务</span>
            </div>
          )}
        </div>
        </div>
      )}

      {/* 变更方向 - 仅视频模式显示 */}
      {generationMode === "video" && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">变更方向</h3>
          <div className="flex flex-wrap gap-2">
            {["角色", "场景", "画风", "氛围", "其他"].map((v) => (
              <button key={v} type="button" onClick={() => setDirection(v)} className={`px-4 py-2 rounded-full text-sm border ${direction === v ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"}`}>{v}</button>
            ))}
          </div>
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          取消
        </Button>
        {generationMode === "video" && (
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            创建任务
          </Button>
        )}
        {generationMode === "text" && (
          <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
            创建任务
          </Button>
        )}
        {generationMode === "narration" && (
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            生成旁白
          </Button>
        )}
        {generationMode === "creative" && (
          <Button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700">
            生成创意描述
          </Button>
        )}
      </DialogFooter>
    </div>
  );
}

function TaskTable({
  tasks,
  taskType,
  onCreateTask,
}: {
  tasks: Task[];
  taskType: string;
  onCreateTask: (task: Task) => void;
}) {
  const [statusFilter, setStatusFilter] = useState("全部");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const handleCreateAndRedirect = (newTask: Task) => {
    onCreateTask(newTask);
    setIsDialogOpen(false);
    // Redirect to task detail page
    if (taskType === "前贴生成") {
      router.push(`/tasks/generation?id=${newTask.id}`);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => (
          <Card
            key={task.id}
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              taskType === "前贴生成" ? "hover:border-blue-300" : ""
            }`}
            onClick={() => handleRowClick(task)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-medium text-gray-900">{task.name}</div>
                  <div className="text-sm text-gray-500">{task.id}</div>
                </div>
                <StatusBadge status={task.status} />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>{task.type}</div>
                <div>{task.createTime}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
          />
        </TabsContent>

        <TabsContent value="素材拼接">
          <TaskTable
            tasks={tasks.素材拼接}
            taskType="素材拼接"
            onCreateTask={handleCreateTask}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
