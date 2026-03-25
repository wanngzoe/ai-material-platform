import streamlit as st
import requests
import json
import re
import base64
import time

# 页面配置
st.set_page_config(
    page_title="AI视频生成工具",
    page_icon="🎬",
    layout="wide"
)

# 自定义CSS - 让textarea自适应内容高度
st.markdown("""
<style>
    .stTextArea textarea {
        min-height: 80px;
        height: auto;
    }
</style>
""", unsafe_allow_html=True)

# ==================== 通用函数 ====================

def call_gemini_api(api_key, prompt):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key={api_key}"
    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.9, "maxOutputTokens": 16384}
    }
    response = requests.post(url, json=data)
    return response.json()

def call_gemini_video_api(api_key, prompt, video_data=None, mime_type="video/mp4"):
    """调用Gemini API分析视频"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key={api_key}"

    # 构建请求
    if video_data:
        # 有视频文件
        parts = [
            {"text": prompt},
            {
                "inline_data": {
                    "mime_type": mime_type,
                    "data": video_data
                }
            }
        ]
    else:
        parts = [{"text": prompt}]

    data = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 8192
        }
    }

    try:
        response = requests.post(url, json=data, timeout=300)
        return response.json()
    except requests.exceptions.Timeout:
        return {"error": "请求超时（视频文件较大，请耐心等待或尝试更小的视频文件）"}
    except Exception as e:
        return {"error": str(e)}

def parse_json_response(response_text):
    """解析JSON响应"""
    if not response_text:
        return None

    # 去除markdown代码块标记
    # 移除 ```json 和 ``` 标记
    cleaned_text = re.sub(r'^```json\s*', '', response_text.strip(), flags=re.MULTILINE)
    cleaned_text = re.sub(r'\s*```$', '', cleaned_text)

    # 方法1: 尝试直接解析
    try:
        result = json.loads(cleaned_text)
        return result
    except Exception as e:
        pass

    # 方法2: 提取JSON数组
    try:
        json_match = re.search(r'\[[\s\S]*\]', cleaned_text)
        if json_match:
            return json.loads(json_match.group())
    except:
        pass

    return None

def generate_srt_subtitle(narration_text, start_time=0.0, duration=None):
    """生成SRT格式字幕文件"""
    if not narration_text:
        return ""

    # 估算时长（如果未提供）：按每秒4个字估算
    if not duration:
        duration = len(narration_text) / 4

    # 转换为SRT时间格式
    def format_time(seconds):
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

    start_str = format_time(start_time)
    end_str = format_time(start_time + duration)

    # SRT格式
    srt_content = f"""1
{start_str} --> {end_str}
{narration_text}

"""
    return srt_content

# ==================== 侧边栏 - 模式选择 ====================

st.sidebar.title("🎬 AI视频生成工具")

# API Key 持久化 - 放在模式选择之前
if "api_key" not in st.session_state:
    st.session_state["api_key"] = ""

api_key_input = st.sidebar.text_input("🔑 Google Gemini API Key", type="password", value=st.session_state["api_key"], key="api_key_input")
st.session_state["api_key"] = api_key_input

if not api_key_input:
    st.sidebar.warning("请输入 API Key")

st.sidebar.markdown("---")

# 初始化模式选择
if "current_mode" not in st.session_state:
    st.session_state["current_mode"] = "💡 创意描述生成"

mode_options = ["💡 创意描述生成", "📝 等效事件替换", "🎬 生成分镜", "🎤 仅生成旁白"]
mode_index = mode_options.index(st.session_state["current_mode"])

selected_mode = st.sidebar.radio(
    "选择模式",
    mode_options,
    index=mode_index
)

# 更新模式
if selected_mode != st.session_state["current_mode"]:
    st.session_state["current_mode"] = selected_mode

mode = st.session_state["current_mode"]

api_key = st.session_state["api_key"]

# ==================== 模式1: 创意描述生成 (复用现有逻辑) ====================

if mode == "💡 创意描述生成":
    st.title("💡 创意描述生成")
    st.markdown("错位创意生成器 - 为广告优化师打造")

    DISLOCATION_TYPES = [
        "职业错位", "年龄错位", "性别错位", "时代错位", "物种错位",
        "场景错位", "材质/形态错位", "语言/文化错位", "关系错位", "声音/语言错位",
        "身份/阶层错位", "比例/尺度错位", "状态/情绪错位", "季节/温度错位", "风格/艺术错位",
        "虚拟与现实错位", "职业与技能错位", "因果错位", "数字/数据错位", "组合错位"
    ]
    TARGET_USER_PRESETS = ["18-25岁女性", "26-35岁男性", "宝爸宝妈", "打工人", "大学生", "职场新人", "中老年人", "游戏玩家"]
    ERA_PRESETS = ["70年代", "80年代", "90年代", "00年代", "10年代", "民国", "古代", "未来", "不设限"]

    col1, col2 = st.columns([1, 1.5])
    with col1:
        st.subheader("📝 输入信息")
        target_user_option = st.selectbox("目标用户 *", ["自定义"] + TARGET_USER_PRESETS, index=0)
        target_user = st.text_input("请输入目标用户") if target_user_option == "自定义" else target_user_option
        dislocation_type = st.selectbox("错位维度 *", [""] + DISLOCATION_TYPES)
        era_option = st.selectbox("年代", [""] + ERA_PRESETS)
        material = st.text_area("目标素材（推广视频的旁白/文案）")
        reference = st.text_input("参考创意（可选）")
        count = st.number_input("生成数量", min_value=1, max_value=20, value=5)

        if st.button("🚀 生成创意", type="primary", disabled=not api_key):
            if not api_key:
                st.error("请先输入 API Key")
            elif not target_user:
                st.error("请输入目标用户")
            elif not dislocation_type:
                st.error("请选择错位维度")
            else:
                with st.spinner("创意生成中..."):
                    if material:
                        prompt = f"""生成恰好{count}条短剧广告引流素材创意。

