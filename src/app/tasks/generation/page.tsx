"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { materials } from "@/lib/mockData";
import { GenerationTask, GenerationResult, VideoGenerationStatus } from "@/lib/types";

const mockTask: GenerationTask = {
  id: "QG-0001",
  name: "前贴生成任务_1",
  config: {
    id: "QG-0001",
    name: "前贴生成任务_1",
    generationMode: "video",
    referenceVideo: materials.前贴[0],
    textPrompt: "",
    model: "seedance_2.0",
    aspectRatio: "16:9",
    resolution: "1080p",
    generationCount: 3,
    params: {
      character: "年轻女性，时尚活泼",
      scene: "城市夜景，霓虹灯",
      style: "现代简约",
      atmosphere: "活力向上",
      others: "无",
    },
  },
  results: [
    {
      id: "result-1",
      name: "结果1",
      status: "completed",
      prompt: "年轻女性在霓虹灯下的城市街道上自信行走，展现活力向上的氛围...",
      videoUrl: "https://picsum.photos/seed/v1/640/360",
      narrationText: "这是一个关于追逐梦想的故事，在城市的霓虹灯下，我们找到了前进的方向。",
      voice: "女声-活泼",
      emotion: "开心",
    },
    {
      id: "result-2",
      name: "结果2",
      status: "generating",
      prompt: "年轻女性在霓虹灯下的城市街道上自信行走，展现活力向上的氛围...",
      progress: 65,
    },
    {
      id: "result-3",
      name: "结果3",
      status: "pending",
      prompt: "年轻女性在霓虹灯下的城市街道上自信行走，展现活力向上的氛围...",
    },
  ],
  status: "generating",
  createTime: "2026-03-20 10:30",
  updateTime: "2026-03-20 10:35",
};

const mockWorks = [
  { id: "work-1", name: "前贴作品_1", thumbnail: "https://picsum.photos/seed/w1/320/180", duration: "30秒", createTime: "2026-03-20 11:00", status: "已完成" },
  { id: "work-2", name: "前贴作品_2", thumbnail: "https://picsum.photos/seed/w2/320/180", duration: "45秒", createTime: "2026-03-19 15:30", status: "已完成" },
  { id: "work-3", name: "前贴作品_3", thumbnail: "https://picsum.photos/seed/w3/320/180", duration: "60秒", createTime: "2026-03-18 10:20", status: "已保存" },
];

interface Shot {
  id: string;
  prompt: string;
  duration: number;
  referenceImage?: string;
  referenceVideo?: string;
  status: VideoGenerationStatus;
  progress?: number;
  videoUrl?: string;
  errorMessage?: string;
  history?: VideoHistoryItem[];
  videoModel?: string;
}

interface VideoHistoryItem {
  id: string;
  videoUrl: string;
  prompt: string;
  duration: number;
  createTime: string;
}

function StatusBadge({ status, errorMessage }: { status: VideoGenerationStatus; errorMessage?: string }) {
  const config: Record<VideoGenerationStatus, { bg: string; text: string; label: string; showError?: boolean }> = {
    pending: { bg: "bg-gray-100", text: "text-gray-600", label: "待生成" },
    generating: { bg: "bg-blue-100", text: "text-blue-600", label: "生成中" },
    completed: { bg: "bg-green-100", text: "text-green-600", label: "已生成" },
    failed: { bg: "bg-red-100", text: "text-red-600", label: "生成失败", showError: true },
  };
  const { bg, text, label, showError } = config[status];
  return (
    <div className="flex items-center gap-2">
      <Badge className={`${bg} ${text}`}>{label}</Badge>
      {showError && errorMessage && <span className="text-xs text-red-500">{errorMessage}</span>}
    </div>
  );
}

