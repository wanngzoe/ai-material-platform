import { MaterialsData, TasksData, GenerationMode } from "./types";

// Fixed data to avoid hydration mismatch
export const materials: MaterialsData = {
  公共资产: [
    { id: "QT-0001", name: "前贴广告片段_1", duration: "15秒", uploadTime: "2026-03-15 10:30", thumbnail: "https://picsum.photos/seed/qt1/320/180" },
    { id: "QT-0002", name: "前贴广告片段_2", duration: "30秒", uploadTime: "2026-03-14 14:20", thumbnail: "https://picsum.photos/seed/qt2/320/180" },
    { id: "QT-0003", name: "前贴广告片段_3", duration: "20秒", uploadTime: "2026-03-13 09:15", thumbnail: "https://picsum.photos/seed/qt3/320/180" },
    { id: "QT-0004", name: "前贴广告片段_4", duration: "45秒", uploadTime: "2026-03-12 16:45", thumbnail: "https://picsum.photos/seed/qt4/320/180" },
    { id: "QT-0005", name: "前贴广告片段_5", duration: "25秒", uploadTime: "2026-03-11 11:30", thumbnail: "https://picsum.photos/seed/qt5/320/180" },
    { id: "QT-0006", name: "前贴广告片段_6", duration: "35秒", uploadTime: "2026-03-10 13:20", thumbnail: "https://picsum.photos/seed/qt6/320/180" },
    { id: "QT-0007", name: "前贴广告片段_7", duration: "18秒", uploadTime: "2026-03-09 08:45", thumbnail: "https://picsum.photos/seed/qt7/320/180" },
    { id: "QT-0008", name: "前贴广告片段_8", duration: "40秒", uploadTime: "2026-03-08 15:10", thumbnail: "https://picsum.photos/seed/qt8/320/180" },
  ],
  团队资产: [
    { id: "TF-0001", name: "投放素材_1", duration: "60秒", uploadTime: "2026-03-18 10:00", thumbnail: "https://picsum.photos/seed/tf1/320/180", status: "投放中" },
    { id: "TF-0002", name: "投放素材_2", duration: "45秒", uploadTime: "2026-03-17 14:30", thumbnail: "https://picsum.photos/seed/tf2/320/180", status: "已结束" },
    { id: "TF-0003", name: "投放素材_3", duration: "90秒", uploadTime: "2026-03-16 09:20", thumbnail: "https://picsum.photos/seed/tf3/320/180", status: "待审核" },
    { id: "TF-0004", name: "投放素材_4", duration: "30秒", uploadTime: "2026-03-15 16:15", thumbnail: "https://picsum.photos/seed/tf4/320/180", status: "投放中" },
    { id: "TF-0005", name: "投放素材_5", duration: "75秒", uploadTime: "2026-03-14 11:45", thumbnail: "https://picsum.photos/seed/tf5/320/180", status: "已结束" },
    { id: "TF-0006", name: "投放素材_6", duration: "50秒", uploadTime: "2026-03-13 13:30", thumbnail: "https://picsum.photos/seed/tf6/320/180", status: "投放中" },
    { id: "TF-0007", name: "投放素材_7", duration: "120秒", uploadTime: "2026-03-12 08:20", thumbnail: "https://picsum.photos/seed/tf7/320/180", status: "待审核" },
    { id: "TF-0008", name: "投放素材_8", duration: "40秒", uploadTime: "2026-03-11 15:50", thumbnail: "https://picsum.photos/seed/tf8/320/180", status: "已结束" },
    { id: "TF-0009", name: "投放素材_9", duration: "55秒", uploadTime: "2026-03-10 10:25", thumbnail: "https://picsum.photos/seed/tf9/320/180", status: "投放中" },
    { id: "TF-0010", name: "投放素材_10", duration: "85秒", uploadTime: "2026-03-09 12:40", thumbnail: "https://picsum.photos/seed/tf10/320/180", status: "已结束" },
  ],
  个人资产: [
    { id: "YJ-0001", name: "原剧第1集", duration: "2400秒", uploadTime: "2026-01-05 08:00", thumbnail: "https://picsum.photos/seed/yj1/320/180", episode: "第1集" },
    { id: "YJ-0002", name: "原剧第2集", duration: "2580秒", uploadTime: "2026-01-06 08:00", thumbnail: "https://picsum.photos/seed/yj2/320/180", episode: "第2集" },
    { id: "YJ-0003", name: "原剧第3集", duration: "2520秒", uploadTime: "2026-01-07 08:00", thumbnail: "https://picsum.photos/seed/yj3/320/180", episode: "第3集" },
    { id: "YJ-0004", name: "原剧第4集", duration: "2460秒", uploadTime: "2026-01-08 08:00", thumbnail: "https://picsum.photos/seed/yj4/320/180", episode: "第4集" },
    { id: "YJ-0005", name: "原剧第5集", duration: "2700秒", uploadTime: "2026-01-09 08:00", thumbnail: "https://picsum.photos/seed/yj5/320/180", episode: "第5集" },
    { id: "YJ-0006", name: "原剧第6集", duration: "2340秒", uploadTime: "2026-01-10 08:00", thumbnail: "https://picsum.photos/seed/yj6/320/180", episode: "第6集" },
    { id: "YJ-0007", name: "原剧第7集", duration: "2640秒", uploadTime: "2026-01-11 08:00", thumbnail: "https://picsum.photos/seed/yj7/320/180", episode: "第7集" },
    { id: "YJ-0008", name: "原剧第8集", duration: "2580秒", uploadTime: "2026-01-12 08:00", thumbnail: "https://picsum.photos/seed/yj8/320/180", episode: "第8集" },
    { id: "YJ-0009", name: "原剧第9集", duration: "2460秒", uploadTime: "2026-01-13 08:00", thumbnail: "https://picsum.photos/seed/yj9/320/180", episode: "第9集" },
    { id: "YJ-0010", name: "原剧第10集", duration: "2520秒", uploadTime: "2026-01-14 08:00", thumbnail: "https://picsum.photos/seed/yj10/320/180", episode: "第10集" },
    { id: "YJ-0011", name: "原剧第11集", duration: "2400秒", uploadTime: "2026-01-15 08:00", thumbnail: "https://picsum.photos/seed/yj11/320/180", episode: "第11集" },
    { id: "YJ-0012", name: "原剧第12集", duration: "2700秒", uploadTime: "2026-01-16 08:00", thumbnail: "https://picsum.photos/seed/yj12/320/180", episode: "第12集" },
  ],
};