## 业务背景
这是用于短视频平台（抖音/快手）引流的前3-5秒钩子素材，需要：
1. 快速抓住注意力（前3秒必须有视觉或认知冲击）
2. 制造信息差或反常识（让用户想知道后续）
3. 引导情绪共鸣或好奇（点赞/评论/分享的底层逻辑）

## 输入信息
- 目标受众：{target_user}
- 错位类型：{dislocation_type}
- 年代：{era_option if era_option else '不设限'}
- 素材：{material if material else '无'}

## 输出要求【重要】
1. **hookScene（钩子画面）**：必须包含具体人物动作、表情、场景细节。如："外卖小哥站在暴雨中，手机屏幕亮着'您有新的订单'，但周围没有店铺"
2. **hookNarration（钩子旁白）**：能吸引用户点击，核心是制造好奇或共鸣
3. **transition（过渡）**：用一句话说明"→素材"的逻辑关联，2-3句即可
4. **materialNarration（素材旁白）**：清晰说明产品/服务价值

## 输出格式（严格JSON数组，不要任何其他文字）
[
  {{"hookScene": "具体画面描述，包含人物+动作+表情+场景细节", "hookNarration": "能吸引点击的旁白", "transition": "过渡说明", "materialNarration": "素材旁白"}}
]"""
                    else:
                        prompt = f"""生成恰好{count}条短剧广告引流素材创意。

## 业务背景
这是用于短视频平台（抖音/快手）引流的前3-5秒钩子素材，需要：
1. 快速抓住注意力（前3秒必须有视觉或认知冲击）
2. 制造信息差或反常识（让用户想知道后续）
3. 引导情绪共鸣或好奇

## 输入信息
- 目标受众：{target_user}
- 错位类型：{dislocation_type}
- 年代：{era_option if era_option else '不设限'}

## 输出要求【重要】
1. **hookScene（钩子画面）**：必须包含具体人物动作、表情、场景细节。如："一位白发老人戴着耳机，手游操作比年轻人还溜"
2. **hookNarration（钩子旁白）**：能吸引用户点击，核心是制造好奇或共鸣

## 输出格式（严格JSON数组，不要任何其他文字）
[
  {{"hookScene": "具体画面描述，包含人物+动作+表情+场景细节", "hookNarration": "能吸引点击的旁白"}}
]"""

                    result = call_gemini_api(api_key, prompt)
                    content = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    creatives = parse_json_response(content)

                    if creatives:
                        st.session_state["creatives"] = creatives
                        st.session_state["has_material"] = bool(material)
                    else:
                        st.error("无法解析结果，请重试")

    if "creatives" in st.session_state:
        has_material = st.session_state.get("has_material", False)
        with col2:
            st.subheader(f"📋 生成的创意 ({len(st.session_state['creatives'])}条)")
            for i, creative in enumerate(st.session_state["creatives"]):
                with st.expander(f"创意 {i+1}", expanded=True):
                    st.markdown("### 🎣 钩子")
                    st.markdown(f"**画面：** {creative.get('hookScene', '')}")
                    st.markdown(f"**旁白：** {creative.get('hookNarration', '')}")
                    if has_material:
                        st.markdown("### ➡️ 过渡")
                        st.info(creative.get('transition', ''))
                        st.markdown("### 📦 素材")
                        st.markdown(f"**旁白：** {creative.get('materialNarration', '')}")

# ==================== 模式2: 等效事件替换 ====================

elif mode == "📝 等效事件替换":
    st.title("📝 等效事件替换")
    st.markdown("基于用户输入的视频描述，生成多个等效的事件替换变体")

    col1, col2 = st.columns([1, 1.5])
    with col1:
        st.subheader("📝 输入视频描述")

        video_description = st.text_area(
            "视频描述",
            placeholder="请详细描述你想要生成的视频内容...\n例如：一个年轻女孩在地铁上给老人让座的温馨场景",
            height=150
        )

        replacement_count = st.slider("生成变体数量", min_value=3, max_value=10, value=5)

        generate_btn = st.button("🚀 生成等效变体", type="primary", disabled=not api_key)

    if generate_btn:
        if not api_key:
            st.error("请先输入 API Key")
        elif not video_description.strip():
            st.error("请输入视频描述")
        else:
            with st.spinner("等效事件生成中..."):
                prompt = f"""基于以下视频描述，生成{replacement_count}个等效的事件替换变体。

## 业务场景
这是用于短视频广告素材的脚本改编，需要生成多个"相似但不同"的版本，用于A/B测试或批量生产。

## 核心原则
等效替换 = 保持故事的核心主题/情感/冲突不变，但替换具体的人物身份、场景环境、情节细节。
变体之间应该有明显差异，但核心情绪一致。

## 原视频描述
{video_description}

## 替换维度（每个变体至少涉及2-3个维度）
1. **人物身份**：职业、年龄、性别、性格特点的替换
2. **场景环境**：地点、场合、时代背景的替换
3. **情节细节**：具体行为、事件发展方式的替换
4. **关系重组**：可以改变人物间的关系（如：陌生人→熟人，竞争对手→合作伙伴）

