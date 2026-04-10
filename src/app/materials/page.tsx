"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { materials } from "@/lib/mockData";
import { Material } from "@/lib/types";

function MaterialCard({ material }: { material: Material }) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={material.thumbnail}
          alt={material.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {material.status && (
          <Badge
            className={`absolute top-2 right-2 ${
              material.status === "投放中"
                ? "bg-green-500"
                : material.status === "已结束"
                ? "bg-gray-500"
                : "bg-yellow-500"
            }`}
          >
            {material.status}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 truncate">{material.name}</h3>
        <div className="flex justify-between text-sm text-gray-500">
          <span>⏱️ {material.duration}</span>
          <span>📅 {material.uploadTime.slice(0, 10)}</span>
        </div>
        {material.episode && (
          <div className="mt-2">
            <Badge variant="outline">{material.episode}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MaterialList({
  category,
  searchTerm,
  startDate,
  endDate,
}: {
  category: "公共资产" | "团队资产" | "个人资产";
  searchTerm: string;
  startDate: string;
  endDate: string;
}) {
  const filtered = useMemo(() => {
    let result = materials[category];
    if (searchTerm) {
      result = result.filter((m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (startDate) {
      result = result.filter((m) => m.uploadTime.slice(0, 10) >= startDate);
    }
    if (endDate) {
      result = result.filter((m) => m.uploadTime.slice(0, 10) <= endDate);
    }
    return result;
  }, [category, searchTerm, startDate, endDate]);

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex gap-4 items-end flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="搜索素材名称..."
            value={searchTerm}
            onChange={(e) => {}}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {}}
            className="w-40"
          />
          <span className="self-center text-gray-400">至</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => {}}
            className="w-40"
          />
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          📤 上传素材
        </Button>
      </div>

      {/* Material Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((material) => (
          <MaterialCard key={material.id} material={material} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">暂无素材数据</div>
      )}
    </div>
  );
}

export default function MaterialsPage() {
  const [activeTab, setActiveTab] = useState("公共资产");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const categories = ["公共资产", "团队资产", "个人资产"] as const;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">素材库</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat} value={cat}>
            <div className="space-y-4">
              {/* Search & Filter */}
              <div className="flex gap-4 items-end flex-wrap bg-white p-4 rounded-xl shadow-sm">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="搜索素材名称..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-40"
                  />
                  <span className="text-gray-400">至</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-40"
                  />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  📤 上传素材
                </Button>
              </div>

              {/* Material Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {materials[cat]
                  .filter((m) => {
                    const matchSearch = !searchTerm || m.name.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchStart = !startDate || m.uploadTime.slice(0, 10) >= startDate;
                    const matchEnd = !endDate || m.uploadTime.slice(0, 10) <= endDate;
                    return matchSearch && matchStart && matchEnd;
                  })
                  .map((material) => (
                    <MaterialCard key={material.id} material={material} />
                  ))}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
