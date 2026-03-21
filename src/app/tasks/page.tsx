"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  const [referenceVideo, setReferenceVideo] = useState<string>("");
  const [model, setModel] = useState<string>("seedance_2.0");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [resolution, setResolution] = useState<string>("1080p");
  const [generationCount, setGenerationCount] = useState<number>(3);
  const [character, setCharacter] = useState("");
  const [scene, setScene] = useState("");
  const [style, setStyle] = useState("");
  const [atmosphere, setAtmosphere] = useState("");
  const [others, setOthers] = useState("");

  // Handler to convert null to empty string
  const handleSelectChange = (setter: (v: string) => void) => (value: string | null) => {
    setter(value || "");
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
        </div>
      </div>

      {/* 生成参数 */}
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
        </div>
      </div>

      {/* 详细参数 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">详细参数</h3>
        <div className="space-y-4">
          <div>
            <Label>角色</Label>
            <Textarea
              placeholder="描述角色特征"
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
              className="mt-1"
              rows={2}
            />
          </div>
          <div>
            <Label>场景</Label>
            <Textarea
              placeholder="描述场景环境"
              value={scene}
              onChange={(e) => setScene(e.target.value)}
              className="mt-1"
              rows={2}
            />
          </div>
          <div>
            <Label>画风</Label>
            <Textarea
              placeholder="描述画风要求"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="mt-1"
              rows={2}
            />
          </div>
          <div>
            <Label>氛围</Label>
            <Textarea
              placeholder="描述氛围要求"
              value={atmosphere}
              onChange={(e) => setAtmosphere(e.target.value)}
              className="mt-1"
              rows={2}
            />
          </div>
          <div>
            <Label>其他</Label>
            <Textarea
              placeholder="其他补充说明"
              value={others}
              onChange={(e) => setOthers(e.target.value)}
              className="mt-1"
              rows={2}
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          取消
        </Button>
        <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
          创建任务
        </Button>
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>任务ID</TableHead>
              <TableHead>任务名称</TableHead>
              <TableHead>任务类型</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>结束时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow
                key={task.id}
                className={`hover:bg-gray-50 cursor-pointer ${
                  taskType === "前贴生成" ? "hover:bg-blue-50" : ""
                }`}
                onClick={() => handleRowClick(task)}
              >
                <TableCell className="font-medium">{task.id}</TableCell>
                <TableCell>{task.name}</TableCell>
                <TableCell>{task.type}</TableCell>
                <TableCell>
                  <StatusBadge status={task.status} />
                </TableCell>
                <TableCell className="text-gray-500">{task.createTime}</TableCell>
                <TableCell className="text-gray-500">{task.endTime}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