## 输出要求【重要】
1. **description**：50-80字的完整情节描述，必须包含"人物+场景+动作+结果"
2. **coreTheme**：1句话概括核心情感（如：底层逆袭/婆媳和解/职场反杀）
3. **keyChanges**：每个维度的变更说明要具体，格式"A → B"

## 输出格式（严格JSON数组）
[
  {{
    "variant_id": 1,
    "description": "50-80字完整情节，包含人物、场景、动作、结果",
    "coreTheme": "一句话核心情感/主题",
    "keyChanges": [
      {{"dimension": "人物", "change": "原人物特征 → 新人物特征"}},
      {{"dimension": "场景", "change": "原场景 → 新场景"}},
      {{"dimension": "情节", "change": "原情节 → 新情节"}},
      {{"dimension": "关系", "change": "原关系 → 新关系"}}
    ]
  }}
]

重要：只输出JSON数组，不要有任何解释性文字！"""

                result = call_gemini_api(api_key, prompt)
                content = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                variants = parse_json_response(content)

                if variants:
                    st.session_state["variants"] = variants
                    st.session_state["original_desc"] = video_description
                else:
                    st.error("无法解析结果，请重试")

    if "variants" in st.session_state:
        with col2:
            st.subheader(f"📋 等效变体 ({len(st.session_state['variants'])}个)")
            st.markdown(f"**原描述：** {st.session_state['original_desc']}")

            for i, variant in enumerate(st.session_state["variants"]):
                with st.expander(f"变体 {i+1}", expanded=True):
                    # 核心主题
                    theme = variant.get('coreTheme', '')
                    if theme:
                        st.markdown(f"**🎯 核心主题：** {theme}")

                    # 描述
                    st.markdown("### 📝 等效事件描述")
                    st.markdown(variant.get('description', ''))

                    # 主要变更
                    changes = variant.get('keyChanges', [])
                    if changes:
                        st.markdown("### 🔑 维度变更")
                        for change in changes:
                            dim = change.get('dimension', '')
                            chg = change.get('change', '')
                            if dim and chg:
                                st.markdown(f"- **{dim}**: {chg}")

                    # 复制功能
                    copy_text = f"""变体 {i+1}
核心主题：{theme}
描述：{variant.get('description', '')}
"""
                    for change in changes:
                        copy_text += f"{change.get('dimension', '')}: {change.get('change', '')}\n"

                    st.text_area("📋 一键复制", value=copy_text, height=100, key=f"copy_{i}", label_visibility="collapsed")

# ==================== 模式3: 生成分镜 ====================

elif mode == "🎬 生成分镜":
    st.title("🎬 生成分镜")
    st.markdown("基于视频描述，生成分镜和分镜提示词")

    # 初始化描述输入框数量
    if "desc_count" not in st.session_state:
        st.session_state["desc_count"] = 1

    col1, col2 = st.columns([1, 1.5])
    with col1:
        st.subheader("📝 输入信息")

        # 动态生成多个描述输入框
        descriptions = []
        for i in range(st.session_state["desc_count"]):
            desc = st.text_area(f"视频描述 {i+1}", key=f"desc_{i}", placeholder="请输入视频描述...", height=100)
            if desc:
                descriptions.append(desc)

        # 添加更多描述输入框
        col_add, col_clear = st.columns([2, 1])
        with col_add:
            if st.button("➕ 添加更多描述", key="add_desc"):
                st.session_state["desc_count"] += 1
                st.rerun()
        with col_clear:
            if st.session_state["desc_count"] > 1 and st.button("🔄 清空", key="clear_desc"):
                st.session_state["desc_count"] = 1
                for key in list(st.session_state.keys()):
                    if key.startswith("desc_"):
                        del st.session_state[key]
                st.rerun()

        aspect_ratio = st.selectbox("画面比例", ["16:9", "9:16", "1:1"])

        # 清除分析结果
        if st.session_state.get("attraction_points") or st.session_state.get("shots_data") or st.session_state.get("attraction_raw"):
            if st.button("🗑️ 清除分析结果", key="clear_analysis"):
                st.session_state["attraction_points"] = {}
                st.session_state["attraction_raw"] = []
                st.session_state["shots_data"] = ""
                st.rerun()

        generate_btn = st.button("🚀 生成分镜", type="primary", disabled=not api_key)

    # 分析吸引力点
    if "attraction_points" not in st.session_state:
        st.session_state["attraction_points"] = {}

    if generate_btn:
        if not api_key:
            st.error("请先输入 API Key")
        elif not descriptions:
            st.error("请输入至少一个视频描述")
        else:
            with st.spinner("🔍 多维度分析中..."):
                # 先从三个角度分析每个描述
                attraction_prompt = f"""从专业剪辑、导演分镜、投放优化三个角度，深度分析以下{len(descriptions)}个视频描述。

## 视频描述
{chr(10).join([f"描述{i+1}: {d}" for i, d in enumerate(descriptions)])}

## 重要：时长估算
请先估算每个视频描述的预计时长（秒），如果超过15秒，需要拆分成多个片段。
- 估算依据：内容复杂度、镜头数量、叙事完整性
- 如果需要拆分，请给出拆分建议（如：在哪个情节点拆分）

## 三个分析维度

### 一、剪辑角度（技术层面）
1. **冲突/矛盾**：描述中有什么戏剧冲突或矛盾点？
2. **悬念**：有什么让人想知道后续发展的点？
3. **情绪highlights**：有哪些情绪高潮或情感爆发点？
4. **视觉亮点**：有什么视觉上吸引人的元素？
5. **节奏变化**：描述中暗示了哪些节奏变化（快-慢-快等）？

