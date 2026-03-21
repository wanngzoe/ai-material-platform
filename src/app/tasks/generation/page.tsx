"use client";

import { useState, Suspense } from "react";
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
    referenceVideo: materials.前贴[0],
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
      status: "completed",
      prompt: "年轻女性在霓虹灯下的城市街道上自信行走，展现活力向上的氛围...",
      videoUrl: "https://picsum.photos/seed/v1/640/360",
      narrationText: "这是一个关于追逐梦想的故事，在城市的霓虹灯下，我们找到了前进的方向。",
      voice: "女声-活泼",
      emotion: "开心",
    },
    {
      id: "result-2",
      status: "generating",
      prompt: "年轻女性在霓虹灯下的城市街道上自信行走，展现活力向上的氛围...",
      progress: 65,
    },
    {
      id: "result-3",
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
}

function StatusBadge({ status, errorMessage }: { status: VideoGenerationStatus; errorMessage?: string }) {
  const config: Record<VideoGenerationStatus, { bg: string; text: string; label: string; showError?: boolean }> = {
    pending: { bg: "bg-gray-100", text: "text-gray-600", label: "待生成" },
    generating: { bg: "bg-blue-100", text: "text-blue-600", label: "生成中" },
    completed: { bg: "bg-green-100", text: "text-green-600", label: "已完成" },
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
  const [referenceImages, setReferenceImages] = useState<string[]>([
    "https://picsum.photos/seed/ref1/200/200",
    "https://picsum.photos/seed/ref2/200/200",
    "https://picsum.photos/seed/ref3/200/200",
  ]);

  const handleModelChange = (value: string | null) => setModel(value || "seedance_2.0");

  const updateShot = (id: string, updates: Partial<Shot>) => {
    setShots((prev) => prev.map((shot) => (shot.id === id ? { ...shot, ...updates } : shot)));
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
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                  {/* 分镜头部 */}
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-800">分镜 {index + 1}</span>
                      <StatusBadge status={shot.status} />
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteConfirmId(shot.id)}>
                      删除
                    </Button>
                  </div>
                  {/* 分镜内容 */}
                  <div className="p-4 flex gap-4">
                    <div className="w-1/3 flex-shrink-0">
                      <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden relative">
                        {shot.status === "completed" && shot.videoUrl ? (
                          <video src={shot.videoUrl} className="w-full h-full object-cover" controls />
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
                      <div><Label className="text-sm text-gray-600">分镜提示词</Label><Textarea value={shot.prompt} onChange={(e) => updateShot(shot.id, { prompt: e.target.value })} rows={4} className="mt-1" placeholder="描述这个分镜的内容..." disabled={shot.status === "generating"} /></div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">时长:</span>
                          <Select value={shot.duration.toString()} onValueChange={(v) => updateShot(shot.id, { duration: parseInt(v || "5") })} disabled={shot.status === "generating"}>
                            <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {model === "seedance_2.0" ? [4,5,6,7,8,9,10,11,12,13,14,15].map((d) => <SelectItem key={d} value={d.toString()}>{d}秒</SelectItem>) : (<><SelectItem value="5">5秒</SelectItem><SelectItem value="10">10秒</SelectItem></>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="outline" size="sm" disabled={shot.status === "generating"}>✨ 优化提示词</Button>
                        <span className="text-xs text-gray-400 ml-auto">消耗 {model === "seedance_2.0" ? "10" : "8"} 积分</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => generateSingleShot(shot.id)} disabled={shot.status === "generating"}>{shot.status === "generating" ? "生成中..." : "生成视频"}</Button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 插入分镜按钮 */}
                <div className="flex justify-center -mt-3 relative z-10">
                  <Button variant="outline" size="sm" className="bg-white border-dashed text-gray-500 hover:text-gray-600 hover:border-gray-400" onClick={() => { const newShot = { id: `shot-${Date.now()}`, prompt: "新分镜提示词...", duration: 5, status: "pending" as const }; const newShots = [...shots]; newShots.splice(index + 1, 0, newShot); setShots(newShots); }}>
                    + 在此分镜后插入新分镜
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="w-80 flex-shrink-0 space-y-6 overflow-y-auto">
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
              <Button variant="outline" className="w-full" onClick={generateAllShots}>批量生成全部</Button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium">参考图</h4>
              <div className="text-xs text-gray-500 mb-2">提示：在提示词中使用 @ 引用参考图，如 "@图1"</div>
              <div className="grid grid-cols-3 gap-2">
                {referenceImages.map((img, i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group">
                    <img src={img} alt={`参考图${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="destructive" size="sm" className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600" onClick={() => setReferenceImages(prev => prev.filter((_, idx) => idx !== i))}>
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
    </Sheet>
  );
}

function ResultCard({ result, index, onDelete, onEdit }: { result: GenerationResult; index: number; onDelete: (id: string) => void; onEdit: (result: GenerationResult) => void; }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-gray-100">
        {result.status === "completed" && result.videoUrl ? <img src={result.videoUrl} alt={`生成结果 ${index + 1}`} className="w-full h-full object-cover" /> : result.status === "generating" ? <div className="w-full h-full flex flex-col items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div><span className="text-gray-500">生成中... {result.progress}%</span><div className="w-48 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${result.progress || 0}%` }}></div></div></div> : <div className="w-full h-full flex items-center justify-center text-gray-400"><div className="text-center p-4"><div className="text-sm mb-2">提示词</div><div className="text-xs text-gray-500 line-clamp-3">{result.prompt}</div></div></div>}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3"><span className="font-medium">结果 {index + 1}</span><StatusBadge status={result.status} /></div>
        {result.status === "completed" ? (
          <div className="space-y-3">
            <div><div className="text-xs text-gray-500 mb-1">旁白文案</div><div className="text-sm bg-gray-50 p-2 rounded">{result.narrationText}</div></div>
            <div className="flex gap-4"><div><div className="text-xs text-gray-500 mb-1">音色</div><div className="text-sm">{result.voice}</div></div><div><div className="text-xs text-gray-500 mb-1">情绪</div><div className="text-sm">{result.emotion}</div></div></div>
            <div className="flex gap-2 pt-2"><Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(result)}>编辑</Button><Button variant="outline" size="sm" className="flex-1">保存为作品</Button><Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => onDelete(result.id)}>删除</Button></div>
          </div>
        ) : <Button variant="outline" size="sm" className="w-full" onClick={() => onEdit(result)}>编辑</Button>}
      </CardContent>
    </Card>
  );
}

function TaskCreationTab({ task }: { task: GenerationTask }) {
  const [config, setConfig] = useState(task.config);
  return (
    <div className="max-w-3xl">
      <Card><CardContent className="p-6 space-y-6">
        <div><h3 className="text-lg font-semibold mb-4">基本信息</h3><div className="grid grid-cols-2 gap-4"><div><Label>任务名称</Label><Input value={config.name} onChange={(e) => setConfig({ ...config, name: e.target.value })} className="mt-1" /></div><div><Label>参考视频</Label><div className="mt-1 flex items-center gap-2">{config.referenceVideo && <img src={config.referenceVideo.thumbnail} alt="参考视频" className="w-16 h-10 object-cover rounded" />}<span className="text-sm">{config.referenceVideo?.name}</span></div></div></div></div>
        <div><h3 className="text-lg font-semibold mb-4">生成参数</h3><div className="grid grid-cols-2 gap-4"><div><Label>模型</Label><Select value={config.model} onValueChange={(v) => setConfig({ ...config, model: v as "seedance_2.0" | "wan_2.6" })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="seedance_2.0">Seedance 2.0</SelectItem><SelectItem value="wan_2.6">Wan 2.6</SelectItem></SelectContent></Select></div><div><Label>画面比例</Label><Select value={config.aspectRatio} onValueChange={(v) => setConfig({ ...config, aspectRatio: v as "16:9" | "9:16" | "1:1" })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="16:9">16:9</SelectItem><SelectItem value="9:16">9:16</SelectItem><SelectItem value="1:1">1:1</SelectItem></SelectContent></Select></div><div><Label>分辨率</Label><Select value={config.resolution} onValueChange={(v) => setConfig({ ...config, resolution: v as "720p" | "1080p" | "2k" })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="720p">720p</SelectItem><SelectItem value="1080p">1080p</SelectItem><SelectItem value="2k">2K</SelectItem></SelectContent></Select></div><div><Label>生成数量: {config.generationCount}</Label><Slider value={[config.generationCount]} onValueChange={(val) => setConfig({ ...config, generationCount: Array.isArray(val) ? val[0] : val })} max={10} min={1} step={1} className="mt-3" /></div></div></div>
        <div><h3 className="text-lg font-semibold mb-4">详细参数</h3><div className="space-y-4">{["character", "scene", "style", "atmosphere", "others"].map((field) => <div key={field}><Label>{field === "character" ? "角色" : field === "scene" ? "场景" : field === "style" ? "画风" : field === "atmosphere" ? "氛围" : "其他"}</Label><Textarea value={config.params[field as keyof typeof config.params]} onChange={(e) => setConfig({ ...config, params: { ...config.params, [field]: e.target.value } })} className="mt-1" rows={2} /></div>)}</div></div>
        <div className="flex justify-end gap-2 pt-4"><Button variant="outline">取消</Button><Button className="bg-blue-600 hover:bg-blue-700">保存配置</Button></div>
      </CardContent></Card>
    </div>
  );
}

function EditTab({ task, onDeleteResult }: { task: GenerationTask; onDeleteResult: (id: string) => void; }) {
  const [editingResult, setEditingResult] = useState<GenerationResult | null>(null);
  return (
    <div>
      <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold">生成结果 ({task.results.length})</h2><Button variant="outline" size="sm">+ 添加生成</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{task.results.map((result, index) => <ResultCard key={result.id} result={result} index={index} onDelete={onDeleteResult} onEdit={setEditingResult} />)}</div>
      {editingResult && <EditDrawer open={!!editingResult} onClose={() => setEditingResult(null)} result={editingResult} onSave={(shots) => console.log("保存分镜:", shots)} />}
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
  const [activeTab, setActiveTab] = useState<"create" | "edit" | "works">("edit");
  const handleDeleteResult = (id: string) => { setTask((prev) => ({ ...prev, results: prev.results.filter((r) => r.id !== id) })); };
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4"><Button variant="ghost" onClick={() => router.back()}>← 返回</Button><h1 className="text-2xl font-bold">{task.name}</h1><Badge className={task.status === "generating" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}>{task.status === "generating" ? "生成中" : "已完成"}</Badge></div>
        <div className="flex gap-2"><Button variant="outline">导出全部</Button><Button className="bg-blue-600 hover:bg-blue-700">开始生成</Button></div>
      </div>
      <div className="flex gap-4 border-b mb-6">
        {(["create", "edit", "works"] as const).map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 px-1 font-medium transition-colors relative ${activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}>{tab === "create" ? "任务创建" : tab === "edit" ? "编辑" : "作品列表"}</button>)}
      </div>
      {activeTab === "create" && <TaskCreationTab task={task} />}
      {activeTab === "edit" && <EditTab task={task} onDeleteResult={handleDeleteResult} />}
      {activeTab === "works" && <WorksListTab works={mockWorks} />}
    </div>
  );
}

export default function GenerationTaskPage() {
  return <Suspense fallback={<div className="p-6">加载中...</div>}><GenerationTaskContent /></Suspense>;
}
