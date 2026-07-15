---
title: "从“能跑”到“可信”：我的数学建模工作流搭建实录"
description: "记录我用 VS Code、MiKTeX、Python、Codex 和 GitHub 搭建数学建模工作流的过程：从环境复现、模型验证到论文证据链和提交检查。"
pubDate: "2026-07-15T20:30:00+08:00"
heroImage: "/category-research-notes.webp"
badge: "工作流"
tags: ["数学建模", "工作流", "个人研究", "GitHub"]
---

过去做数学建模时，我经常遇到几个问题：代码、数据和论文散落在不同位置；图表无法追溯到生成代码；换一台电脑后环境无法复现；比赛临近提交时，才发现论文存在缺图、路径泄露或引用错误。

因此，我搭建了一套以 **VS Code、MiKTeX、LaTeX Workshop、Python、Codex 和 GitHub** 为核心的数学建模工作流。它不仅能完成计算和论文编译，还加入了模型可信度验证、证据追踪和提交检查。

本文记录整个搭建过程。

## 一、工作流目标

我希望各工具职责明确：

- **MathModelHub**：提供算法、模板和竞赛资料参考；
- **VS Code**：统一管理项目；
- **MiKTeX + XeLaTeX**：编译中文论文；
- **LaTeX Workshop**：提供预览、跳转和错误定位；
- **Python/Jupyter**：数据处理、建模、验证和绘图；
- **Codex**：辅助写代码、修改 LaTeX、排查错误和审查模型逻辑；
- **Git/GitHub**：管理版本并支持三人协作；
- **CODEX.md**：约束 AI 不得编造数据、结果和参考文献；
- **checklist 与自动脚本**：执行提交前质量检查。

工作区使用英文目录，避免中文路径导致 LaTeX、Python 或命令行工具出现兼容问题。

## 二、项目结构

最终项目按比赛流程划分：

```plaintext
CUMCM2026/
├── 00_inbox/                 # 队友临时投递题目和附件
├── 00_official/              # 官方通知和格式要求
├── 01_problem/               # 题目、问题拆解和题目清单
├── 02_raw_data/              # 只读原始数据
├── 03_processed_data/        # 清洗后和中间数据
├── 04_code/                  # 建模、验证和绘图代码
├── 05_model_results/         # 模型结果与隔离运行记录
├── 06_paper_assets/          # 论文图表
├── 07_paper/                 # LaTeX 论文
├── 08_supporting_materials/  # 支撑材料和复现说明
├── 09_ai_logs/               # AI 使用记录
├── 10_submission_check/      # 自动提交检查
└── 11_final_submission/      # 最终冻结文件
```

队友拿到题目后，不需要先研究文件应该放在哪里，只需把 PDF 和附件放进 `00_inbox`。整理时再将题目、原始数据和官方通知移动到对应目录，并生成文件清单与 SHA256。

## 三、解决环境问题

### 1. LaTeX 编译环境

论文采用：

```plaintext
ctexart + XeLaTeX + BibTeX + gbt7714
```

正式编译命令为：

```powershell
cd 07_paper
..\.local\bin\latexmk.cmd -xelatex -outdir=build main.tex
```

所有 `.aux`、`.log`、`.bbl`、`.xdv` 等辅助文件统一进入 `07_paper/build`。

搭建时遇到两个典型问题：

1. `latexmk` 需要 Perl，但系统最初没有可用的 Perl；
2. MiKTeX 最初找不到 `gbt7714`。

最终将 Strawberry Perl 和便携 MiKTeX 安装在 E 盘，并通过项目本地包装器调用，避免把大型环境和缓存写入 C 盘。

另外，当前 `gbt7714` 包已经把旧名称 `gbt7714-numerical` 标记为废弃别名。使用它会让 `bibtexu` 返回非零状态，因此正式模板改用包推荐的：

```latex
\bibliographystyle{gbt7714-numeric}
```

引用体系仍然是 BibTeX，没有混入 Biber 或 `biblatex`。

### 2. Python 环境

项目使用独立虚拟环境：

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

主要依赖包括：

- pandas、NumPy、SciPy；
- scikit-learn、statsmodels；
- matplotlib、Plotly；
- openpyxl；
- PyYAML、Pillow；
- Jupyter。