### 二、导演角度（叙事层面）
1. **叙事节奏**：这个故事应该用怎样的节奏推进？（快节奏悬念型 / 慢热铺垫型 / 起伏跌宕型）
2. **镜头语言**：哪些场景适合用特写强调？哪些需要全景交代？
3. **情感曲线**：情绪如何层层递进？高潮点在哪里？
4. **转场设计**：镜头之间如何自然过渡？

### 三、投放角度（用户留存）
1. **钩子画面**：前3秒最能留住观众的是什么画面？
2. **完播关键**：哪个时刻最影响用户是否继续看下去？
3. **互动点**：哪些画面可能引发评论/转发？
4. **风险评估**：这类题材/内容在目标平台的风险点是什么？不同题材对血腥/暴露的接受度不同，请给出差异化建议
5. **优化建议**：哪些画面可以强化？哪些可以弱化？

## 输出格式（严格JSON数组）
[
  {{
    "description_index": 1,
    "description": "原始描述",
    "estimated_duration": "预计时长（秒），如 12 或 18",
    "need_split": true/false,
    "split_suggestion": "如果需要拆分，描述在哪里拆分及原因",
    "editing_analysis": {{
      "conflict": "冲突/矛盾点",
      "suspense": "悬念点",
      "emotion": "情绪高潮点",
      "visual": "视觉亮点",
      "rhythm": "节奏变化"
    }},
    "directing_analysis": {{
      "narrative_rhythm": "叙事节奏建议",
      "shot_language": "镜头语言设计",
      "emotion_curve": "情感曲线",
      "transition_design": "转场设计"
    }},
    "publishing_analysis": {{
      "hook_shot": "前3秒钩子画面",
      "completion_key": "影响完播的关键时刻",
      "interaction_point": "可能引发互动的点",
      "risk_assessment": "风险评估（差异化建议）",
      "optimization": "优化建议"
    }},
    "comprehensive_suggestion": "综合三个角度的核心建议"
  }}
]

重要：只输出JSON数组，每个视频都要有完整的三个维度分析！"""

                result = call_gemini_api(api_key, attraction_prompt)
                content = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                attraction_data = parse_json_response(content)

                if attraction_data:
                    st.session_state["attraction_points"] = {i: attraction_data[i] if i < len(attraction_data) else None for i in range(len(descriptions))}
                    st.session_state["attraction_raw"] = attraction_data
                else:
                    st.session_state["attraction_points"] = {}

            with st.spinner("分镜生成中..."):

                # 分析每个视频的时长和拆分需求
                attraction_raw = st.session_state.get("attraction_raw", [])
                video_parts = []  # 存储拆分后的视频片段

                for i, attr in enumerate(attraction_raw):
                    if attr:
                        duration = attr.get("estimated_duration", "")
                        need_split = attr.get("need_split", False)
                        split_suggestion = attr.get("split_suggestion", "") or ""

                        # 所有视频都添加到列表
                        video_parts.append({
                            "original_index": i + 1,
                            "description": descriptions[i],
                            "duration": duration,
                            "need_split": need_split,
                            "split_suggestion": split_suggestion,
                            "attr": attr
                        })

                # 构建包含三个维度分析结果的描述
                attraction_context = ""
                for i, attr in enumerate(attraction_raw):
                    if attr:
                        # 剪辑分析
                        editing = attr.get("editing_analysis", {})
                        # 导演分析
                        directing = attr.get("directing_analysis", {})
                        # 投放分析
                        publishing = attr.get("publishing_analysis", {})
                        # 综合建议
                        comprehensive = attr.get("comprehensive_suggestion", "")
                        # 时长信息
                        duration = attr.get("estimated_duration", "未估算")
                        need_split = attr.get("need_split", False)
                        split_suggestion = attr.get("split_suggestion", "")

                        split_info = f" | 时长: {duration}秒"
                        if need_split:
                            split_info += f" | ⚠️ 需拆分: {split_suggestion}"

                        attraction_context += f"""

=== 描述{i+1} {split_info} ===

【剪辑角度】
冲突点: {editing.get('conflict', '无')}
悬念点: {editing.get('suspense', '无')}
情绪高潮: {editing.get('emotion', '无')}
视觉亮点: {editing.get('visual', '无')}
节奏变化: {editing.get('rhythm', '无')}

【导演角度】
叙事节奏: {directing.get('narrative_rhythm', '无')}
镜头语言: {directing.get('shot_language', '无')}
情感曲线: {directing.get('emotion_curve', '无')}
转场设计: {directing.get('transition_design', '无')}

【投放角度】
前3秒钩子: {publishing.get('hook_shot', '无')}
完播关键: {publishing.get('completion_key', '无')}
互动点: {publishing.get('interaction_point', '无')}
风险评估: {publishing.get('risk_assessment', '无')}
优化建议: {publishing.get('optimization', '无')}

【综合建议】{comprehensive}"""

                # 判断是否需要拆分视频
                need_split_any = False
                split_count = 0
                for part in video_parts:
                    if part.get("need_split") and part.get("split_suggestion"):
                        need_split_any = True
                        split_count += 1

                if need_split_any:
                    # 需要拆分，生成多个提示词
                    all_results = []
                    st.warning(f"⚠️ 检测到 {split_count} 个视频需要拆分成多段生成（每段≤15秒）")

                    for idx, part in enumerate(video_parts):
                        original_idx = part.get("original_index", idx + 1)

                        if part.get("need_split") and part.get("split_suggestion"):
                            # 需要拆分，生成两个片段
                            split_suggestion = part.get("split_suggestion", "")

                            # 先生成片段A
                            with st.spinner(f"正在生成第{original_idx}个视频的片段A..."):
                                split_prompt_a = f"""基于以下视频描述，生成分镜脚本的第一部分。要求：专业剪辑师级别，像可直接拍摄的指令。

