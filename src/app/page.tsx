"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { materials, tasks } from "@/lib/mockData";

const tasksData = tasks;

export default function Workspace() {
  const totalMaterials =
    materials.公共资产.length + materials.团队资产.length + materials.个人资产.length;
  const totalTasks = tasksData.前贴生成.length + tasksData.素材拼接.length;

  // Get recent materials (sorted by upload time)
  const allMaterials = [
    ...materials.公共资产,
    ...materials.团队资产,
    ...materials.个人资产,
  ].sort((a, b) => b.uploadTime.localeCompare(a.uploadTime));

  // Get recent tasks (sorted by create time)
  const allTasks = [
    ...tasksData.前贴生成,
    ...tasksData.素材拼接,
  ].sort((a, b) => b.createTime.localeCompare(a.createTime));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">工作台</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="text-blue-100 text-sm">素材总数</div>
            <div className="text-3xl font-bold mt-2">{totalMaterials}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="text-purple-100 text-sm">公共素材</div>
            <div className="text-3xl font-bold mt-2">{materials.公共资产.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="text-green-100 text-sm">团队素材</div>
            <div className="text-3xl font-bold mt-2">{materials.团队资产.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="text-orange-100 text-sm">任务总数</div>
            <div className="text-3xl font-bold mt-2">{totalTasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📁 最近素材
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {allMaterials.slice(0, 6).map((material) => (
                <div key={material.id} className="group cursor-pointer">
                  <div className="aspect-video rounded-lg overflow-hidden mb-2">
                    <img
                      src={material.thumbnail}
                      alt={material.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="text-sm font-medium truncate">{material.name}</div>
                  <div className="text-xs text-gray-400">
                    ⏱️ {material.duration} | {material.uploadTime.slice(0, 10)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📋 最近任务
            </h2>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>任务ID</TableHead>
                  <TableHead>任务名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allTasks.slice(0, 8).map((task) => (
                  <TableRow key={task.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-sm">{task.id}</TableCell>
                    <TableCell className="text-sm truncate max-w-[120px]">
                      {task.name}
                    </TableCell>
                    <TableCell className="text-sm">{task.type}</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          task.status === "已完成"
                            ? "bg-green-100 text-green-700"
                            : task.status === "处理中"
                            ? "bg-blue-100 text-blue-700"
                            : task.status === "排队中"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {task.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