Python 临时文件、Jupyter 缓存和绘图缓存也尽量保存在项目所在的 E 盘。

## 四、先让 Q1–Q4 稳定运行

为了验证工作流，我使用 2025 年 CUMCM D 题作为练习题。

基础流程包括：

1. 读取和标准化 Excel 附件；
2. 构建矿井三维网络；
3. 将突水点投影到最近巷道并建立虚拟节点；
4. 使用事件驱动模型计算水流传播；
5. 使用时间依赖路径算法规划逃生路线；
6. 生成 Q1–Q4 官方格式 Excel；
7. 生成论文图表和支撑材料。

无参数命令保留为最稳定的基线入口：

```powershell
.\.venv\Scripts\python.exe 04_code\run_all.py
```

它只执行原有的 11 个基线阶段，不会自动运行耗时较长的替代模型、空间收敛和冷启动复现。

## 五、从“程序正确”升级为“模型可信”

代码能够运行，并不代表模型一定可信。第二阶段重点补充模型假设、替代模型和证据链。

### 1. 假设风险登记

高风险假设统一登记在：

```plaintext
04_code/config/assumptions_registry.yml
```

首批登记了四项假设：

- 分叉处平均分流；
- 非水平巷道只允许从高处向低处传播；
- 水平巷道按名义势定向；
- 时间依赖边满足 FIFO 条件。

每项假设都需要记录风险等级、影响结果、验证方法、替代模型、负责人和最终处理结论。

### 2. 实验配置集中管理

所有实验参数集中放在：

```plaintext
04_code/config/experiment_plan.yml
```

其中包括：

- 基线模型；
- 替代分流规则；
- FIFO 数值检验；
- 空间分段收敛；
- 参数敏感性；
- 结构敏感性；
- 样本集合比较；
- 图表质量门禁；
- 冷启动复现。

这样可以避免参数散落在多个 Python 文件中。

### 3. 运行结果隔离

每次审计运行都会生成唯一的 `run_id`：

```plaintext
05_model_results/runs/<run_id>/
```

每个运行保存：

```plaintext
run_manifest.json
config_snapshot.yml
input_checksums.json
environment.json
stage_report.json
```

基线、替代模型、FIFO、收敛实验和图表分别进入独立子目录，避免不同实验互相覆盖。

## 六、可信度验证模块

### FIFO 数值检验

系统会在所有水流状态事件边界前后采样，并对可疑区间进行自适应加密。

本次实际审计检查了：

- 7,828 条有向边；
- 244,468 个出发时刻样本；
- 未发现 FIFO 违反。

这里必须强调：这只是“数值检验未发现违反”，不能写成数学证明。

如果未来检测到 FIFO 违反，工作流会停用依赖 FIFO 的普通时间依赖 Dijkstra；若非 FIFO 后备算法尚未实现，则禁止输出正式逃生路线。

### 替代模型比较

分流规则使用独立策略接口，目前实现：

```plaintext
equal
slope_weighted
capacity_weighted
```

每个策略必须返回分流权重和诊断信息，并检查：

- 权重非负；
- 权重总和为 1；
- 候选巷道集合一致；
- 质量守恒误差在阈值内。

### 空间收敛实验

空间分段采用确定性规则，并保留原始巷道编号映射。

测试尺度为：

```plaintext
400 m、200 m、100 m
```

比较指标包括：

- 绝对误差；
- 相对误差；
- RMSE；
- 覆盖范围 Jaccard；
- 出口一致率；
- 路线重合率；
- 运行时间。

矿井 1 在部分较粗尺度下超过了配置阈值。工作流没有隐藏这些结果，而是保留为模型风险警告，等待进一步解释或采用更细尺度。

## 七、建立论文证据链

论文结论和证据分开登记：

```plaintext
07_paper/evidence/claims.csv
07_paper/evidence/evidence_links.csv
```

每条重要结论需要关联：

- 来源 `run_id`；
- 结果文件；
- 指标名称；
- 文件 SHA256；
- 验证方法；
- 人工复核状态。

自动脚本只检查文件、指标和 hash 是否真实存在，不尝试自动判断自然语言结论是否合理。

图表则登记在：

```plaintext
06_paper_assets/figure_manifest.csv
```

其中记录图表用途、来源数据、坐标轴、单位、分辨率、DPI、论文宽度、统一色标和人工审核人。