## 视频描述
{part['description']}

## 拆分建议
{split_suggestion}

## 重要：本次只生成第一部分（片段A）
- 开头到拆分点为止，作为悬念铺垫
- 以钩子/疑问结尾，吸引用户看下一集
- 时长控制在10-12秒内

## 画面比例
{aspect_ratio}

## 核心原则
1. **像分镜头脚本**：输出拍摄指令
2. **时间精确**：时间戳精确到毫秒
3. **节奏放缓**：每个镜头至少1秒
4. **时长≤15秒**：第一部分

## 色调与光影
开篇必须写整体风格描述

## 输出格式
【视频{original_idx} - 片段A】描述
总时长：X秒
色调/光影/氛围：具体描述

分镜1 [00:00.000-00:0X.000]:
[00:00.000] 景别: 具体画面描述...

重要：只输出片段A的分镜脚本！"""

                                result_a = call_gemini_api(api_key, split_prompt_a)
                                content_a = result_a.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                                if content_a:
                                    all_results.append(f"【视频{original_idx} - 片段A】{part['description']}\n{content_a}")

                            # 再生成片段B
                            with st.spinner(f"正在生成第{original_idx}个视频的片段B..."):
                                split_prompt_b = f"""基于以下视频描述，生成分镜脚本的第二部分。要求：专业剪辑师级别，像可直接拍摄的指令。

## 视频描述
{part['description']}

## 拆分建议
{split_suggestion}

## 重要：本次只生成第二部分（片段B）
- 从拆分点开始到结尾
- 延续片段A的故事
- 时长控制在10-12秒内

## 画面比例
{aspect_ratio}

## 核心原则
1. **像分镜头脚本**：输出拍摄指令
2. **时间精确**：时间戳精确到毫秒
3. **节奏放缓**：每个镜头至少1秒
4. **时长≤15秒**：第二部分

## 色调与光影
开篇必须写整体风格描述（与片段A一致）

## 输出格式
【视频{original_idx} - 片段B】描述
总时长：X秒
色调/光影/氛围：具体描述

分镜1 [00:00.000-00:0X.000]:
[00:00.000] 景别: 具体画面描述...

重要：只输出片段B的分镜脚本！"""

                                result_b = call_gemini_api(api_key, split_prompt_b)
                                content_b = result_b.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                                if content_b:
                                    all_results.append(f"【视频{original_idx} - 片段B】{part['description']}\n{content_b}")
                        else:
                            # 不需要拆分
                            with st.spinner(f"正在生成第{original_idx}个视频..."):
                                single_prompt = f"""基于以下视频描述，生成分镜脚本。要求：专业剪辑师级别，像可直接交给摄像师拍摄的指令。

## 视频描述
{part['description']}

## 画面比例
{aspect_ratio}

## 核心原则【必须遵守】
1. **拍摄指令而非影评**：描述应该是"要拍什么"，不是"看到了什么"
   - ❌ 错误："男主露出惊讶的表情"
   - ✅ 正确："特写：男主睁大眼睛，嘴唇微张，表情僵住约1.5秒"
2. **时间戳精确到毫秒**：每个镜头都要有精确的时间范围
3. **每个镜头至少1秒**：确保观众能看清画面、感受情绪
4. **时长≤15秒**：控制总时长
5. **禁止元注释**：不写"（情绪高潮）""（视觉亮点）"等括号内容

## 色调与光影（开篇写大致整体风格即可）
- 色调：大致色系倾向
- 光影：大致光源类型
- 氛围：大致情绪基调

## 输出格式
【视频{original_idx}】{part['description']}
总时长：X秒
色调/光影/氛围：具体描述

分镜1 [00:00.000-00:0X.000]:
[00:00.000] 景别: 具体画面描述（包含人物动作、表情、服装、道具、环境细节）

分镜2 [00:0X.000-00:XX.000]:
...

重要：只输出分镜脚本，不要任何分析或建议！"""

                                result = call_gemini_api(api_key, single_prompt)
                                content = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                                if content:
                                    all_results.append(f"【视频{original_idx}】{part['description']}\n{content}")

                    st.session_state["shots_data"] = "\n\n---\n\n".join(all_results)
                else:
                    # 不需要拆分，正常生成
                    prompt = f"""基于以下{len(descriptions)}个视频描述，生成分镜脚本。要求：专业剪辑师级别，像可直接交给摄像师拍摄的指令，而非影评。

## 视频描述
{chr(10).join([f"描述{i+1}: {d}" for i, d in enumerate(descriptions)])}

## 画面比例
{aspect_ratio}

## 核心原则【违反将被退回】
1. **拍摄指令vs影评**：
   - ❌ 错误："男主露出惊讶的表情，感受到命运的捉弄"
   - ✅ 正确："特写：男主睁大眼睛，镜头缓慢推进，背景音乐骤停"
2. **禁止元注释**：不用"（冲突点）""（情绪高潮）""（视觉亮点）"等括号
3. **用画面表达情绪**：观众通过画面感受到情绪，而非文字标注
4. **叙事流畅**：镜头间有逻辑关联，像讲故事推进
5. **节奏控制**：每个镜头≥1秒，确保观众看清
6. **时间戳精确**：毫秒级如[00:00.000]，合理分配时长

## 三维度分析建议（必须融入分镜）
{attraction_context}