function EditDrawer({ open, onClose, result, onSave }: {
  open: boolean;
  onClose: () => void;
  result: GenerationResult;
  onSave: (shots: Shot[]) => void;
}) {
  const defaultPrompt = `整体风格: 电影质感，恐怖奇幻与希腊神话史诗风格的结合，开场是温馨餐厅的暖色调，后半段是宏伟宫殿的明亮金色调，充满戏剧性和视觉冲击力。

分镜1 (00:00-00:01):
[00:00] 中景：在一个灯光温暖的美式餐厅里，一个金发碧眼、扎着双马尾、戴着粉色蝴蝶结的小女孩，穿着可爱的粉色蕾丝公主裙，她正直视镜头，面无表情地举起一个鸡腿。

分镜2 (00:01-00:04):
[00:01] 特写镜头：镜头聚焦于女孩的后脑勺，她的一只手掀起金色假发，露出下面一张布满尖牙、血淋淋的怪物嘴巴。另一只手将鸡腿塞进这个嘴里，嘴巴贪婪地咀嚼。`;

  const [shots, setShots] = useState<Shot[]>(() => [
    { id: "shot-1", prompt: defaultPrompt, duration: 5, referenceImage: "https://picsum.photos/seed/s1/320/180", status: "completed", videoUrl: "https://picsum.photos/seed/v1/320/180" },
    { id: "shot-2", prompt: defaultPrompt, duration: 5, referenceImage: "https://picsum.photos/seed/s2/320/180", status: "generating", progress: 65 },
    { id: "shot-3", prompt: defaultPrompt, duration: 5, referenceImage: "https://picsum.photos/seed/s3/320/180", status: "failed", errorMessage: "GPU资源不足，请稍后重试" },
    { id: "shot-4", prompt: defaultPrompt, duration: 5, referenceImage: "https://picsum.photos/seed/s4/320/180", status: "pending" },
  ]);

  const [model, setModel] = useState("seedance_2.0");
  const [generatingShotId, setGeneratingShotId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [historyShotId, setHistoryShotId] = useState<string | null>(null);
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [editingShotId, setEditingShotId] = useState<string | null>(null);
  const [isEditingImagePrompt, setIsEditingImagePrompt] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [referenceImages, setReferenceImages] = useState<string[]>([
    "https://picsum.photos/seed/ref1/200/200",
    "https://picsum.photos/seed/ref2/200/200",
    "https://picsum.photos/seed/ref3/200/200",
  ]);

  const handleModelChange = (value: string | null) => setModel(value || "seedance_2.0");

  const updateShot = (id: string, updates: Partial<Shot>) => {
    setShots((prev) => prev.map((shot) => (shot.id === id ? { ...shot, ...updates } : shot)));
  };

  // 处理提示词输入，检测 @ 符号
  const handlePromptChange = (shotId: string, value: string, cursorPos: number) => {
    updateShot(shotId, { prompt: value });
    const lastChar = value[cursorPos - 1];
    const beforeChar = value[cursorPos - 2];
    if (lastChar === "@" && beforeChar !== "@") {
      setEditingShotId(shotId);
      setShowImagePicker(true);
    }
  };

  // 插入图片引用
  const insertImageReference = (type: "reference" | "generated", index: number) => {
    if (!editingShotId) return;
    const shot = shots.find(s => s.id === editingShotId);
    if (!shot) return;
    const imageNum = type === "reference" ? index + 1 : referenceImages.length + index + 1;
    const imageRef = `@图${imageNum}`;
    const cursorPos = shot.prompt.lastIndexOf("@");
    if (cursorPos !== -1) {
      const newPrompt = shot.prompt.substring(0, cursorPos) + imageRef + shot.prompt.substring(cursorPos + 1);
      updateShot(editingShotId, { prompt: newPrompt });
    }
    setShowImagePicker(false);
    setEditingShotId(null);
  };

  // 关闭图片选择器
  const closeImagePicker = () => {
    setShowImagePicker(false);
    setEditingShotId(null);
    setIsEditingImagePrompt(false);
  };

  // 处理生图提示词输入，检测 @ 符号
  const handleImagePromptChange = (value: string) => {
    setImagePrompt(value);
    const cursorPos = value.length;
    const lastChar = value[cursorPos - 1];
    const beforeChar = value[cursorPos - 2];
    if (lastChar === "@" && beforeChar !== "@") {
      setIsEditingImagePrompt(true);
      setShowImagePicker(true);
    }
  };

  // 插入图片引用到生图提示词
  const insertImageRefToImagePrompt = (type: "reference" | "generated", index: number) => {
    const imageNum = type === "reference" ? index + 1 : referenceImages.length + index + 1;
    const imageRef = `@图${imageNum}`;
    const cursorPos = imagePrompt.lastIndexOf("@");
    if (cursorPos !== -1) {
      const newPrompt = imagePrompt.substring(0, cursorPos) + imageRef + imagePrompt.substring(cursorPos + 1);
      setImagePrompt(newPrompt);
    }
    setShowImagePicker(false);
    setIsEditingImagePrompt(false);
  };

  const generateSingleShot = (shotId: string) => {
    setGeneratingShotId(shotId);
    setTimeout(() => {
      setShots((prev) => prev.map((shot) => shot.id === shotId ? { ...shot, status: "generating" as VideoGenerationStatus, progress: 0 } : shot));
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        if (progress >= 100) {
          clearInterval(interval);
          setShots((prev) => prev.map((shot) => shot.id === shotId ? { ...shot, status: "completed" as VideoGenerationStatus, progress: 100, videoUrl: `https://picsum.photos/seed/${shotId}/640/360` } : shot));
          setGeneratingShotId(null);
        } else {
          setShots((prev) => prev.map((shot) => shot.id === shotId ? { ...shot, progress } : shot));
        }
      }, 500);
    }, 500);
  };

  const generateAllShots = () => {
    shots.forEach((shot, index) => { setTimeout(() => generateSingleShot(shot.id), index * 1000); });
  };

  const handleSave = () => { onSave(shots); onClose(); };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[95%] !max-w-[95%] flex flex-col">
        <SheetHeader className="py-3"><SheetTitle className="text-base">编辑分镜 - 结果 {result.id}</SheetTitle></SheetHeader>
        <div className="mt-2 flex-1 flex gap-6 overflow-hidden">
          <div className="flex-1 min-w-0 overflow-y-auto space-y-6 pl-2">
            <h3 className="font-semibold text-lg">分镜列表 ({shots.length})</h3>
            {shots.map((shot, index) => (
              <div key={shot.id} className="relative">
                {/* 分镜卡片 */}
                <div className={`border-2 border-gray-200 rounded-xl overflow-hidden bg-white ${shot.status === "completed" ? "border-l-4 border-l-green-500" : shot.status === "generating" ? "border-l-4 border-l-blue-500" : shot.status === "failed" ? "border-l-4 border-l-red-500" : "border-l-4 border-l-gray-300"}`}>
                  {/* 分镜头部 */}
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-800">分镜 {index + 1}</span>
                      <StatusBadge status={shot.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      {shot.history && shot.history.length > 0 && (
                        <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => setHistoryShotId(shot.id)}>
                          📜 历史版本 ({shot.history.length})
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500" onClick={() => setDeleteConfirmId(shot.id)} title="删除分镜">🗑️</Button>
                    </div>
                  </div>
                  {/* 分镜内容 */}
                  <div className="p-4 flex gap-4">
                    <div className="w-32 flex-shrink-0">
                      <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden relative">
                        {shot.status === "completed" && shot.videoUrl ? (
                          <div className="w-full h-full cursor-pointer relative group" onClick={() => setPreviewVideo(shot.videoUrl!)}>
                            <video src={shot.videoUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-6 h-6 text-gray-700 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                              </div>
                            </div>
                          </div>
                        ) : shot.status === "generating" ? (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <span className="text-sm text-gray-500">生成中...</span>
                          </div>
                        ) : shot.status === "failed" ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4">
                            <span className="text-red-500 text-sm mb-2">生成失败</span>
                            <span className="text-xs text-gray-500 text-center">模型识别到内容可能违反了安全政策（如版权受限、暴力、成人内容或特定人物肖像）,请修改图片或提示词</span>
                            <span className="text-xs text-blue-500 text-center mt-1 underline cursor-pointer">查看解决方案</span>
                          </div>
                        ) : shot.status === "pending" ? (
                          <div className="w-full h-full flex items-center justify-center text-gray-400"><span className="text-sm">暂未生成视频</span></div>
                        ) : shot.referenceImage ? (
                          <img src={shot.referenceImage} alt={`分镜${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400"><span className="text-sm">待生成</span></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="relative">
                        <Label className="text-sm text-gray-600">分镜提示词</Label>
                        <Textarea
                          value={shot.prompt}
                          onChange={(e) => {
                            const cursorPos = e.target.selectionStart;
                            handlePromptChange(shot.id, e.target.value, cursorPos);
                          }}
                          onSelect={(e) => {
                            const cursorPos = (e.target as HTMLTextAreaElement).selectionStart;
                            handlePromptChange(shot.id, shot.prompt, cursorPos);
                          }}
                          rows={4}
                          className={`mt-1 ${shot.status === "generating" ? "bg-gray-50 opacity-60" : ""}`}
                          placeholder="描述这个分镜的内容... 输入 @ 插入图片"
                          disabled={shot.status === "generating"}
                        />
                        {/* @ 图片选择器弹出层 - Dialog 形式 */}
                        <Dialog open={showImagePicker && editingShotId === shot.id} onOpenChange={(open) => {
                          if (!open) closeImagePicker();
                        }}>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>选择参考图</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              {/* 参考图 */}
                              {referenceImages.length > 0 && (
                                <div className="mb-4">
                                  <div className="text-xs text-gray-500 mb-2">参考图</div>
                                  <div className="grid grid-cols-4 gap-2">
                                    {referenceImages.map((img, i) => {
                                      return (
                                        <button
                                          key={`ref-${i}`}
                                          onClick={() => { insertImageReference("reference", i); closeImagePicker(); }}
                                          className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all cursor-pointer"
                                        >
                                          <img src={img} alt={`参考图${i + 1}`} className="w-full h-full object-cover" />
                                          <div className="absolute bottom-0 left-0 right-0 text-center text-xs py-0.5 bg-black/60 text-white">
                                            @图{i + 1}
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              {/* 生成的图片 */}
                              {generatedImages.length > 0 && (
                                <div>
                                  <div className="text-xs text-gray-500 mb-2">生成的图片</div>
                                  <div className="grid grid-cols-4 gap-2">
                                    {generatedImages.map((img, i) => {
                                      const imageNum = referenceImages.length + i + 1;
                                      return (
                                        <button
                                          key={`gen-${i}`}
                                          onClick={() => { insertImageReference("generated", i); closeImagePicker(); }}
                                          className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all cursor-pointer"
                                        >
                                          <img src={img} alt={`生成图${i + 1}`} className="w-full h-full object-cover" />
                                          <div className="absolute bottom-0 left-0 right-0 text-center text-xs py-0.5 bg-black/60 text-white">
                                            @图{imageNum}
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              {referenceImages.length === 0 && generatedImages.length === 0 && (
                                <div className="text-center py-8 text-gray-400">暂无图片，请先在右侧添加参考图或生成图片</div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">时长:</span>
                          <Select value={shot.duration.toString()} onValueChange={(v) => updateShot(shot.id, { duration: parseInt(v || "5") })} disabled={shot.status === "generating"}>
                            <SelectTrigger className={`w-28 h-8 ${shot.status === "generating" ? "bg-gray-50 opacity-60" : ""}`}><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {model === "seedance_2.0" ? [4,5,6,7,8,9,10,11,12,13,14,15].map((d) => <SelectItem key={d} value={d.toString()}>{d}秒</SelectItem>) : (<><SelectItem value="5">5秒</SelectItem><SelectItem value="10">10秒</SelectItem></>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="outline" size="sm" disabled={shot.status === "generating"} className={shot.status === "generating" ? "opacity-60" : ""}>✨ 优化提示词</Button>
                        <span className="text-xs text-gray-400 ml-auto">消耗 {model === "seedance_2.0" ? "10" : "8"} 积分</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => generateSingleShot(shot.id)} disabled={shot.status === "generating"}>{shot.status === "generating" ? "生成中..." : "生成视频"}</Button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 插入分镜按钮 */}
                <div className="flex justify-center my-4">
                  <Button variant="outline" size="sm" className="bg-white border-dashed text-gray-500 hover:text-gray-600 hover:border-gray-400" onClick={() => { const newShot = { id: `shot-${Date.now()}`, prompt: "新分镜提示词...", duration: 5, status: "pending" as const }; const newShots = [...shots]; newShots.splice(index + 1, 0, newShot); setShots(newShots); }}>
                    + 插入新分镜
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="w-96 flex-shrink-0 space-y-6 overflow-y-auto">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium">模型设置</h4>
              <div><Label className="text-sm text-gray-600">选择模型</Label><Select value={model} onValueChange={handleModelChange}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="seedance_2.0">Seedance 2.0 (10积分/个)</SelectItem><SelectItem value="wan_2.6">Wan 2.6 (8积分/个)</SelectItem></SelectContent></Select></div>
              {/* 积分消耗预览 */}
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-sm text-gray-600 mb-2">批量生成预览</div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">待生成:</span>
                  <span className="font-medium">{shots.filter(s => s.status !== "completed").length} 个</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-500">预计消耗:</span>
                  <span className="font-medium text-orange-600">
                    {shots.filter(s => s.status !== "completed").length * (model === "seedance_2.0" ? 10 : 8)} 积分
                  </span>
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={generateAllShots}>批量生成全部</Button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium">参考图</h4>
              <div className="text-xs text-gray-500 mb-2">提示：在提示词中使用 @ 引用参考图，如 "@图1"</div>
              <div className="grid grid-cols-3 gap-2">
                {referenceImages.map((img, i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group cursor-pointer" onClick={() => setPreviewImage(img)}>
                    <img src={img} alt={`参考图${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="destructive" size="sm" className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600" onClick={(e) => { e.stopPropagation(); setReferenceImages(prev => prev.filter((_, idx) => idx !== i)); }}>
                        ✕
                      </Button>
                    </div>
                    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded">@图{i + 1}</div>
                  </div>
                ))}
                {referenceImages.length < 9 && (
                  <button className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center text-gray-400 hover:text-gray-500" onClick={() => setReferenceImages(prev => [...prev, `https://picsum.photos/seed/ref${Date.now()}/200/200`])}>
                    +
                  </button>
                )}
              </div>
              {referenceImages.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-sm">暂无参考图，点击 + 添加</div>
              )}
            </div>
            {/* 参考视频 - 展示创建任务时选择的参考视频 */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium">参考视频</h4>
              <div className="text-xs text-gray-500 mb-2">任务创建时选择的参考视频</div>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {result.referenceVideo ? (
                  <img src={result.referenceVideo.thumbnail || "https://picsum.photos/seed/refv/320/180"} alt="参考视频" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-sm">未选择参考视频</span>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600">{result.referenceVideo?.name || "未设置"}</div>
            </div>
          </div>
        </div>
        {/* 抽屉底部操作栏 */}
        <div className="border-t bg-white px-6 py-4 flex justify-end items-center gap-3">
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button className="bg-orange-500 hover:bg-orange-600">去配音</Button>
        </div>
      </SheetContent>
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>删除分镜？</DialogTitle><DialogDescription>删除后，该分镜下的视频、提示词等素材将被清空且无法找回。</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>保留分镜</Button>
            <Button onClick={() => { if (deleteConfirmId) { setShots((prev) => prev.filter((s) => s.id !== deleteConfirmId)); setDeleteConfirmId(null); } }} className="bg-red-500 hover:bg-red-600 text-white">确认删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 图片预览对话框 */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>图片预览</DialogTitle></DialogHeader>
          <div className="flex justify-center">
            {previewImage && <img src={previewImage} alt="预览" className="max-w-full max-h-[60vh] object-contain rounded-lg" />}
          </div>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}

// 编辑v2：包含生视频配置和独立生图配置
function EditDrawerV2({ open, onClose, result, onSave }: {
  open: boolean;
  onClose: () => void;
  result: GenerationResult;
  onSave: (shots: Shot[]) => void;
}) {
  const defaultPrompt = `整体风格: 电影质感，恐怖奇幻与希腊神话史诗风格的结合，开场是温馨餐厅的暖色调，后半段是宏伟宫殿的明亮金色调，充满戏剧性和视觉冲击力。

分镜1 (00:00-00:01):
[00:00] 中景：在一个灯光温暖的美式餐厅里，一个金发碧眼、扎着双马尾、戴着粉色蝴蝶结的小女孩，穿着可爱的粉色蕾丝公主裙，她正直视镜头，面无表情地举起一个鸡腿。

分镜2 (00:01-00:04):
[00:01] 特写镜头：镜头聚焦于女孩的后脑勺，她的一只手掀起金色假发，露出下面一张布满尖牙、血淋淋的怪物嘴巴。另一只手将鸡腿塞进这个嘴里，嘴巴贪婪地咀嚼。`;

  const [shots, setShots] = useState<Shot[]>(() => [
    { id: "shot-1", prompt: defaultPrompt, duration: 5, referenceImage: "https://picsum.photos/seed/s1/320/180", status: "completed", videoUrl: "https://picsum.photos/seed/v1/320/180", history: [
      { id: "h1", videoUrl: "https://picsum.photos/seed/h1/320/180", prompt: defaultPrompt, duration: 5, createTime: "2026-03-20 10:30" },
      { id: "h2", videoUrl: "https://picsum.photos/seed/h2/320/180", prompt: defaultPrompt + " (旧版本)", duration: 5, createTime: "2026-03-19 15:20" },
      { id: "h3", videoUrl: "https://picsum.photos/seed/h3/320/180", prompt: defaultPrompt + " (更早版本)", duration: 5, createTime: "2026-03-18 09:10" },
    ]},
    { id: "shot-2", prompt: defaultPrompt, duration: 5, referenceImage: "https://picsum.photos/seed/s2/320/180", status: "generating", progress: 65 },
    { id: "shot-3", prompt: defaultPrompt, duration: 5, referenceImage: "https://picsum.photos/seed/s3/320/180", status: "failed", errorMessage: "GPU资源不足，请稍后重试" },
    { id: "shot-4", prompt: defaultPrompt, duration: 5, referenceImage: "https://picsum.photos/seed/s4/320/180", status: "pending" },
  ]);

  const [videoModel, setVideoModel] = useState("seedance_2.0");
  const [imageModel, setImageModel] = useState("jimeng_5.0");
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [generatingShotId, setGeneratingShotId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [historyShotId, setHistoryShotId] = useState<string | null>(null);
  const [restoreConfirm, setRestoreConfirm] = useState<{ shotId: string; item: any } | null>(null);
  const [deleteHistoryConfirm, setDeleteHistoryConfirm] = useState<{ shotId: string; itemId: string } | null>(null);
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [editingShotId, setEditingShotId] = useState<string | null>(null);
  const [isEditingImagePrompt, setIsEditingImagePrompt] = useState(false);
  const [referenceImages, setReferenceImages] = useState<string[]>([
    "https://picsum.photos/seed/ref1/200/200",
    "https://picsum.photos/seed/ref2/200/200",
    "https://picsum.photos/seed/ref3/200/200",
  ]);
  const [voiceRemovalOpen, setVoiceRemovalOpen] = useState(false);

  const handleVideoModelChange = (value: string | null) => setVideoModel(value || "seedance_2.0");
  const handleImageModelChange = (value: string | null) => setImageModel(value || "jimeng_5.0");

  const updateShot = (id: string, updates: Partial<Shot>) => {
    setShots((prev) => prev.map((shot) => (shot.id === id ? { ...shot, ...updates } : shot)));
  };

  // 删除历史记录
  const deleteHistoryItem = (shotId: string, itemId: string) => {
    setShots((prev) => prev.map((shot) => shot.id === shotId ? { ...shot, history: shot.history?.filter(h => h.id !== itemId) } : shot));
  };

  // 生成图片
  const generateImage = () => {
    if (!imagePrompt.trim()) return;
    setGeneratingImage(true);
    setTimeout(() => {
      const newImage = `https://picsum.photos/seed/gen${Date.now()}/200/200`;
      setGeneratedImages(prev => [...prev, newImage]);
      setGeneratingImage(false);
      // 显示成功提示
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }, 2000);
  };

  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // 删除生成的图片
  const deleteGeneratedImage = (index: number) => {
    setGeneratedImages(prev => prev.filter((_, i) => i !== index));
  };

  // 处理提示词输入，检测 @ 符号
  const handlePromptChange = (shotId: string, value: string, cursorPos: number) => {
    updateShot(shotId, { prompt: value });

    // 检测是否输入了 @
    const lastChar = value[cursorPos - 1];
    const beforeChar = value[cursorPos - 2];

    if (lastChar === "@" && beforeChar !== "@") {
      setEditingShotId(shotId);
      setShowImagePicker(true);
    } else if (lastChar !== "@" && !showImagePicker) {
      // 如果用户删除了 @，关闭选择器
    }
  };

  // 插入图片引用
  const insertImageReference = (type: "reference" | "generated", index: number) => {
    if (!editingShotId) return;

    const shot = shots.find(s => s.id === editingShotId);
    if (!shot) return;

    // 计算图片编号：参考图从1开始，生成图接着参考图编号
    const imageNum = type === "reference" ? index + 1 : referenceImages.length + index + 1;
    const imageRef = `@图${imageNum}`;

    // 在 @ 位置插入引用
    const cursorPos = shot.prompt.lastIndexOf("@");
    if (cursorPos !== -1) {
      const newPrompt = shot.prompt.substring(0, cursorPos) + imageRef + shot.prompt.substring(cursorPos + 1);
      updateShot(editingShotId, { prompt: newPrompt });
    }

    setShowImagePicker(false);
    setEditingShotId(null);
  };

  // 关闭图片选择器
  const closeImagePicker = () => {
    setShowImagePicker(false);
    setEditingShotId(null);
    setIsEditingImagePrompt(false);
  };

  // 处理生图提示词输入，检测 @ 符号
  const handleImagePromptChange = (value: string) => {
    setImagePrompt(value);
    const cursorPos = value.length;
    const lastChar = value[cursorPos - 1];
    const beforeChar = value[cursorPos - 2];
    if (lastChar === "@" && beforeChar !== "@") {
      setIsEditingImagePrompt(true);
      setShowImagePicker(true);
    }
  };

  // 插入图片引用到生图提示词
  const insertImageRefToImagePrompt = (type: "reference" | "generated", index: number) => {
    const imageNum = type === "reference" ? index + 1 : referenceImages.length + index + 1;
    const imageRef = `@图${imageNum}`;
    const cursorPos = imagePrompt.lastIndexOf("@");
    if (cursorPos !== -1) {
      const newPrompt = imagePrompt.substring(0, cursorPos) + imageRef + imagePrompt.substring(cursorPos + 1);
      setImagePrompt(newPrompt);
    }
    setShowImagePicker(false);
    setIsEditingImagePrompt(false);
  };

  const generateSingleShot = (shotId: string) => {
    const shot = shots.find(s => s.id === shotId);
    if (!shot) return;

    // 检查历史记录数量，超过9条时提示用户先删除
    if (shot.history && shot.history.length >= 9) {
      setHistoryShotId(shotId);
      return;
    }

    // 生成前保存当前版本到历史记录
    if (shot.videoUrl || shot.prompt) {
      const newHistoryItem: VideoHistoryItem = {
        id: `h${Date.now()}`,
        videoUrl: shot.videoUrl || "",
        prompt: shot.prompt,
        duration: shot.duration,
        createTime: new Date().toLocaleString("zh-CN"),
      };
      setShots((prev) => prev.map((s) => s.id === shotId ? { ...s, history: [...(s.history || []), newHistoryItem] } : s));
    }

    setGeneratingShotId(shotId);
    setTimeout(() => {
      setShots((prev) => prev.map((shot) => shot.id === shotId ? { ...shot, status: "generating" as VideoGenerationStatus, progress: 0 } : shot));
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        if (progress >= 100) {
          clearInterval(interval);
          setShots((prev) => prev.map((shot) => shot.id === shotId ? { ...shot, status: "completed" as VideoGenerationStatus, progress: 100, videoUrl: `https://picsum.photos/seed/${shotId}/640/360` } : shot));
          setGeneratingShotId(null);
        } else {
          setShots((prev) => prev.map((shot) => shot.id === shotId ? { ...shot, progress } : shot));
        }
      }, 500);
    }, 500);
  };

  const generateAllShots = () => {
    shots.forEach((shot, index) => { setTimeout(() => generateSingleShot(shot.id), index * 1000); });
  };

  const handleSave = () => { onSave(shots); onClose(); };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[95%] !max-w-[95%] flex flex-col">
        <SheetHeader className="py-3"><SheetTitle className="text-base">编辑分镜v2 - 结果 {result.id}</SheetTitle></SheetHeader>
        <div className="mt-2 flex-1 flex gap-6 overflow-hidden">
          <div className="flex-1 min-w-0 overflow-y-auto space-y-6 pl-2">
            <h3 className="font-semibold text-lg">分镜列表 ({shots.length})</h3>
            {shots.map((shot, index) => (
              <div key={shot.id} className="relative">
                {/* 分镜卡片 */}
                <div className={`border-2 border-gray-200 rounded-xl overflow-hidden bg-white ${shot.status === "completed" ? "border-l-4 border-l-green-500" : shot.status === "generating" ? "border-l-4 border-l-blue-500" : shot.status === "failed" ? "border-l-4 border-l-red-500" : "border-l-4 border-l-gray-300"}`}>
                  {/* 分镜头部 */}
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-800">分镜 {index + 1}</span>
                      <StatusBadge status={shot.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      {shot.history && shot.history.length > 0 && (
                        <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => setHistoryShotId(shot.id)}>
                          📜 历史版本 ({shot.history.length})
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500" onClick={() => setDeleteConfirmId(shot.id)} title="删除分镜">🗑️</Button>
                    </div>
                  </div>
                  {/* 分镜内容 */}
                  <div className="p-4 flex gap-4">
                    <div className="w-32 flex-shrink-0">
                      <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden relative">
                        {shot.status === "completed" && shot.videoUrl ? (
                          <div className="w-full h-full cursor-pointer relative group" onClick={() => setPreviewVideo(shot.videoUrl!)}>
                            <video src={shot.videoUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-6 h-6 text-gray-700 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                              </div>
                            </div>
                          </div>
                        ) : shot.status === "generating" ? (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <span className="text-sm text-gray-500">生成中...</span>
                          </div>
                        ) : shot.status === "failed" ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4">
                            <span className="text-red-500 text-sm mb-2">生成失败</span>
                            <span className="text-xs text-gray-500 text-center">模型识别到内容可能违反了安全政策（如版权受限、暴力、成人内容或特定人物肖像）,请修改图片或提示词</span>
                            <span className="text-xs text-blue-500 text-center mt-1 underline cursor-pointer">查看解决方案</span>
                          </div>
                        ) : shot.status === "pending" ? (
                          <div className="w-full h-full flex items-center justify-center text-gray-400"><span className="text-sm">暂未生成视频</span></div>
                        ) : shot.referenceImage ? (
                          <img src={shot.referenceImage} alt={`分镜${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400"><span className="text-sm">待生成</span></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="relative">
                        <Label className="text-sm text-gray-600">分镜提示词</Label>
                        <Textarea
                          value={shot.prompt}
                          onChange={(e) => {
                            const cursorPos = e.target.selectionStart;
                            handlePromptChange(shot.id, e.target.value, cursorPos);
                          }}
                          onSelect={(e) => {
                            const cursorPos = (e.target as HTMLTextAreaElement).selectionStart;
                            handlePromptChange(shot.id, shot.prompt, cursorPos);
                          }}
                          rows={4}
                          className={`mt-1 ${shot.status === "generating" ? "bg-gray-50 opacity-60" : ""}`}
                          placeholder="描述这个分镜的内容... 输入 @ 插入图片"
                          disabled={shot.status === "generating"}
                        />
                        {/* @ 图片选择器弹出层 - Dialog 形式 */}
                        <Dialog open={showImagePicker && editingShotId === shot.id} onOpenChange={(open) => {
                          if (!open) closeImagePicker();
                        }}>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>选择参考图</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              {/* 参考图 */}
                              {referenceImages.length > 0 && (
                                <div className="mb-4">
                                  <div className="text-xs text-gray-500 mb-2">参考图</div>
                                  <div className="grid grid-cols-4 gap-2">
                                    {referenceImages.map((img, i) => {
                                      return (
                                        <button
                                          key={`ref-${i}`}
                                          onClick={() => { insertImageReference("reference", i); closeImagePicker(); }}
                                          className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all cursor-pointer"
                                        >
                                          <img src={img} alt={`参考图${i + 1}`} className="w-full h-full object-cover" />
                                          <div className="absolute bottom-0 left-0 right-0 text-center text-xs py-0.5 bg-black/60 text-white">
                                            @图{i + 1}
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              {/* 生成的图片 */}
                              {generatedImages.length > 0 && (
                                <div>
                                  <div className="text-xs text-gray-500 mb-2">生成的图片</div>
                                  <div className="grid grid-cols-4 gap-2">
                                    {generatedImages.map((img, i) => {
                                      const imageNum = referenceImages.length + i + 1;
                                      return (
                                        <button
                                          key={`gen-${i}`}
                                          onClick={() => { insertImageReference("generated", i); closeImagePicker(); }}
                                          className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all cursor-pointer"
                                        >
                                          <img src={img} alt={`生成图${i + 1}`} className="w-full h-full object-cover" />
                                          <div className="absolute bottom-0 left-0 right-0 text-center text-xs py-0.5 bg-black/60 text-white">
                                            @图{imageNum}
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              {referenceImages.length === 0 && generatedImages.length === 0 && (
                                <div className="text-center py-8 text-gray-400">暂无图片，请先在右侧添加参考图或生成图片</div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">时长:</span>
                          <Select value={shot.duration.toString()} onValueChange={(v) => updateShot(shot.id, { duration: parseInt(v || "5") })} disabled={shot.status === "generating"}>
                            <SelectTrigger className={`w-28 h-8 ${shot.status === "generating" ? "bg-gray-50 opacity-60" : ""}`}><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {videoModel === "seedance_2.0" ? [4,5,6,7,8,9,10,11,12,13,14,15].map((d) => <SelectItem key={d} value={d.toString()}>{d}秒</SelectItem>) : (<><SelectItem value="5">5秒</SelectItem><SelectItem value="10">10秒</SelectItem></>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="outline" size="sm" disabled={shot.status === "generating"} className={shot.status === "generating" ? "opacity-60" : ""}>✨ 优化提示词</Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => generateSingleShot(shot.id)} disabled={shot.status === "generating"}>{shot.status === "generating" ? "生成中..." : `生成视频 (${videoModel === "seedance_2.0" ? 10 : 8}积分)`}</Button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 插入分镜按钮 */}
                <div className="flex justify-center my-4">
                  <Button variant="outline" size="sm" className="bg-white border-dashed text-gray-500 hover:text-gray-600 hover:border-gray-400" onClick={() => { const newShot = { id: `shot-${Date.now()}`, prompt: "新分镜提示词...", duration: 5, status: "pending" as const }; const newShots = [...shots]; newShots.splice(index + 1, 0, newShot); setShots(newShots); }}>
                    + 插入新分镜
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="w-96 flex-shrink-0 space-y-4 overflow-y-auto">
            {/* 生视频配置 */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3 border-t-4 border-blue-500">
              <h4 className="font-medium">生视频配置</h4>
              <div><Label className="text-sm text-gray-600">视频模型</Label><Select value={videoModel} onValueChange={handleVideoModelChange}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="seedance_2.0">Seedance 2.0</SelectItem><SelectItem value="wan_2.6">Wan 2.6</SelectItem></SelectContent></Select></div>
              <div className="text-xs text-gray-500">将生成 {shots.filter(s => s.status !== "completed").length} 个分镜视频</div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={generateAllShots} disabled={shots.filter(s => s.status !== "completed").length === 0}>批量生成全部 ({shots.filter(s => s.status !== "completed").length * (videoModel === "seedance_2.0" ? 10 : 8)} 积分)</Button>
            </div>
            {/* 参考图管理 - 合并手动上传和AI生成 */}
            <div className="mt-4 bg-gray-50 p-4 rounded-lg space-y-4 border-t-4 border-green-500">
              <h4 className="font-medium">参考图管理</h4>
              <div className="text-xs text-gray-500">提示：在提示词中使用 @ 引用参考图，如 "@图1"</div>

              {/* 统一的图片展示区域 - 合并参考图和生成图 */}
              {/* 成功提示 */}
              {showSuccessToast && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                  <span className="text-green-500">✓</span> 图片生成成功，已添加到图片列表
                </div>
              )}
              <div className="grid grid-cols-4 gap-2">
                {/* 手动上传的参考图 */}
                {referenceImages.map((img, i) => (
                  <div key={`ref-${i}`} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group cursor-pointer" onClick={() => setPreviewImage(img)}>
                    <img src={img} alt={`图${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="destructive" size="sm" className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600" onClick={(e) => { e.stopPropagation(); setReferenceImages(prev => prev.filter((_, idx) => idx !== i)); }}>
                        ✕
                      </Button>
                    </div>
                    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded">@图{i + 1}</div>
                  </div>
                ))}
                {/* AI生成的图片 */}
                {generatedImages.map((img, i) => {
                  const imageNum = referenceImages.length + i + 1;
                  return (
                    <div key={`gen-${i}`} className="aspect-square bg-purple-50 rounded-lg overflow-hidden relative group cursor-pointer border border-purple-200" onClick={() => setPreviewImage(img)}>
                      <img src={img} alt={`图${imageNum}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="destructive" size="sm" className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600" onClick={(e) => { e.stopPropagation(); deleteGeneratedImage(i); }}>
                          ✕
                        </Button>
                      </div>
                      <div className="absolute bottom-1 left-1 bg-purple-600 text-white text-xs px-1 rounded">@图{imageNum}</div>
                    </div>
                  );
                })}
                {/* 添加按钮 */}
                {referenceImages.length + generatedImages.length < 12 && (
                  <button className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center text-gray-400 hover:text-gray-500" onClick={() => setReferenceImages(prev => [...prev, `https://picsum.photos/seed/ref${Date.now()}/200/200`])}>
                    +
                  </button>
                )}
              </div>
              {referenceImages.length === 0 && generatedImages.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-sm">暂无参考图，点击 + 添加或使用AI生成</div>
              )}

              {/* AI生成区域 */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-purple-600">AI生成参考图</span>
                </div>
                <div><Label className="text-sm text-gray-600">图片模型</Label><Select value={imageModel} onValueChange={handleImageModelChange}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="jimeng_5.0">即梦5.0</SelectItem><SelectItem value="nabo_banana">nabo banana</SelectItem></SelectContent></Select></div>
                <div className="relative">
                  <Label className="text-sm text-gray-600">生图提示词</Label>
                  <Textarea
                    value={imagePrompt}
                    onChange={(e) => handleImagePromptChange(e.target.value)}
                    rows={4}
                    className="mt-1"
                    placeholder="填写生图提示词... 输入 @ 插入图片"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-purple-600" onClick={() => setImagePrompt("景别:\n视角:\n构图:\n时间:\n氛围:\n主体:")}>📝 模板</Button>
                  <Button className="bg-purple-600 hover:bg-purple-700 flex-1" onClick={generateImage} disabled={generatingImage || !imagePrompt.trim()}>{generatingImage ? "生成中..." : `生成图片 (${imageModel === "jimeng_5.0" ? 5 : 8}积分)`}</Button>
                </div>
              </div>
            </div>
            {/* 参考视频 */}
            <div className="mt-4 bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium">参考视频</h4>
              <div className="text-xs text-gray-500 mb-2">任务创建时选择的参考视频</div>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {result.referenceVideo ? (
                  <img src={result.referenceVideo.thumbnail || "https://picsum.photos/seed/refv/320/180"} alt="参考视频" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-sm">未选择参考视频</span>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600">{result.referenceVideo?.name || "未设置"}</div>
            </div>
          </div>
        </div>
        {/* 抽屉底部操作栏 */}
        <div className="border-t bg-white px-6 py-4 flex justify-end items-center gap-3">
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setVoiceRemovalOpen(true)}>去配音</Button>
        </div>
      </SheetContent>
      {/* 去配音抽屉 */}
      <VoiceRemovalDrawer open={voiceRemovalOpen} onClose={() => setVoiceRemovalOpen(false)} result={result} />
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>删除分镜？</DialogTitle><DialogDescription>删除后，该分镜下的视频、提示词等素材将被清空且无法找回。</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>保留分镜</Button>
            <Button onClick={() => { if (deleteConfirmId) { setShots((prev) => prev.filter((s) => s.id !== deleteConfirmId)); setDeleteConfirmId(null); } }} className="bg-red-500 hover:bg-red-600 text-white">确认删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 恢复历史版本确认对话框 */}
      <Dialog open={!!restoreConfirm} onOpenChange={() => setRestoreConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>恢复此版本？</DialogTitle><DialogDescription>确定要恢复该历史版本吗？当前内容将被替换。</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreConfirm(null)}>取消</Button>
            <Button onClick={() => { if (restoreConfirm) { updateShot(restoreConfirm.shotId, { prompt: restoreConfirm.item.prompt, videoUrl: restoreConfirm.item.videoUrl }); setRestoreConfirm(null); setHistoryShotId(null); } }} className="bg-blue-500 hover:bg-blue-600 text-white">确认恢复</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 删除历史记录确认对话框 */}
      <Dialog open={!!deleteHistoryConfirm} onOpenChange={() => setDeleteHistoryConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>删除此历史版本？</DialogTitle><DialogDescription>删除后无法找回，请确认。</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteHistoryConfirm(null)}>取消</Button>
            <Button onClick={() => { if (deleteHistoryConfirm) { deleteHistoryItem(deleteHistoryConfirm.shotId, deleteHistoryConfirm.itemId); setDeleteHistoryConfirm(null); } }} className="bg-red-500 hover:bg-red-600 text-white">确认删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 历史版本对话框 */}
      <Dialog open={!!historyShotId} onOpenChange={() => setHistoryShotId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>历史版本</DialogTitle></DialogHeader>
          <div className="text-xs text-gray-500 mb-2">历史记录（不含当前使用）最多保存9条，超出后需先删除旧记录才能生成新视频，请及时下载保存</div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {/* 当前使用 */}
            {historyShotId && (() => {
              const shot = shots.find(s => s.id === historyShotId);
              return shot?.videoUrl || shot?.prompt ? (
                <div className="flex gap-4 p-3 border-2 border-green-400 rounded-lg bg-green-50">
                  <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-green-500 relative" onClick={() => setPreviewVideo(shot.videoUrl || null)}>
                    <img src={shot.videoUrl || ""} alt="当前使用" className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1 rounded">{shot.duration}秒</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-green-600 flex items-center gap-2">
                      <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded">当前使用</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{shot.prompt.length > 50 ? shot.prompt.substring(0, 50) + "..." : shot.prompt}</div>
                  </div>
                </div>
              ) : null;
            })()}
            {/* 历史版本列表 */}
            {historyShotId && shots.find(s => s.id === historyShotId)?.history?.map((item, idx) => (
              <div key={item.id} className="flex gap-4 p-3 border rounded-lg hover:bg-gray-50">
                <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 relative" onClick={() => setPreviewVideo(item.videoUrl)}>
                  <img src={item.videoUrl} alt={`版本${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1 rounded">{item.duration}秒</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600">版本 {shots.find(s => s.id === historyShotId)!.history!.length - idx}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{item.prompt.length > 50 ? item.prompt.substring(0, 50) + "..." : item.prompt}</div>
                  <button className="text-xs text-blue-500 hover:underline mt-1" onClick={() => setExpandedPrompt(expandedPrompt === item.id ? null : item.id)}>{expandedPrompt === item.id ? "收起" : "查看全部"}</button>
                  {expandedPrompt === item.id && <div className="mt-2 p-2 bg-gray-100 rounded text-xs whitespace-pre-wrap">{item.prompt}</div>}
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" onClick={() => historyShotId && setRestoreConfirm({ shotId: historyShotId, item })}>恢复此版本</Button>
                  <Button variant="ghost" size="sm" className="text-gray-500">复制提示词</Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => historyShotId && setDeleteHistoryConfirm({ shotId: historyShotId, itemId: item.id })}>删除</Button>
                </div>
              </div>
            ))}
            {historyShotId && shots.find(s => s.id === historyShotId)?.history?.length === 0 && (
              <div className="text-center py-8 text-gray-400">暂无历史版本</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* 视频预览对话框 */}
      <Dialog open={!!previewVideo} onOpenChange={() => setPreviewVideo(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>视频预览</DialogTitle></DialogHeader>
          <div className="flex justify-center">
            {previewVideo && <div className="aspect-[9/16] w-full max-w-[280px] mx-auto"><video src={previewVideo} className="w-full h-full object-contain" controls /></div>}
          </div>
        </DialogContent>
      </Dialog>
      {/* 图片预览对话框 */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>图片预览</DialogTitle></DialogHeader>
          <div className="flex justify-center">
            {previewImage && <img src={previewImage} alt="预览" className="max-w-full max-h-[60vh] object-contain rounded-lg" />}
          </div>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}

// 去配音抽屉组件
function VoiceRemovalDrawer({ open, onClose, result }: {
  open: boolean;
  onClose: () => void;
  result: GenerationResult;
}) {
  const [activeTab, setActiveTab] = useState<"original" | "custom">("original");
  const [customNarration, setCustomNarration] = useState("");
  const [aiOptions, setAiOptions] = useState<{ text: string }[]>([]);
  const [hasGeneratedAi, setHasGeneratedAi] = useState(false);
  const [aiHistory, setAiHistory] = useState<{ text: string; time: string }[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedNarration, setSelectedNarration] = useState(result.narrationText || "");
  const [voice, setVoice] = useState("女声-活泼");
  const [voiceSpeed, setVoiceSpeed] = useState("1.0x");
  const [emotion, setEmotion] = useState("开心");
  const [subtitleStyle, setSubtitleStyle] = useState<"with" | "without">("with");
  const [bgMusic, setBgMusic] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // 切换Tab时，如果自定义旁白为空则带入原文案
  useEffect(() => {
    if (activeTab === "custom" && !customNarration && result.narrationText) {
      setCustomNarration(result.narrationText);
    }
  }, [activeTab]);

  // 音色选项
  const voiceOptions = [
    { value: "女声-活泼", label: "女声-活泼" },
    { value: "女声-温柔", label: "女声-温柔" },
    { value: "女声-知性", label: "女声-知性" },
    { value: "男声-磁性的", label: "男声-磁性的" },
    { value: "男声-低沉", label: "男声-低沉" },
    { value: "童声", label: "童声" },
  ];

  // 语速选项
  const speedOptions = ["0.5x", "0.75x", "1.0x", "1.25x", "1.5x", "2.0x"];

  // 情绪选项
  const emotionOptions = ["开心", "悲伤", "激动", "平静", "紧张", "搞笑"];

  // 旁白风格类型
  const narrationStyles = ["情感型", "叙事型", "搞笑型", "悬疑型", "热血型", "浪漫型"];

  // 处理拖拽上传
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("audio/")) {
      setBgMusic(files[0]);
    }
  };

  // 显示toast提示
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  // 模拟AI生成3条旁白
  const handleAIGenerate = () => {
    if (!result.narrationText?.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      // 保存当前选项到历史
      if (aiOptions.length > 0) {
        const newHistory = aiOptions.map(opt => ({
          text: opt.text,
          time: new Date().toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
        }));
        setAiHistory(prev => [...newHistory, ...prev]);
      }

      // 生成3条旁白
      const baseText = result.narrationText || "";
      const newOptions = [
        { text: `${baseText}（版本1：情感增强）` },
        { text: `${baseText}（版本2：叙事优化）` },
        { text: `${baseText}（版本3：趣味改编）` },
      ];
      setAiOptions(newOptions);
      setHasGeneratedAi(true);
      setIsGenerating(false);
    }, 1500);
  };

  // 获取当前Tab的旁白文本
  const getCurrentNarration = () => {
    if (activeTab === "original") return result.narrationText || "";
    if (activeTab === "custom") return customNarration;
    return "";
  };

  // 处理保存
  const handleSave = () => {
    // 保存逻辑
    console.log({
      narrationType: activeTab,
      narrationText: selectedNarration,
      voice,
      voiceSpeed,
      emotion,
      subtitleStyle,
      bgMusic: bgMusic?.name,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[95%] !max-w-[95%] flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>去配音</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* 左侧：视频预览 */}
          <div className="w-2/5 border-r bg-gray-50 flex items-center justify-center p-4">
            <div className="aspect-[9/16] w-full max-w-[280px] bg-black rounded-lg overflow-hidden shadow-lg">
              {result.videoUrl ? (
                <video
                  src={result.videoUrl}
                  className="w-full h-full object-cover"
                  controls
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  暂无视频预览
                </div>
              )}
            </div>
          </div>

          {/* 右侧：编辑区 */}
          <div className="flex-1 overflow-y-auto">
            {/* 第一区块：旁白文案 */}
            <div className="p-5 border-b border-gray-100">
              <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-4">
                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                旁白文案
              </h4>

              {/* Tabs */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setActiveTab("original")}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === "original"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  {activeTab === "original" && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                  原旁白
                  {selectedNarration === result.narrationText && (
                    <span className="text-xs text-green-600 ml-1">✓</span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("custom")}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === "custom"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  {activeTab === "custom" && <span className="w-2 h-2 bg-purple-500 rounded-full"></span>}
                  自定义旁白
                  {activeTab === "custom" && customNarration && (
                    <span className="text-xs text-green-600 ml-1">✓</span>
                  )}
                </button>
              </div>

              {/* 原旁白内容 */}
              {activeTab === "original" && (
                <div
                  onClick={() => setSelectedNarration(result.narrationText || "")}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedNarration === result.narrationText
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">原文案</span>
                    <span className="text-xs text-gray-400">{result.narrationText?.length || 0} 字</span>
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {result.narrationText || "暂无原旁白文案"}
                  </div>
                </div>
              )}

              {/* 自定义旁白内容 */}
              {activeTab === "custom" && (
                <div className="space-y-3">
                  {/* AI生成按钮 + 历史记录按钮 */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAIGenerate}
                      disabled={!result.narrationText?.trim() || isGenerating}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      {isGenerating ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                          AI生成中...
                        </>
                      ) : (
                        <>
                          <span className="mr-1">✨</span>
                          {hasGeneratedAi ? "重新生成" : "基于原旁白，AI生成3条旁白"}
                        </>
                      )}
                    </Button>
                    {aiHistory.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => setShowHistoryModal(true)}
                        className="border-purple-300 text-purple-600 hover:bg-purple-50"
                      >
                        历史记录 ({aiHistory.length})
                      </Button>
                    )}
                  </div>

                  {/* AI结果列表 - 可滚动区域 */}
                  {aiOptions.length > 0 && (
                    <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-100 rounded-lg p-2">
                      {aiOptions.map((opt, idx) => (
                        <div
                          key={`current-${idx}`}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            customNarration === opt.text
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:border-purple-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-purple-600">结果{idx + 1}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">{opt.text.length} 字</span>
                              <span className="text-xs text-purple-600 hover:text-purple-700 cursor-pointer"
                                onClick={() => { setCustomNarration(opt.text); showToast("已复制到编辑框"); }}>
                                复制
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 whitespace-pre-wrap">
                            {opt.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 自定义编辑框 */}
                  <div className="relative">
                    <Textarea
                      value={customNarration}
                      onChange={(e) => setCustomNarration(e.target.value)}
                      placeholder="点击上方AI结果复制，或手动输入..."
                      rows={4}
                      className="resize-none pr-12"
                    />
                    <span className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {customNarration.length} 字
                    </span>
                  </div>
                </div>
              )}

              {/* 历史记录弹框 */}
              <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
                <DialogContent className="max-w-lg max-h-[70vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>历史记录 ({aiHistory.length})</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {aiHistory.length > 0 ? (
                      aiHistory.map((item, idx) => (
                        <div
                          key={`history-modal-${idx}`}
                          className={`p-3 rounded-lg border transition-all ${
                            customNarration === item.text
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:border-purple-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">历史版本 {item.text.length}字</span>
                            <span className="text-xs text-gray-400">{item.time}</span>
                          </div>
                          <div className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-3 mb-2">
                            {item.text}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCustomNarration(item.text);
                              setShowHistoryModal(false);
                              showToast("已复制到编辑框");
                            }}
                            className="h-7 text-xs w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                          >
                            复制到编辑框
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        暂无历史记录
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* 第二区块：配音参数 */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                配音设置
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">音色</Label>
                    <Select value={voice} onValueChange={(v) => setVoice(v || "")}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {voiceOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">倍速</Label>
                    <Select value={voiceSpeed} onValueChange={(v) => setVoiceSpeed(v || "1.0x")}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {speedOptions.map((speed) => (
                          <SelectItem key={speed} value={speed}>
                            {speed}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">情绪</Label>
                    <Select value={emotion} onValueChange={(v) => setEmotion(v || "开心")}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {emotionOptions.map((emo) => (
                          <SelectItem key={emo} value={emo}>
                            {emo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 h-10">
                  <span className="mr-2">🎵</span>
                  生成配音
                </Button>
              </div>
            </div>

            {/* 第三区块：视频效果 */}
            <div className="p-5">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                视频效果
              </h4>
              <div className="space-y-4">
                {/* 字幕样式 */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">字幕</Label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSubtitleStyle("with")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 transition-all text-sm ${
                        subtitleStyle === "with"
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      <span>📝</span>
                      <span className="font-medium">有字幕</span>
                    </button>
                    <button
                      onClick={() => setSubtitleStyle("without")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 transition-all text-sm ${
                        subtitleStyle === "without"
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      <span>📄</span>
                      <span className="font-medium">无字幕</span>
                    </button>
                  </div>
                </div>

                {/* 背景音乐 */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">背景音乐</Label>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      bgMusic
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                    }`}
                  >
                    {bgMusic ? (
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-2xl">🎵</span>
                        <div className="text-left flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate">{bgMusic.name}</div>
                          <div className="text-xs text-gray-500">
                            {(bgMusic.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setBgMusic(null)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-4">
                        <span className="text-3xl">🎧</span>
                        <div className="text-left">
                          <div className="text-sm text-gray-600">拖拽音频到此处</div>
                          <div className="text-xs text-gray-400 mt-0.5">或</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-orange-300 text-orange-600 hover:bg-orange-50"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "audio/*";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) setBgMusic(file);
                            };
                            input.click();
                          }}
                        >
                          选择文件
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="border-t bg-white px-6 py-4 flex justify-end items-center gap-3">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            保存
          </Button>
        </div>

        {/* Toast提示 */}
        {toast && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50"
            style={{ animation: "fadeIn 0.2s ease-out" }}>
            {toast}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ResultCard({ result, index, onDelete, onEdit, onEditV2, onCopy }: { result: GenerationResult; index: number; onDelete: (id: string) => void; onEdit: (result: GenerationResult) => void; onEditV2: (result: GenerationResult) => void; onCopy: (result: GenerationResult) => void; }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 flex gap-4">
        {/* 左侧视频预览区域 - 9:16 */}
        <div className="w-1/3 flex-shrink-0">
          <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden relative">
            {result.status === "completed" && result.videoUrl ? (
              <video src={result.videoUrl} className="w-full h-full object-cover" controls />
            ) : result.status === "generating" ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <span className="text-sm text-gray-500">生成中...</span>
              </div>
            ) : result.status === "failed" ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <span className="text-red-500 text-sm mb-2">生成失败</span>
                <span className="text-xs text-gray-500 text-center">模型识别到内容可能违反了安全政策</span>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 p-2">
                <div className="text-center">
                  <div className="text-xs">暂未生成</div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* 右侧内容区域 */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">{result.name}</span>
            <StatusBadge status={result.status} />
          </div>
          {/* 已生成状态 */}
          {result.status === "completed" && (
            <>
              <div>
                <div className="text-xs text-gray-500 mb-1">旁白文案</div>
                <div className="text-sm bg-gray-50 p-2 rounded line-clamp-2">{result.narrationText}</div>
              </div>
              <div className="flex gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">音色</div>
                  <div className="text-sm">{result.voice}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">情绪</div>
                  <div className="text-sm">{result.emotion}</div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => onDelete(result.id)}>删除</Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className={copied ? "text-green-600 border-green-200 bg-green-50" : ""}
                >
                  {copied ? "已复制" : "复制"}
                </Button>
                <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100" onClick={() => onEditV2(result)}>编辑</Button>
                <Button variant="outline" size="sm" className="flex-1">保存为作品</Button>
              </div>
            </>
          )}
          {/* 生成中状态 */}
          {result.status === "generating" && (
            <>
              <div>
                <div className="text-xs text-gray-500 mb-1">提示词</div>
                <div className="text-sm bg-gray-50 p-2 rounded line-clamp-3">{result.prompt}</div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => onDelete(result.id)}>删除</Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className={copied ? "text-green-600 border-green-200 bg-green-50" : ""}
                >
                  {copied ? "已复制" : "复制"}
                </Button>
                <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100" onClick={() => onEditV2(result)}>编辑</Button>
              </div>
            </>
          )}
          {/* 未开始/失败状态 */}
          {(result.status === "pending" || result.status === "failed") && (
            <>
              <div>
                <div className="text-xs text-gray-500 mb-1">提示词</div>
                <div className="text-sm bg-gray-50 p-2 rounded line-clamp-3">{result.prompt}</div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => onDelete(result.id)}>删除</Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className={copied ? "text-green-600 border-green-200 bg-green-50" : ""}
                >
                  {copied ? "已复制" : "复制"}
                </Button>
                <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100" onClick={() => onEditV2(result)}>编辑</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

function TaskCreationTab({ task, isEditing = false, onCreated }: { task: GenerationTask; isEditing?: boolean; onCreated?: () => void }) {
  const [config, setConfig] = useState(task.config);
  const [direction, setDirection] = useState("角色");
  const [splitByShot, setSplitByShot] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // 模式四：生成前贴文案相关
  const [creativeDescriptions, setCreativeDescriptions] = useState<string[]>(config.creativeDescriptions || []);
  const [creativeCount, setCreativeCount] = useState(10);
  const [isGeneratingCreative, setIsGeneratingCreative] = useState(false);
  const [creativeEditingIndex, setCreativeEditingIndex] = useState<number | null>(null);
  const [creativeEditValue, setCreativeEditValue] = useState("");
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(new Set());

  // Mock AI 生成前贴文案（模式四）- 追加模式
  const MAX_TOTAL_ITEMS = 30;
  const handleGenerateCreativeDescriptions = () => {
    if (!config.originalNarration?.trim() || !config.requiredElements?.trim()) return;
    if (creativeDescriptions.length >= MAX_TOTAL_ITEMS) return;
    setIsGeneratingCreative(true);

    setTimeout(() => {
      const remainingSlots = MAX_TOTAL_ITEMS - creativeDescriptions.length;
      const countToGenerate = Math.min(creativeCount, remainingSlots);
      const currentLength = creativeDescriptions.length;

      const results = Array.from({ length: countToGenerate }, (_, i) =>
        `【版本${currentLength + i + 1}】${config.originalNarration}，保留要素：${config.requiredElements}，风格版本${currentLength + i + 1}`
      );

      // 追加到现有列表
      setCreativeDescriptions([...creativeDescriptions, ...results]);

      // 保留之前选中的，自动选中新追加的
      const newSelected = new Set(selectedIndexes);
      results.forEach((_, i) => newSelected.add(currentLength + i));
      setSelectedIndexes(newSelected);

      setIsGeneratingCreative(false);
    }, 1500);
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
    const newSelected = new Set(selectedIndexes);
    newSelected.delete(index);
    // 重新索引
    setSelectedIndexes(new Set(Array.from(newSelected).map(i => i > index ? i - 1 : i)));
  };

  const toggleSelectIndex = (index: number) => {
    const newSelected = new Set(selectedIndexes);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIndexes(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIndexes.size === creativeDescriptions.length) {
      setSelectedIndexes(new Set());
    } else {
      setSelectedIndexes(new Set(creativeDescriptions.map((_, i) => i)));
    }
  };

  return (
    <div className="max-w-3xl">
      <Card><CardContent className="p-6 space-y-6">
        {/* 生成模式选择 */}
        <div>
          <h3 className="text-lg font-semibold mb-4">生成模式</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setConfig({ ...config, generationMode: "video" })}
              className={`py-4 px-6 rounded-lg border-2 transition-colors ${
                config.generationMode === "video"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-medium text-lg">📹 参考生成视频</div>
              <div className="text-sm text-gray-500 mt-1">保留旁白故事，生成新视频</div>
            </button>
            <button
              type="button"
              onClick={() => setConfig({ ...config, generationMode: "text" })}
              className={`py-4 px-6 rounded-lg border-2 transition-colors ${
                config.generationMode === "text"
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-medium text-lg">✏️ 文案生成视频</div>
              <div className="text-sm text-gray-500 mt-1">输入前贴文案，生成视频</div>
            </button>
            <button
              type="button"
              onClick={() => setConfig({ ...config, generationMode: "narration" })}
              className={`py-4 px-6 rounded-lg border-2 transition-colors ${
                config.generationMode === "narration"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-medium text-lg">🎬 参考生成旁白</div>
              <div className="text-sm text-gray-500 mt-1">保留画面，重新生成旁白</div>
            </button>
            <button
              type="button"
              onClick={() => setConfig({ ...config, generationMode: "creative" })}
              className={`py-4 px-6 rounded-lg border-2 transition-colors ${
                config.generationMode === "creative"
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-medium text-lg">💡 生成前贴文案</div>
              <div className="text-sm text-gray-500 mt-1">输入原剧剧情，生成前贴文案</div>
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">基本信息</h3>
            {isEditing && <span className="text-xs text-gray-400">只读</span>}
          </div>
          <div className="grid grid-cols-2 gap-4"><div><Label>任务名称</Label><Input value={config.name} onChange={(e) => setConfig({ ...config, name: e.target.value })} className="mt-1" /></div>
        {/* 参考视频 - 仅在视频模式和旁白模式显示 */}
        {(config.generationMode === "video" || config.generationMode === "narration") && (
          <div><Label>参考视频</Label><div className={`mt-1 flex items-center gap-2 ${isEditing ? "opacity-60" : ""}`}>{config.referenceVideo && <img src={config.referenceVideo.thumbnail} alt="参考视频" className="w-16 h-10 object-cover rounded" />}<span className="text-sm">{config.referenceVideo?.name || "未选择"}</span></div></div>
        )}
        {/* 文字输入 - 仅在文字模式下显示 */}
        {config.generationMode === "text" && (
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-1">
              <Label>视频脚本</Label>
              {isEditing && <span className="text-xs text-gray-400">只读</span>}
            </div>
            <Textarea value={config.textPrompt || ""} onChange={(e) => setConfig({ ...config, textPrompt: e.target.value })} rows={3} className={`mt-1 ${isEditing ? "bg-gray-50 cursor-not-allowed" : ""}`} placeholder="输入视频描述或旁白文案，生成画面提示词" disabled={isEditing} />
          </div>
        )}
        {/* 模式三：旁白生成 - 原文案输入 */}
        {config.generationMode === "narration" && (
          <div className="col-span-2"><Label>原文案</Label><Textarea value={config.originalNarration || ""} onChange={(e) => setConfig({ ...config, originalNarration: e.target.value })} rows={3} className="mt-1" placeholder="请输入原始旁白文案..." /></div>
        )}
        {/* 模式四：生成前贴文案 - 原剧文案和需保留的要素 */}
        {config.generationMode === "creative" && (
          <>
            <div className="col-span-2"><Label>原剧文案</Label><Textarea value={config.originalNarration || ""} onChange={(e) => setConfig({ ...config, originalNarration: e.target.value })} rows={3} className="mt-1" placeholder="请输入前贴需要衔接的原剧剧情文案，30-60秒左右" /></div>
            <div className="col-span-2"><Label>需保留的要素</Label><Input value={config.requiredElements || ""} onChange={(e) => setConfig({ ...config, requiredElements: e.target.value })} className="mt-1" placeholder="请输入生成的前贴文案中，需要保留的要素，如「围绕小女孩，父亲，卖肉写」" /></div>
          </>
        )}
        </div></div>

        {/* 模式四：生成前贴文案 */}
        {config.generationMode === "creative" && (
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">前贴文案</h3>
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
                disabled={!config.originalNarration?.trim() || !config.requiredElements?.trim() || isGeneratingCreative || creativeDescriptions.length >= MAX_TOTAL_ITEMS}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isGeneratingCreative ? "生成中..." : creativeDescriptions.length >= MAX_TOTAL_ITEMS ? "已达上限" : "AI生成"}
              </Button>
            </div>

            {/* 前贴文案列表 */}
            {creativeDescriptions.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {/* 全选行 */}
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedIndexes.size === creativeDescriptions.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-orange-600"
                  />
                  <span className="text-sm text-gray-600">全选</span>
                  <span className="text-xs text-gray-400 ml-auto">已选择 {selectedIndexes.size} 条 / 共 {creativeDescriptions.length}/{MAX_TOTAL_ITEMS} 条</span>
                </div>
                {/* 文案列表 */}
                {creativeDescriptions.map((desc, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                      selectedIndexes.has(index)
                        ? "bg-orange-50 border-orange-400"
                        : "bg-white border-transparent hover:border-gray-200"
                    }`}
                    onClick={() => {
                      if (creativeEditingIndex === index) return;
                      toggleSelectIndex(index);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIndexes.has(index)}
                      onChange={() => toggleSelectIndex(index)}
                      className="w-4 h-4 accent-orange-600 mt-1"
                      onClick={(e) => e.stopPropagation()}
                    />
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
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div
                        className="flex-1 text-sm py-1 px-2 cursor-pointer hover:bg-orange-100 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
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
                      className="text-gray-400 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCreativeDescription(index);
                      }}
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

        {/* 生成参数 - 仅视频和文字模式显示 */}
        {(config.generationMode === "video" || config.generationMode === "text") && (
          <div className={`${isEditing ? "opacity-60 pointer-events-none" : ""}`}><h3 className="text-lg font-semibold mb-4">生成参数</h3><div className="grid grid-cols-2 gap-4">
            <div><Label>模型</Label><Select value={config.model} onValueChange={(v) => setConfig({ ...config, model: v as "seedance_2.0" | "wan_2.6" })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="seedance_2.0">Seedance 2.0</SelectItem><SelectItem value="wan_2.6">Wan 2.6</SelectItem></SelectContent></Select></div>
            <div><Label>画面比例</Label><Select value={config.aspectRatio} onValueChange={(v) => setConfig({ ...config, aspectRatio: v as "16:9" | "9:16" | "1:1" })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="16:9">16:9</SelectItem><SelectItem value="9:16">9:16</SelectItem><SelectItem value="1:1">1:1</SelectItem></SelectContent></Select></div>
            <div><Label>分辨率</Label><Select value={config.resolution} onValueChange={(v) => setConfig({ ...config, resolution: v as "720p" | "1080p" | "2k" })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="720p">720p</SelectItem><SelectItem value="1080p">1080p</SelectItem><SelectItem value="2k">2K</SelectItem></SelectContent></Select></div>
            {/* 生成数量 - 仅视频模式显示 */}
            {config.generationMode === "video" && (
              <div><Label>生成数量: {config.generationCount}</Label><Slider value={[config.generationCount]} onValueChange={(val) => setConfig({ ...config, generationCount: Array.isArray(val) ? val[0] : val })} max={10} min={1} step={1} className="mt-3" /></div>
            )}
            {/* 分镜拆分 - 仅视频模式显示 */}
            {config.generationMode === "video" && (
              <div className="col-span-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">分镜拆分</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {splitByShot
                        ? "开启：按分镜拆分成多个提示词（适合15秒以上长视频）"
                        : "关闭：所有分镜合并生成一个提示词（适合15秒内短视频）"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSplitByShot(!splitByShot)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      splitByShot ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                        splitByShot ? "translate-x-6" : "translate-x-2"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div></div>
        )}
        {/* 变更方向 - 仅视频模式显示 */}
        {config.generationMode === "video" && (
          <div className={`border rounded-lg p-4 ${isEditing ? "opacity-60 pointer-events-none" : ""}`}>
            <h3 className="text-lg font-semibold mb-4">变更方向</h3>
            <div className="flex flex-wrap gap-2">
              {["角色", "场景", "画风", "氛围", "其他"].map((v) => (
                <button key={v} type="button" onClick={() => setDirection(v)} className={`px-4 py-2 rounded-full text-sm border ${direction === v ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"}`}>{v}</button>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => window.location.reload()}>取消</Button>
          {config.generationMode === "video" && <Button className="bg-blue-600 hover:bg-blue-700" onClick={onCreated}>创建任务</Button>}
          {config.generationMode === "text" && <Button className="bg-purple-600 hover:bg-purple-700" onClick={onCreated}>创建任务</Button>}
          {config.generationMode === "narration" && <Button className="bg-green-600 hover:bg-green-700">生成旁白</Button>}
          {config.generationMode === "creative" && (
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={onCreated}
              disabled={selectedIndexes.size === 0}
            >
              {selectedIndexes.size > 0 ? `已选择 ${selectedIndexes.size} 条，创建任务` : "请先选择文案"}
            </Button>
          )}
        </div>
      </CardContent></Card>
    </div>
  );
}

function EditTab({ task, onDeleteResult, onCopyResult }: { task: GenerationTask; onDeleteResult: (id: string) => void; onCopyResult: (result: GenerationResult) => void; }) {
  const [editingResult, setEditingResult] = useState<GenerationResult | null>(null);
  const [editingResultV2, setEditingResultV2] = useState<GenerationResult | null>(null);
  return (
    <div>
      <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold">生成结果 ({task.results.length})</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{task.results.map((result, index) => <ResultCard key={result.id} result={result} index={index} onDelete={onDeleteResult} onEdit={setEditingResult} onEditV2={setEditingResultV2} onCopy={onCopyResult} />)}</div>
      {editingResult && <EditDrawer open={!!editingResult} onClose={() => setEditingResult(null)} result={editingResult} onSave={(shots) => console.log("保存分镜:", shots)} />}
      {editingResultV2 && <EditDrawerV2 open={!!editingResultV2} onClose={() => setEditingResultV2(null)} result={editingResultV2} onSave={(shots) => console.log("保存分镜v2:", shots)} />}
    </div>
  );
}

function WorksListTab({ works }: { works: typeof mockWorks }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold">作品列表 ({works.length})</h2><Button variant="outline" size="sm">导出作品</Button></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{works.map((work) => <Card key={work.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"><div className="relative aspect-video"><img src={work.thumbnail} alt={work.name} className="w-full h-full object-cover" /><div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded">{work.duration}</div></div><CardContent className="p-3"><h3 className="font-medium text-sm truncate">{work.name}</h3><div className="flex justify-between items-center mt-2"><span className="text-xs text-gray-500">{work.createTime}</span><Badge className={work.status === "已完成" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>{work.status}</Badge></div></CardContent></Card>)}</div>
      {works.length === 0 && <div className="text-center py-12 text-gray-400">暂无作品，请先生成视频</div>}
    </div>
  );
}

function GenerationTaskContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("id");
  const [task, setTask] = useState<GenerationTask>(mockTask);
  const [activeTab, setActiveTab] = useState<"create" | "edit" | "works">("create");
  const [isEditing, setIsEditing] = useState(false);

  const handleTaskCreated = () => {
    setIsEditing(true);
    setActiveTab("edit");
  };
  const handleDeleteResult = (id: string) => { setTask((prev) => ({ ...prev, results: prev.results.filter((r) => r.id !== id) })); };
  const handleCopyResult = (result: GenerationResult) => {
    // 计算当前该结果的副本数量
    const sameBaseCount = task.results.filter((r) => r.name.startsWith(result.name + "_副本")).length + 1;
    const newName = `${result.name}_副本${sameBaseCount}`;
    const copiedResult: GenerationResult = {
      ...result,
      id: `${result.id}_副本${sameBaseCount}`,
      name: newName,
      status: "completed",
    };
    setTask((prev) => ({
      ...prev,
      results: [...prev.results, copiedResult],
    }));
  };
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4"><Button variant="ghost" onClick={() => router.back()}>← 返回</Button><h1 className="text-2xl font-bold">{task.name}</h1><Badge className={task.status === "generating" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}>{task.status === "generating" ? "生成中" : "已生成"}</Badge></div>
      </div>
      <div className="flex gap-4 border-b mb-6">
        {(["create", "edit", "works"] as const).map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 px-1 font-medium transition-colors relative ${activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}>{tab === "create" ? "任务创建" : tab === "edit" ? "编辑" : "作品列表"}</button>)}
      </div>
      {activeTab === "create" && <TaskCreationTab task={task} isEditing={isEditing} onCreated={handleTaskCreated} />}
      {activeTab === "edit" && <EditTab task={task} onDeleteResult={handleDeleteResult} onCopyResult={handleCopyResult} />}
      {activeTab === "works" && <WorksListTab works={mockWorks} />}
    </div>
  );
}

export default function GenerationTaskPage() {
  return <Suspense fallback={<div className="p-6">加载中...</div>}><GenerationTaskContent /></Suspense>;
}
