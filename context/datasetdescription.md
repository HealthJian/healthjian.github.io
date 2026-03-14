# 毕业设计原始数据 datasets 数据集统计与内容总结

## 1. 分析范围与方法

- 分析目录：`datasets/raw`
- 分析方式：
  - **全量扫描**：中小文件（如 `job_dataset.csv`、`Resume.csv`、`train_data.json`、`job_dataset.json`）
  - **抽样扫描**：超大文件 `job_descriptions.csv`（抽样 120,000 行）以保证效率与稳定性
  - **编码自适应**：`resumeJDchinese.csv` 采用 `gb18030` 解码

## 2. 全局规模概览

- 文件总数：`6490`
- 总体积：约 `2.46 GB`（`2,464,475,135` bytes）
- 文件类型分布：
  - `.pdf`：`4484`
  - `.docx`：`2000`
  - `.csv`：`4`
  - `.json`：`2`

按子目录看：

- `raw/english`：`2485` 文件（`2484` 个 PDF + `1` 个 CSV）
- `raw/chinese`：`4001` 文件（`2000` 个 PDF + `2000` 个 DOCX + `1` 个 JSON）

## 3. 核心结构化文件统计

### 3.1 `job_dataset.csv`

- 文件大小：`611,247` bytes
- 记录数：`1068`
- 字段数：`7`  
  `JobID, Title, ExperienceLevel, YearsOfExperience, Skills, Responsibilities, Keywords`
- 缺失情况：
  - `Title` 缺失 `1` 条（缺失率约 `0.094%`）
- 重复行：`0`
- 内容特征：
  - 岗位分布非常均衡（多个 Title 均出现 `20` 次）
  - 经验层级标签存在命名不统一（如 `Mid-Level`、`Mid-level`、`Mid-Senior`、`Mid-Senior Level`）
  - 年限字段格式混杂（`0-1`、`3+`、`3-5 years`、`0–1 year`、`10+` 等）

### 3.2 `job_dataset.json`

- 文件大小：`1,267,902` bytes
- 顶层结构：`list`
- 记录数：`1068`
- 字段完整性：
  - `Title` 出现 `1067` 次，其余核心字段均为 `1068` 次
- 结构特征：
  - 与 `job_dataset.csv` 语义上对应，但 `Skills/Responsibilities/Keywords` 为数组结构，更适合 NLP/特征工程
  - `Skills` 数量范围：`4 ~ 27`，平均约 `11.47`

### 3.3 `Resume.csv`（英文简历）

- 文件大小：`56,270,696` bytes
- 记录数：`2484`
- 字段数：`4`  
  `ID, Resume_str, Resume_html, Category`
- 缺失情况：
  - `Resume_str` 缺失 `1` 条（缺失率约 `0.040%`）
- 重复行：`0`
- 内容特征：
  - 同时保留纯文本与 HTML，适合做文本抽取、清洗规则对比与信息抽取实验

### 3.4 `train_data.json`（中文简历结构化数据）

- 文件大小：`6,734,887` bytes
- 顶层结构：`dict`
- 记录数：`2000`
- 常见字段覆盖（出现次数）：
  - `姓名`、`教育经历`、`电话`、`工作经历`：`2000`
  - `项目经历`：`1600`
  - `籍贯`：`1400`
  - `出生年月`：`1200`
  - `最高学历`：`1000`
  - `性别`：`800`
  - `政治面貌`、`落户市县`：`600`
- 内容特征：
  - 主体字段完整度较高，但部分个人属性字段有明显缺省（可能是“可选字段”）
  - `工作经历.职务` 的高频职位较分散，适合做中文岗位实体标准化

### 3.5 `resumeJDchinese.csv`（中文 JD/岗位文本）

- 文件大小：`30,437,670` bytes
- 编码：`gb18030`
- 记录数：`31,035`
- 列数：`10`
- 数据质量：
  - 重复行：`6,274`（重复率约 `20.22%`）
  - 薪资列（第 4 列）缺失率约 `1.06%`
- 内容特征：
  - 城市高频：`广州-天河区`、`异地招聘`、`深圳-龙岗区`、`深圳-南山区` 等
  - 该文件看起来**无标准表头**，首行即数据（首行被误识别为 header 的风险较高）

### 3.6 `job_descriptions.csv`（超大英文岗位数据）

- 文件大小：`1,743,166,140` bytes（约 `1.74 GB`）
- 字段数：`23`
- 抽样规模：`120,000` 行
- 抽样质量指标：
  - 重复行：`0`
  - `Company Profile` 缺失率约 `0.34%`
  - `Salary Range` 非空率：`100%`（抽样内）
- 抽样分布特征：
  - `Work Type` 在 `Full-Time / Part-Time / Temporary / Intern / Contract` 之间较均衡
  - `Preference`（Male/Female/Both）接近均衡
  - `Qualifications`（B.Com/BA/BBA/B.Tech/PhD...）近似均匀分布
  - 国家分布与岗位分布也呈“长尾+近均匀”特征，疑似经过程序化生成或强平衡采样

## 4. 数据质量与可用性结论

### 优势

- 数据规模大，覆盖中英文、简历/JD、结构化/半结构化/文本混合形态
- 多个文件字段设计清晰，可直接用于匹配建模、信息抽取、分类与检索任务
- `Resume.csv` 与 `train_data.json` 可形成中英文简历处理对照数据

### 主要风险

- 字段标准不统一（尤其经验等级与工作年限）
- 编码不统一（UTF-8 与 GB18030 混用）
- `resumeJDchinese.csv` 重复率高（约 20%）
- 超大文件无法每次全量交互式扫描，需要分块/抽样处理策略

## 5. 建议的数据清洗与建模准备

1. **统一编码**：全部转为 UTF-8（保留原始副本）
2. **标准化标签**：
   - `ExperienceLevel` 映射到统一枚举（Junior/Mid/Senior/Lead）
   - `YearsOfExperience` 归一为区间下上界（如 `min_years`, `max_years`）
3. **去重策略**：
   - `resumeJDchinese.csv` 先全表去重，再按 `岗位名+公司+城市+发布日期` 近重复清理
4. **大文件分块处理**：
   - 对 `job_descriptions.csv` 使用分块读取（chunk）与离线统计缓存
5. **文本清洗**：
   - 去 HTML 标签（英文简历）
   - 中文列表字段（字符串化 list）解析还原
6. **构建统一训练视图**：
   - 统一输出字段：`title/skills/responsibilities/experience/location/salary/text`

## 6. 可直接支持的任务场景

- 简历-岗位匹配（中英双语）
- 岗位分类与职级识别
- 技能抽取与技能图谱构建
- 招聘市场分布分析（城市/薪资/学历/工种）
- LLM 招聘问答与检索增强（RAG）

---

本次分析在“大数据集体量”前提下采用了“全量+抽样”的稳健策略；若你需要，我可以下一步继续产出：

- `dataset_cleaning_plan.md`（可执行清洗方案）
- `data_dictionary.md`（统一字段字典）
- `quality_report.csv`（逐文件质量评分）