## 色调与光影（开篇写大致整体风格即可）
- 色调：大致色系倾向
- 光影：大致光源类型
- 氛围：大致情绪基调

## 输出格式
【视频1】描述1
总时长：X秒
色调/光影/氛围：具体描述

分镜1 [00:00.000-00:0X.000]:
[00:00.000] 景别: 具体画面（人物+动作+表情+服装+道具+环境）
[00:0X.000] 景别: 下一个镜头...

分镜2 [00:0X.000-00:XX.000]:
...

【视频2】描述2
...

## 景别术语
远景/全景/中景/近景/特写/大特写

## 运镜术语
固定/微距缓推/快速推入/缓慢拉出/横摇跟随/轨道平移/手持晃动/升格慢镜头

重要：只输出分镜脚本，禁止分析/建议/点评！"""

                    result = call_gemini_api(api_key, prompt)
                    content = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")

                    if content:
                        st.session_state["shots_data"] = content
                    else:
                        st.error("未能获取结果，请重试")

    if "shots_data" in st.session_state:
        with col2:
            # 显示三个维度的分析结果
            attraction_raw = st.session_state.get("attraction_raw", [])
            if attraction_raw:
                st.subheader("🎯 多维度专业分析")
                for i, attr in enumerate(attraction_raw):
                    if attr:
                        # 获取时长和拆分信息
                        duration = attr.get("estimated_duration", "")
                        need_split = attr.get("need_split", False)
                        split_suggestion = attr.get("split_suggestion", "")

                        expander_title = f"描述{i+1}"
                        if duration:
                            expander_title += f" - {duration}秒"
                        if need_split:
                            expander_title += " ⚠️ 需拆分"

                        with st.expander(expander_title, expanded=True):
                            # 时长和拆分提示
                            if need_split:
                                st.warning(f"⏱️ 预计时长: {duration}秒 | 需要拆分成多段（每段≤15秒）")
                                st.markdown(f"**拆分建议:** {split_suggestion}")
                            elif duration:
                                st.info(f"⏱️ 预计时长: {duration}秒")

                            # 剪辑角度
                            editing = attr.get("editing_analysis", {})
                            if any(editing.values()):
                                st.markdown("### 🎬 剪辑角度")
                                if editing.get("conflict"):
                                    st.markdown(f"**冲突:** {editing.get('conflict', '')}")
                                if editing.get("suspense"):
                                    st.markdown(f"**悬念:** {editing.get('suspense', '')}")
                                if editing.get("emotion"):
                                    st.markdown(f"**情绪:** {editing.get('emotion', '')}")
                                if editing.get("visual"):
                                    st.markdown(f"**视觉:** {editing.get('visual', '')}")
                                if editing.get("rhythm"):
                                    st.markdown(f"**节奏:** {editing.get('rhythm', '')}")

                            # 导演角度
                            directing = attr.get("directing_analysis", {})
                            if any(directing.values()):
                                st.markdown("### 🎥 导演角度")
                                if directing.get("narrative_rhythm"):
                                    st.markdown(f"**叙事节奏:** {directing.get('narrative_rhythm', '')}")
                                if directing.get("shot_language"):
                                    st.markdown(f"**镜头语言:** {directing.get('shot_language', '')}")
                                if directing.get("emotion_curve"):
                                    st.markdown(f"**情感曲线:** {directing.get('emotion_curve', '')}")
                                if directing.get("transition_design"):
                                    st.markdown(f"**转场:** {directing.get('transition_design', '')}")

                            # 投放角度
                            publishing = attr.get("publishing_analysis", {})
                            if any(publishing.values()):
                                st.markdown("### 📢 投放角度")
                                if publishing.get("hook_shot"):
                                    st.markdown(f"**前3秒钩子:** {publishing.get('hook_shot', '')}")
                                if publishing.get("completion_key"):
                                    st.markdown(f"**完播关键:** {publishing.get('completion_key', '')}")
                                if publishing.get("interaction_point"):
                                    st.markdown(f"**互动点:** {publishing.get('interaction_point', '')}")
                                if publishing.get("risk_assessment"):
                                    st.info(f"**风险评估:** {publishing.get('risk_assessment', '')}")
                                if publishing.get("optimization"):
                                    st.success(f"**优化建议:** {publishing.get('optimization', '')}")

                            # 综合建议
                            if attr.get("comprehensive_suggestion"):
                                st.info(f"💡 **综合建议:** {attr.get('comprehensive_suggestion', '')}")

            st.markdown("---")
            with st.expander("📋 生成分镜（点击展开）", expanded=True):
                st.text(st.session_state["shots_data"])

# ==================== 模式4: 仅生成旁白 ====================

elif mode == "🎤 仅生成旁白":
    st.title("🎤 仅生成旁白")
    st.markdown("基于视频描述和原文案，分析吸引力点后生成匹配的新旁白")

    # 初始化旁白相关的session state
    if "narration_analysis" not in st.session_state:
        st.session_state["narration_analysis"] = None
    if "narrations" not in st.session_state:
        st.session_state["narrations"] = None
    if "video_analysis_result" not in st.session_state:
        st.session_state["video_analysis_result"] = None

    col1, col2 = st.columns([1, 1.5])
    with col1:
        st.subheader("📝 输入信息")

        # 视频上传
        st.markdown("**📹 上传视频（可选）**")
        uploaded_video = st.file_uploader(
            "选择视频文件",
            type=['mp4', 'mov', 'avi', 'webm'],
            help="支持 mp4, mov, avi, webm 格式"
        )

        video_description = ""

        if uploaded_video is not None:
            # 读取视频文件
            video_bytes = uploaded_video.read()
            # 转为 base64
            video_base64 = base64.b64encode(video_bytes).decode('utf-8')

            st.video(uploaded_video)
            st.caption(f"已上传: {uploaded_video.name}")

            # 分析视频按钮
            if st.button("🔍 分析视频内容", key="analyze_video"):
                with st.spinner("视频分析中，请稍候..."):
                    # 调用视频分析 API - 分镜级别分析
                    video_prompt = """请仔细分析这个视频，按分镜详细描述每个镜头的画面和旁白。

