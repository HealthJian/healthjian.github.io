# -*- coding: utf-8 -*-
"""fig12 技术路线选型决策树（三层判断，自上而下）"""
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

# ---------- 根节点 ----------
rbox(ax, 4.65, 6.95, 3.2, 0.72, C_SLATE, C_SLATE, lw=1.5, alpha=0.22)
text(ax, 6.25, 7.31, "决策任务的本质？", fs=12, weight="bold", color="#3F4A56")

# ---------- 第二层：三类任务本质 ----------
b1x, b1w = 0.45, 3.7
b2x, b2w = 4.75, 3.0
b3x, b3w = 8.35, 3.7
by, bh = 5.15, 1.05
rbox(ax, b1x, by, b1w, bh, C_SLATE, C_SLATE, lw=1.2, alpha=0.14)
text(ax, b1x + b1w / 2, by + bh / 2,
     "数值参数调节 / 控制\n（动作 = 连续/离散参数，horizon 短，\n可建仿真）", fs=9)
rbox(ax, b2x, by, b2w, bh, C_SLATE, C_SLATE, lw=1.2, alpha=0.14)
text(ax, b2x + b2w / 2, by + bh / 2,
     "语言推理 / 证据链 /\n报告生成\n（动作 = 文本，需领域先验\n与可解释叙述）", fs=9)
rbox(ax, b3x, by, b3w, bh, C_SLATE, C_SLATE, lw=1.2, alpha=0.14)
text(ax, b3x + b3w / 2, by + bh / 2,
     "良率分类 / 打分\n（判别式预测）", fs=9.5)

# 根 -> 三个分支
arrow(ax, 5.4, 6.93, b1x + b1w / 2, by + bh + 0.03, conn="arc3,rad=0.18")
arrow(ax, 6.25, 6.93, b2x + b2w / 2, by + bh + 0.03)
arrow(ax, 7.1, 6.93, b3x + b3w / 2, by + bh + 0.03, conn="arc3,rad=-0.18")

# ---------- 分支1：环境判断 + 两个叶子 ----------
d1x, d1w, d1y, d1h = 0.85, 2.9, 3.75, 0.72
rbox(ax, d1x, d1y, d1w, d1h, C_SLATE, C_SLATE, lw=1.3, alpha=0.22)
text(ax, d1x + d1w / 2, d1y + d1h / 2, "是否有交互环境 /\n数字孪生？", fs=9.5,
     weight="bold", color="#3F4A56")
arrow(ax, b1x + b1w / 2, by - 0.03, d1x + d1w / 2, d1y + d1h + 0.03)

l1x, l1w = 0.15, 2.45   # 有环境 -> DRL
l2x, l2w = 2.75, 3.05   # 无环境 -> 离线 RL
ly, lh = 2.15, 0.95
rbox(ax, l1x, ly, l1w, lh, C_TEAL, C_TEAL, lw=1.4, alpha=0.25)
text(ax, l1x + l1w / 2, ly + lh / 2, "DRL（PPO/SAC/TD3）\n在线训练", fs=9.5,
     weight="bold", color="#3F5A5A")
rbox(ax, l2x, ly, l2w, lh, C_TEAL, C_TEAL, lw=1.4, alpha=0.25)
text(ax, l2x + l2w / 2, ly + lh / 2,
     "离线 RL（CQL/IQL/TD3+BC）\n或上下文 bandit", fs=9.5,
     weight="bold", color="#3F5A5A")
arrow(ax, d1x + 0.7, d1y - 0.03, l1x + l1w / 2, ly + lh + 0.03, conn="arc3,rad=0.12")
arrow(ax, d1x + 2.2, d1y - 0.03, l2x + l2w / 2, ly + lh + 0.03, conn="arc3,rad=-0.12")
text(ax, d1x + 0.35, d1y - 0.42, "有", fs=9, color=C_TEAL, weight="bold")
text(ax, d1x + 2.55, d1y - 0.42, "无，仅历史数据", fs=9, color=C_TEAL,
     weight="bold")

# DAPO 不适用旁注（虚线灰框，右侧空区，虚线连回离线 RL 叶子）
rbox(ax, 6.0, 1.45, 5.0, 0.72, "#FFFFFF", C_GRAY, lw=1.0, alpha=1.0,
     ls=(0, (4, 3)))
text(ax, 8.5, 1.81,
     "DAPO 不适用——其组相对优势之外的 token 级机制\n以自回归序列生成为前提",
     fs=8.5, color="#666666")
arrow(ax, 5.98, 2.0, 5.82, 2.55, lw=1.0, color=C_GRAY, style="-",
      ls=(0, (4, 3)))

# ---------- 分支2：LLM + DAPO/GRPO ----------
m2x, m2w, m2y, m2h = 4.95, 2.6, 3.35, 0.85
rbox(ax, m2x, m2y, m2w, m2h, C_MAIN, C_MAIN, lw=1.5, alpha=0.25)
text(ax, m2x + m2w / 2, m2y + m2h / 2, "LLM + DAPO/GRPO\n（RLVR）", fs=10,
     weight="bold", color="#7A3E39")
arrow(ax, b2x + b2w / 2, by - 0.03, m2x + m2w / 2, m2y + m2h + 0.03)

# ---------- 分支3：无需 RL ----------
m3x, m3w, m3y, m3h = 8.55, 3.3, 3.35, 0.85
rbox(ax, m3x, m3y, m3w, m3h, C_GRAY, C_GRAY, lw=1.3, alpha=0.20)
text(ax, m3x + m3w / 2, m3y + m3h / 2,
     "无需 RL：GBDT / 表格网络\n+ 阈值调优", fs=9.5, weight="bold",
     color="#4A4A4A")
arrow(ax, b3x + b3w / 2, by - 0.03, m3x + m3w / 2, m3y + m3h + 0.03)
text(ax, m3x + m3w / 2, m3y - 0.32, "预测问题不要强行 RL 化", fs=8.5,
     color=C_GRAY, style="italic")

# ---------- 底部汇聚条 ----------
rbox(ax, 1.6, 0.25, 9.9, 0.62, C_SAND, C_SAND, lw=1.3, alpha=0.28)
text(ax, 6.55, 0.56,
     "复合任务 → 分层混合：LLM 规划/解释 + DRL 控制（见图13）",
     fs=10, weight="bold", color="#6B4E1F")

# 各叶子 -> 汇聚条（浅灰细箭头，避开旁注框）
arrow(ax, l1x + l1w / 2, ly - 0.03, 3.0, 0.9, lw=1.0, color="#999999",
      conn="arc3,rad=0.10")
arrow(ax, l2x + l2w / 2, ly - 0.03, 4.6, 0.9, lw=1.0, color="#999999",
      conn="arc3,rad=-0.06")
arrow(ax, 5.6, m2y - 0.03, 5.6, 0.9, lw=1.0, color="#999999")
arrow(ax, 11.45, m3y - 0.03, 11.45, 0.9, lw=1.0, color="#999999")

fig.tight_layout()
save(fig, "fig12_route_decision_tree")
