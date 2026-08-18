# -*- coding: utf-8 -*-
"""fig09 LLM + 专用模型插件 良率决策混合架构图（五层）"""
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
from _figstyle import (C_MAIN, C_TEAL, C_SAND, C_SLATE, C_GRAY, C_BG,
                       save)

ARROW_C = "#666666"
TXT = "#222222"


def rbox(ax, x, y, w, h, fc, ec, lw=1.2, alpha=0.22, zorder=2, ls="-"):
    p = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.03",
                       fc=fc, ec=ec, lw=lw, alpha=alpha, zorder=zorder, linestyle=ls)
    ax.add_patch(p)
    return p


def text(ax, x, y, s, fs=9.5, weight="normal", color=TXT, **kw):
    kw.setdefault("ha", "center")
    kw.setdefault("va", "center")
    ax.text(x, y, s, fontsize=fs, color=color, weight=weight, zorder=5, **kw)


def arrow(ax, x1, y1, x2, y2, lw=1.4, color=ARROW_C, style="-|>", ls="-",
          zorder=3, conn=None):
    a = FancyArrowPatch((x1, y1), (x2, y2), arrowstyle=style, mutation_scale=12,
                        color=color, lw=lw, linestyle=ls, zorder=zorder,
                        shrinkA=1, shrinkB=1,
                        connectionstyle=conn or "arc3,rad=0")
    ax.add_patch(a)


fig, ax = plt.subplots(figsize=(12.5, 8))
ax.set_xlim(0, 12.5)
ax.set_ylim(0, 8)
ax.axis("off")
fig.patch.set_facecolor(C_BG)

X0, XW = 1.2, 10.1   # 主体内容横向范围
XC = X0 + XW / 2

# ---------- L1 用户/工程师层 ----------
rbox(ax, 3.35, 6.95, 2.3, 0.85, C_SLATE, C_SLATE, alpha=0.20)
text(ax, 4.5, 7.375, "良率工程师", fs=10, weight="bold")
rbox(ax, 6.85, 6.95, 2.5, 0.85, C_SLATE, C_SLATE, alpha=0.20)
text(ax, 8.1, 7.375, "查询与审批\n（HITL 人在环）", fs=9)
text(ax, 0.25, 7.375, "L1\n用户/工程师层", fs=9, color="#555555", ha="left")

# ---------- L2 LLM 编排层 ----------
rbox(ax, X0, 4.95, XW, 1.55, C_MAIN, C_MAIN, lw=1.6, alpha=0.16)
text(ax, XC, 6.24, "L2  LLM 编排层：Qwen（DAPO 训练）", fs=11, weight="bold",
     color="#7A3E39")
chips = ["任务规划", "工具选择", "证据链推理", "报告生成"]
cw, gap = 2.05, 0.35
total = 4 * cw + 3 * gap
cx0 = XC - total / 2
for i, c in enumerate(chips):
    rbox(ax, cx0 + i * (cw + gap), 5.14, cw, 0.62, "#FFFFFF", C_MAIN,
         lw=1.0, alpha=1.0)
    text(ax, cx0 + i * (cw + gap) + cw / 2, 5.45, c, fs=9.5, color="#7A3E39")

# ---------- L3 工具/插件层 ----------
text(ax, XC, 4.52, "MCP / Function Calling 接口", fs=9, color="#555555")
l3w, l3h, l3y = 3.15, 1.15, 3.15
l3x = [X0, X0 + 3.48, X0 + 6.96]
l3txt = ["XGBoost / TabNet\n良率预测服务\n（概率 + SHAP + 置信度）",
         "虚拟量测 VM 服务\n（VM 估计 +\n不确定性量化）",
         "特征重要性 / 漂移\n诊断服务\n（SHAP + PSI 监测）"]
for x, t in zip(l3x, l3txt):
    rbox(ax, x, l3y, l3w, l3h, C_TEAL, C_TEAL, lw=1.3, alpha=0.20)
    text(ax, x + l3w / 2, l3y + l3h / 2, t, fs=8.8)
text(ax, 0.25, l3y + l3h / 2, "L3\n工具/插件层", fs=9, color="#555555", ha="left")

# ---------- L4 数据层 ----------
l4w, l4h, l4y = 3.15, 0.95, 1.55
l4txt = ["特征仓库\n（Feast）", "FDC / MES /\n量测数据湖", "历史良率\n标签库"]
for x, t in zip(l3x, l4txt):
    rbox(ax, x, l4y, l4w, l4h, C_SAND, C_SAND, lw=1.3, alpha=0.28)
    text(ax, x + l4w / 2, l4y + l4h / 2, t, fs=9)
text(ax, 0.25, l4y + l4h / 2, "L4\n数据层", fs=9, color="#555555", ha="left")

# ---------- L5 治理层 ----------
rbox(ax, X0, 0.3, XW, 0.62, C_GRAY, C_GRAY, lw=1.2, alpha=0.18)
text(ax, XC, 0.61, "L5  治理层：数据版本血缘 ｜ 防泄漏时间切分 ｜ 漂移监控",
     fs=9.5, color="#444444")

# ---------- 箭头 ----------
# L1 <-> L2
arrow(ax, 4.5, 6.93, 4.5, 6.53, lw=1.4)
arrow(ax, 4.75, 6.53, 4.75, 6.93, lw=1.4)
text(ax, 4.0, 6.72, "指令", fs=8, color="#555555", ha="right")
arrow(ax, 8.35, 6.93, 8.35, 6.53, lw=1.4)
arrow(ax, 8.6, 6.53, 8.6, 6.93, lw=1.4)
text(ax, 9.0, 6.72, "建议/报告", fs=8, color="#555555", ha="left")

# L2 <-> L3（调用/返回，三个模块）
for x in l3x:
    xm = x + l3w / 2
    arrow(ax, xm - 0.18, 4.93, xm - 0.18, 4.33, lw=1.3)
    arrow(ax, xm + 0.18, 4.33, xm + 0.18, 4.93, lw=1.3)
text(ax, l3x[0] + l3w / 2 - 0.45, 4.66, "调用", fs=8, color="#555555", ha="right")
text(ax, l3x[0] + l3w / 2 + 0.45, 4.66, "返回", fs=8, color="#555555", ha="left")

# L3 <-> L4
for x in l3x:
    xm = x + l4w / 2
    arrow(ax, xm - 0.18, 3.13, xm - 0.18, 2.53, lw=1.3)
    arrow(ax, xm + 0.18, 2.53, xm + 0.18, 3.13, lw=1.3)
text(ax, l3x[0] + l3w / 2 - 0.45, 2.85, "读取", fs=8, color="#555555", ha="right")
text(ax, l3x[0] + l3w / 2 + 0.45, 2.85, "写入", fs=8, color="#555555", ha="left")

# L5 向上虚线“贯穿保障”
for xx in (0.8, 11.7):
    arrow(ax, xx, 0.95, xx, 4.9, lw=1.1, color=C_GRAY, ls=(0, (4, 3)),
          style="-|>")
text(ax, 12.05, 2.9, "贯穿保障", fs=8.5, color=C_GRAY, rotation=90)

fig.tight_layout()
save(fig, "fig09_hybrid_architecture")