## 分析要求

### 一、分镜分析（最重要）
请将视频按照实际内容拆分成若干分镜（参考视频本身的分镜节奏），对于每个分镜需要分析：
1. **时间点**：这个镜头大约在视频的第几秒？
2. **画面描述**：画面中有什么人物？在做什么？场景是什么样的？人物表情/动作是什么？
3. **原旁白**：这个时间段对应的旁白是什么？（如果该时间段没有旁白则写"无"）

### 二、整体信息
1. **总时长**：视频大约多少秒？
2. **原完整旁白**：视频的完整旁白是什么？
3. **吸引力特点**：这个视频吸引人的地方是什么？（反常识/猎奇点/爽点）

### 三、反常识分析
分析原旁白中有哪些反常识/猎奇设定，这些是吸引观众的关键：
- 比如：谁在怀孕？（婆媳关系的反转）
- 比如：谁在帮助谁？（人物关系的反转）
- 比如：什么行为是反常规的？

## 输出格式（严格JSON）
```json
{
  "total_duration": "视频总时长（秒）",
  "original_narration": "完整原旁白",
  "attraction_points": "吸引力特点/反常识设定",
  "shots": [
    {
      "shot_index": 1,
      "time_range": "00:00-00:03",
      "description": "分镜画面描述：人物、动作、表情、场景",
      "original_narration": "该时间段的原旁白（无则写'无'）"
    },
    ...
  ]
}
```

重要：只输出JSON！每个分镜都要有画面描述和对应旁白！"""

                    result = call_gemini_video_api(api_key, video_prompt, video_base64, uploaded_video.type)

                    if "error" in result:
                        st.error(f"分析失败: {result.get('error')}")
                    else:
                        content = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        if content:
                            # 解析JSON结果
                            video_analysis = parse_json_response(content)
                            if video_analysis:
                                st.session_state["video_analysis_result"] = video_analysis
                                st.success("视频分析完成！")
                                st.rerun()
                            else:
                                # 如果解析失败，保存原始内容作为描述
                                st.session_state["video_analysis_result"] = {"video_content": content}
                                st.success("视频分析完成！")
                                st.rerun()
                        else:
                            st.error("无法获取分析结果")

        # 显示已分析的结果
        video_analysis_result = st.session_state.get("video_analysis_result")
        if video_analysis_result:
            with st.expander("📊 视频分析结果", expanded=True):
                if isinstance(video_analysis_result, dict):
                    if video_analysis_result.get("video_content"):
                        st.markdown("**画面内容：**")
                        st.write(video_analysis_result.get("video_content"))
                    if video_analysis_result.get("original_narration"):
                        st.markdown("**原旁白/台词：**")
                        st.write(video_analysis_result.get("original_narration"))
                    if video_analysis_result.get("attraction_analysis"):
                        st.markdown("**吸引力分析：**")
                        attraction = video_analysis_result.get("attraction_analysis", {})
                        if attraction.get("hook"):
                            st.success(f"钩子: {attraction.get('hook')}")
                        if attraction.get("highlight"):
                            st.markdown(f"亮点: {attraction.get('highlight')}")
                        if attraction.get("emotion"):
                            st.markdown(f"情绪: {attraction.get('emotion')}")
                        if attraction.get("memory_point"):
                            st.markdown(f"记忆点: {attraction.get('memory_point')}")

        # 原文案
        original_narration = st.text_area(
            "原文案（可选）",
            placeholder="如果有关联的原文案可以输入...",
            height=80
        )

        # 生成数量
        narration_count = st.slider("生成变体数量", min_value=1, max_value=5, value=3)

        # 清除按钮
        if st.session_state.get("narrations") or st.session_state.get("video_analysis_result"):
            if st.button("🗑️ 清除结果", key="clear_narration"):
                st.session_state["narrations"] = None
                st.session_state["video_analysis_result"] = None
                st.session_state["srt_files"] = None
                st.rerun()

        generate_btn = st.button("🚀 生成旁白", type="primary", disabled=not api_key)

    # 生成逻辑
    if generate_btn:
        if not api_key:
            st.error("请先输入 API Key")
        elif not st.session_state.get("video_analysis_result"):
            st.error("请先上传视频并分析")
        else:
            # 直接使用视频分析结果生成旁白
            with st.spinner("🎤 旁白生成中..."):
                video_analysis = st.session_state["video_analysis_result"]

                # 构建分析上下文
                video_content = video_analysis.get("video_content", "")
                orig_nar = video_analysis.get("original_narration", "")
                attraction = video_analysis.get("attraction_analysis", {})

                # 获取分镜分析结果
                shots = video_analysis.get("shots", [])
                total_duration = video_analysis.get("total_duration", "")
                orig_nar = video_analysis.get("original_narration", "")
                orig_char_count = len(orig_nar) if orig_nar else 0
                attraction_points = video_analysis.get("attraction_points", "")

                # 构建分镜信息
                shots_context = ""
                if shots:
                    for shot in shots:
                        shots_context += f"""