export const tasks: TasksData = {
  前贴生成: [
    { id: "QG-0001", name: "前贴生成任务_1", type: "前贴生成", status: "已完成", createTime: "2026-03-20 10:30", endTime: "2026-03-20 10:45", thumbnail: "https://picsum.photos/seed/qg1/320/180", generationMode: "video" },
    { id: "QG-0002", name: "前贴生成任务_2", type: "前贴生成", status: "处理中", createTime: "2026-03-20 11:00", endTime: "-", thumbnail: "https://picsum.photos/seed/qg2/320/180", generationMode: "text" },
    { id: "QG-0003", name: "前贴生成任务_3", type: "前贴生成", status: "排队中", createTime: "2026-03-20 11:15", endTime: "-", thumbnail: "https://picsum.photos/seed/qg3/320/180", generationMode: "narration" },
    { id: "QG-0004", name: "前贴生成任务_4", type: "前贴生成", status: "已完成", createTime: "2026-03-19 14:30", endTime: "2026-03-19 14:50", thumbnail: "https://picsum.photos/seed/qg4/320/180", generationMode: "creative" },
    { id: "QG-0005", name: "前贴生成任务_5", type: "前贴生成", status: "失败", createTime: "2026-03-19 15:00", endTime: "2026-03-19 15:05", thumbnail: "https://picsum.photos/seed/qg5/320/180", generationMode: "video" },
    { id: "QG-0006", name: "前贴生成任务_6", type: "前贴生成", status: "已完成", createTime: "2026-03-18 09:20", endTime: "2026-03-18 09:35", thumbnail: "https://picsum.photos/seed/qg6/320/180", generationMode: "text" },
    { id: "QG-0007", name: "前贴生成任务_7", type: "前贴生成", status: "处理中", createTime: "2026-03-18 10:00", endTime: "-", thumbnail: "https://picsum.photos/seed/qg7/320/180", generationMode: "narration" },
    { id: "QG-0008", name: "前贴生成任务_8", type: "前贴生成", status: "已完成", createTime: "2026-03-17 16:30", endTime: "2026-03-17 16:45", thumbnail: "https://picsum.photos/seed/qg8/320/180", generationMode: "creative" },
    { id: "QG-0009", name: "前贴生成任务_9", type: "前贴生成", status: "排队中", createTime: "2026-03-17 17:00", endTime: "-", thumbnail: "https://picsum.photos/seed/qg9/320/180", generationMode: "video" },
    { id: "QG-0010", name: "前贴生成任务_10", type: "前贴生成", status: "已完成", createTime: "2026-03-16 08:15", endTime: "2026-03-16 08:30", thumbnail: "https://picsum.photos/seed/qg10/320/180", generationMode: "text" },
    { id: "QG-0011", name: "前贴生成任务_11", type: "前贴生成", status: "已完成", createTime: "2026-03-15 13:45", endTime: "2026-03-15 14:00", thumbnail: "https://picsum.photos/seed/qg11/320/180", generationMode: "narration" },
    { id: "QG-0012", name: "前贴生成任务_12", type: "前贴生成", status: "处理中", createTime: "2026-03-14 11:20", endTime: "-", thumbnail: "https://picsum.photos/seed/qg12/320/180", generationMode: "creative" },
    { id: "QG-0013", name: "前贴生成任务_13", type: "前贴生成", status: "已完成", createTime: "2026-03-13 15:30", endTime: "2026-03-13 15:45", thumbnail: "https://picsum.photos/seed/qg13/320/180", generationMode: "video" },
    { id: "QG-0014", name: "前贴生成任务_14", type: "前贴生成", status: "失败", createTime: "2026-03-12 10:00", endTime: "2026-03-12 10:05", thumbnail: "https://picsum.photos/seed/qg14/320/180", generationMode: "text" },
    { id: "QG-0015", name: "前贴生成任务_15", type: "前贴生成", status: "已完成", createTime: "2026-03-11 09:30", endTime: "2026-03-11 09:45", thumbnail: "https://picsum.photos/seed/qg15/320/180", generationMode: "narration" },
  ],
  素材拼接: [
    { id: "PJ-0001", name: "素材拼接任务_1", type: "素材拼接", status: "已完成", createTime: "2026-03-20 09:00", endTime: "2026-03-20 09:20", thumbnail: "https://picsum.photos/seed/pj1/320/180" },
    { id: "PJ-0002", name: "素材拼接任务_2", type: "素材拼接", status: "处理中", createTime: "2026-03-20 10:30", endTime: "-", thumbnail: "https://picsum.photos/seed/pj2/320/180" },
    { id: "PJ-0003", name: "素材拼接任务_3", type: "素材拼接", status: "排队中", createTime: "2026-03-19 14:00", endTime: "-", thumbnail: "https://picsum.photos/seed/pj3/320/180" },
    { id: "PJ-0004", name: "素材拼接任务_4", type: "素材拼接", status: "已完成", createTime: "2026-03-19 16:30", endTime: "2026-03-19 16:50", thumbnail: "https://picsum.photos/seed/pj4/320/180" },
    { id: "PJ-0005", name: "素材拼接任务_5", type: "素材拼接", status: "已完成", createTime: "2026-03-18 11:15", endTime: "2026-03-18 11:35", thumbnail: "https://picsum.photos/seed/pj5/320/180" },
    { id: "PJ-0006", name: "素材拼接任务_6", type: "素材拼接", status: "失败", createTime: "2026-03-18 13:00", endTime: "2026-03-18 13:10", thumbnail: "https://picsum.photos/seed/pj6/320/180" },
    { id: "PJ-0007", name: "素材拼接任务_7", type: "素材拼接", status: "已完成", createTime: "2026-03-17 08:45", endTime: "2026-03-17 09:05", thumbnail: "https://picsum.photos/seed/pj7/320/180" },
    { id: "PJ-0008", name: "素材拼接任务_8", type: "素材拼接", status: "处理中", createTime: "2026-03-16 15:20", endTime: "-", thumbnail: "https://picsum.photos/seed/pj8/320/180" },
    { id: "PJ-0009", name: "素材拼接任务_9", type: "素材拼接", status: "已完成", createTime: "2026-03-15 10:00", endTime: "2026-03-15 10:20", thumbnail: "https://picsum.photos/seed/pj9/320/180" },
    { id: "PJ-0010", name: "素材拼接任务_10", type: "素材拼接", status: "已完成", createTime: "2026-03-14 14:30", endTime: "2026-03-14 14:50", thumbnail: "https://picsum.photos/seed/pj10/320/180" },
  ],
};

// Export functions for compatibility
export function generateMockMaterials(): MaterialsData {
  return materials;
}

export function generateMockTasks(): TasksData {
  return tasks;
}