脚本可以检查技术属性，但无法判断一张图是否真正支持论文结论，因此 final 模式要求正文图表必须经过人工复核。

## 八、冷启动复现

为了发现隐藏的绝对路径和本机依赖，工作流设计了两种冷启动：

### smoke_fixture

使用内置小型数据，在新的 E 盘目录中运行两次，并比较结果 SHA256。

### full_local

通过环境变量提供正式输入：

```powershell
$env:CUMCM_INPUT_ROOT = (Resolve-Path 02_raw_data)
```

随后把代码和输入复制到全新目录，重新执行完整基线和论文编译。

第一次 full_local 测试失败了。原因不是模型，而是临时目录误选了 C 盘的另一套 MiKTeX，其中缺少 `geometry`。

修复后，run context 会显式注入项目记录的 E 盘 Portable MiKTeX 和 Perl，并保存模型与 LaTeX 子进程日志。

最终验证结果：

- smoke_fixture：PASS；
- full_local：PASS；
- 36/36 个 CSV 和 Excel 结果一致；
- PDF 编译成功；
- PDF 页数和提取文本一致。

## 九、提交质量门禁

提交检查支持：

```powershell
python 10_submission_check/check_submission.py --root . --mode draft
python 10_submission_check/check_submission.py --root . --mode final
```

检查内容包括：

- 敏感身份信息；
- 个人绝对路径；
- LaTeX 缺失文件和未定义引用；
- 占位符；
- Python 缓存；
- 临时文件和辅助文件；
- 图表人工复核；
- 高风险假设状态；
- 结论证据 hash；
- 最终 PDF 和 SHA256；
- 冷启动复现状态。

实际结果为：

```plaintext
draft：0 ERROR，14 WARNING
final：17 ERROR，被正确阻断
```

final 的错误不是程序故障，而是尚未完成的人工事项，包括：

- 9 张图表未人工复核；
- 4 个高风险假设仍未审定；
- 本地敏感词文件尚未填写；
- 最终 PDF 和校验值尚未冻结；
- 最终来源 `run_id` 尚未登记。

这正是质量门禁的意义：不能为了“显示绿色”而隐藏真实问题。

## 十、Git 与 GitHub 管理

仓库保持 Private，只允许正式队员访问。

Git 中提交：

- 源代码；
- 配置文件；
- LaTeX 源码；
- 数据清单和 SHA256；
- AI 使用日志；
- 小型验证报告；
- 复现说明。

Git 中排除：

- 原始比赛附件；
- 中间 PDF；
- ZIP/RAR；
- Python 和 Jupyter 缓存；
- LaTeX build 文件；
- 完整隔离运行目录；
- 本地敏感词配置；
- 未冻结的模型结果。

最终工作流已经提交并推送到私有 GitHub 仓库，本地和远程提交 SHA 完全一致。

## 十一、拿到新题后的标准流程

今后拿到题目，可以按以下顺序工作：

```plaintext
1. 队友将题目和附件放入 00_inbox
2. 整理到 01_problem 和 02_raw_data
3. 生成 manifest 与 SHA256
4. 执行数据检查和预处理
5. 运行无参数基线流程
6. 检查 Q1–Q4 和质量守恒
7. 使用 audit profile 做模型可信度审计
8. 将结论登记到 evidence 表
9. 生成并人工复核论文图表
10. 编译 LaTeX 论文
11. 执行 full_local 冷启动
12. 运行 final 提交检查
13. 双人交叉复核
14. 冻结最终 PDF 与 SHA256
```

## 结语

这次搭建让我认识到，一套可靠的数学建模工作流不只是“一键运行代码”。

它还需要回答：

- 这个结果来自哪次运行？
- 使用了什么参数和输入？
- 高风险假设是否验证？
- 替代模型会不会改变结论？
- 图表是否真正支持论文？
- 换一台电脑能否复现？
- 最终提交是否泄露身份或路径？

自动化不能代替建模判断和人工复核，但它可以把大量低级错误提前暴露，让团队把有限的比赛时间用在模型选择、结果解释和论文表达上。

这套工作流目前已经从“能运行”升级到了“可追溯、可审计、可复现”，接下来真正重要的工作，是用它完成高质量的建模分析，而不是为了通过检查而制造漂亮但不真实的结果。