分镜{shot.get('shot_index', '')} [{shot.get('time_range', '')}]:
- 画面: {shot.get('description', '')}
- 原旁白: {shot.get('original_narration', '')}
"""
                else:
                    shots_context = "无分镜信息"

                # 构建生成提示
                generation_prompt = f"""基于以下分镜级别的视频分析，为每个分镜生成匹配的新旁白。

## 业务背景
这是短视频广告素材的旁白生成，需要：
1. 配合画面节奏，旁白与画面同步
2. 口语化、自然流畅，适合配音朗读
3. 能引发情绪共鸣或好奇
4. 保持或强化原视频的"反常识/猎奇"设定

## 视频信息
- 总时长: {total_duration}秒
- 原旁白: {orig_nar if orig_nar else '无'}
- 原旁白字数: {orig_char_count}字
- 吸引力/反常识: {attraction_points if attraction_points else '无明确标注'}

## 分镜信息
{shots_context}

## 核心要求【重要】
1. **分镜匹配**：每个分镜的旁白必须与该分镜的画面内容完全匹配
2. **故事连贯**：所有分镜的旁白串联起来是一个完整的故事
3. **反常识强化**：保持或强化原旁白中的"反转/猎奇/反常识"设定
4. **每句独立**：每句旁白单独看也要能让人理解
5. **字数严格控制**：新旁白总字数必须精确控制在{orig_char_count}字，误差不超过5字

## 输出格式（严格JSON数组，每个变体包含风格描述和分镜旁白）
[
  {{
    "variant_id": 1,
    "style": "风格简述（如：疑问句开场/反常识对比/情绪递进/金句点睛）",
    "shot_narrations": [
      {{"shot_index": 1, "narration": "分镜1的新旁白"}},
      {{"shot_index": 2, "narration": "分镜2的新旁白"}}
    ]
  }}
]

重要：只输出JSON数组，不要有任何解释性文字！"""

                result = call_gemini_api(api_key, generation_prompt)
                content = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                narrations = parse_json_response(content)

                if narrations:
                    st.session_state["narrations"] = narrations
                else:
                    st.error("无法解析结果，请重试")
                    st.text_area("调试-原始返回", content, height=150)

    # 显示结果
    with col2:
        # 显示视频分析结果
        video_analysis = st.session_state.get("video_analysis_result")
        if video_analysis:
            st.subheader("🎯 分镜级别分析")

            # 统计原旁白字数
            orig_nar_full = video_analysis.get("original_narration", "")
            orig_char_count = len(orig_nar_full) if orig_nar_full else 0
            st.info(f"📊 原旁白字数: {orig_char_count} 字")

            # 显示分镜信息
            shots = video_analysis.get("shots", [])
            if shots:
                for shot in shots:
                    with st.expander(f"📹 分镜{shot.get('shot_index', '')} [{shot.get('time_range', '')}]"):
                        st.markdown(f"**画面描述:** {shot.get('description', '')}")
                        st.markdown(f"**原旁白:** {shot.get('original_narration', '')}")

            # 显示吸引力特点
            if video_analysis.get("attraction_points"):
                st.success(f"**吸引力/反常识:** {video_analysis.get('attraction_points', '')}")

            # 显示原旁白
            if video_analysis.get("original_narration"):
                with st.expander("📝 完整原旁白"):
                    st.write(video_analysis.get("original_narration"))

            st.markdown("---")

        # 显示生成的旁白
        if st.session_state.get("narrations"):
            st.subheader(f"🎤 生成的旁白 ({len(st.session_state['narrations'])}个)")

            # 统计新旁白字数
            for i, nar in enumerate(st.session_state["narrations"]):
                shot_narrations = nar.get("shot_narrations", [])
                if shot_narrations:
                    new_char_count = sum(len(sn.get("narration", "")) for sn in shot_narrations)
                else:
                    new_char_count = len(nar.get("narration", ""))

                st.metric(f"变体{i+1} 新旁白字数", f"{new_char_count} 字")

            # 显示每个变体的旁白
            for i, nar in enumerate(st.session_state["narrations"]):
                with st.expander(f"变体 {i+1}", expanded=True):
                    if nar.get("style"):
                        st.markdown(f"**风格:** {nar.get('style', '')}")

                    # 显示分镜级别的旁白
                    shot_narrations = nar.get("shot_narrations", [])
                    if shot_narrations:
                        for sn in shot_narrations:
                            shot_idx = sn.get("shot_index", "")
                            st.markdown(f"**分镜{shot_idx}:** {sn.get('narration', '')}")
                    else:
                        # 兼容旧格式
                        st.markdown(f"**旁白:** {nar.get('narration', '')}")

                    # 生成完整旁白用于复制
                    full_nar = ""
                    if shot_narrations:
                        for sn in shot_narrations:
                            full_nar += sn.get("narration", "") + " "
                    else:
                        full_nar = nar.get("narration", "")

                    st.code(full_nar.strip(), language=None)

            # 字幕生成选项
            with st.expander("📝 生成字幕文件", expanded=True):
                col_sub1, col_sub2 = st.columns([1, 1])
                with col_sub1:
                    est_duration = st.number_input("视频预计时长（秒）", min_value=1, max_value=300, value=int(video_analysis.get("total_duration", 15)) if video_analysis else 15, help="用于计算每句旁白的字幕时长")
                with col_sub2:
                    st.write("")
                    st.write("")
                    if st.button("🎬 生成字幕文件", type="primary"):
                        st.session_state["srt_files"] = []
                        st.session_state["srt_est_duration"] = est_duration
                        st.success(f"已生成字幕文件！")
