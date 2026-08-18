# -*- coding: utf-8 -*-
"""fig13 LLM 大脑 × RL 手脚：四层闭环架构图（右侧反馈环）"""
import matplotlib.pyplot as plt
from matplotlib.patches import (FancyBboxPatch, FancyArrowPatch, Circle,
                                Polygon)
from _figstyle import (C_MAIN, C_TEAL, C_SAND, C_SLATE, C_GRAY, C_BG,
                       save)

ARROW_C = "#666666"
TXT = "#222222"

X0, X1 = 1.2, 10.1          # 主列范围
XC = (X0 + X1) / 2
LOOPX = 12.15               # 右侧反馈回廊


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


def person_icon(ax, cx, cy, s=1.0, color="#7A3E39"):
    """简化小人图标：圆头 + 梯形身体"""
    ax.add_patch(Circle((cx, cy + 0.16 * s), 0.085 * s, fc=color, ec=color,
                        zorder=6))
    body = Polygon([(cx - 0.13 * s, cy - 0.12 * s),
                    (cx + 0.13 * s, cy - 0.12 * s),
                    (cx + 0.085 * s, cy + 0.05 * s),
                    (cx - 0.085 * s, cy + 0.05 * s)],
                   closed=True, fc=color, ec=color, zorder=6)
    ax.add_patch(body)


fig, ax = plt.subplots(figsize=(13, 8.5))
ax.set_xlim(0, 13)
ax.set_ylim(0, 8.5)
ax.axis("off")
fig.patch.set_facecolor(C_BG)

# ================= L1 交互层 =================
l1y, l1h = 7.15, 1.15
rbox(ax, X0, l1y, X1 - X0, l1h, C_MAIN, C_MAIN, lw=1.6, alpha=0.14)
text(ax, 0.15, l1y + l1h / 2, "L1\n交互层", fs=9.5, color="#555555", ha="left")
rbox(ax, 1.55, l1y + 0.22, 2.5, 0.7, "#FFFFFF", C_MAIN, lw=1.1, alpha=1.0)
text(ax, 2.8, l1y + 0.57, "工程师\n自然语言提问", fs=9.5, color="#7A3E39")
rbox(ax, 5.35, l1y + 0.22, 2.7, 0.7, "#FFFFFF", C_MAIN, lw=1.1, alpha=1.0)
text(ax, 6.7, l1y + 0.57, "LLM 意图理解 / 任务分解", fs=9.5, color="#7A3E39")
arrow(ax, 4.08, l1y + 0.73, 5.32, l1y + 0.73, lw=1.3, color="#7A3E39")
arrow(ax, 5.32, l1y + 0.42, 4.08, l1y + 0.42, lw=1.3, color="#7A3E39")
text(ax, 4.7, l1y + 0.9, "提问", fs=8, color="#7A3E39")
text(ax, 4.7, l1y + 0.24, "澄清 / 方案", fs=8, color="#7A3E39")
# HITL 审批点：小人图标 + 审批徽标
person_icon(ax, 9.0, l1y + 0.62, s=1.1)
rbox(ax, 9.3, l1y + 0.5, 0.62, 0.34, C_MAIN, C_MAIN, lw=1.0, alpha=0.9)
text(ax, 9.61, l1y + 0.67, "审批", fs=8.5, weight="bold", color="#FFFFFF")
text(ax, 9.3, l1y + 0.26, "HITL 审批点", fs=8.5, color="#7A3E39")

# ================= L2 分析层 =================
l2y, l2h = 5.35, 1.35
rbox(ax, X0, l2y, X1 - X0, l2h, C_MAIN, C_MAIN, lw=1.6, alpha=0.14)
text(ax, 0.15, l2y + l2h / 2, "L2\n分析层", fs=9.5, color="#555555", ha="left")
rbox(ax, 1.55, l2y + 0.32, 3.3, 0.72, "#FFFFFF", C_MAIN, lw=1.1, alpha=1.0)
text(ax, 3.2, l2y + 0.68, "LLM 查询数据库 / 阅读文档\n/ 调用预测工具", fs=9,
     color="#7A3E39")
arrow(ax, 4.88, l2y + 0.68, 5.52, l2y + 0.68, lw=1.3, color="#7A3E39")
rbox(ax, 5.55, l2y + 0.32, 2.3, 0.72, "#FFFFFF", C_MAIN, lw=1.1, alpha=1.0)
text(ax, 6.7, l2y + 0.68, "低良率根因假设\n+ 证据链", fs=9, color="#7A3E39")
arrow(ax, 7.88, l2y + 0.68, 8.42, l2y + 0.68, lw=1.3, color="#7A3E39")
rbox(ax, 8.45, l2y + 0.32, 1.5, 0.72, "#FFFFFF", C_GRAY, lw=1.1, alpha=1.0,
     ls=(0, (4, 3)))
text(ax, 9.2, l2y + 0.68, "确定性校验门\n（防幻觉入状态）", fs=8.3,
     color="#4A4A4A")

# ================= L3 决策层 =================
l3y, l3h = 3.25, 1.6
rbox(ax, X0, l3y, X1 - X0, l3h, C_TEAL, C_TEAL, lw=1.6, alpha=0.16)
text(ax, 0.15, l3y + l3h / 2, "L3\n决策层", fs=9.5, color="#555555", ha="left")
rbox(ax, 1.55, l3y + 0.42, 3.3, 0.78, "#FFFFFF", C_TEAL, lw=1.1, alpha=1.0)
text(ax, 3.2, l3y + 0.81, "RL 智能体\n（状态 = 分析结果 + 产线状态）", fs=9,
     color="#3F5A5A")
rbox(ax, 5.55, l3y + 0.42, 3.5, 0.78, "#FFFFFF", C_TEAL, lw=1.1, alpha=1.0)
text(ax, 7.3, l3y + 0.81, "数字孪生仿真环境\n（离线预训练 → 影子 → 金丝雀）",
     fs=9, color="#3F5A5A")
arrow(ax, 4.88, l3y + 1.0, 5.52, l3y + 1.0, lw=1.3, color="#3F5A5A")
arrow(ax, 5.52, l3y + 0.62, 4.88, l3y + 0.62, lw=1.3, color="#3F5A5A")
text(ax, 5.2, l3y + 1.16, "动作", fs=8, color="#3F5A5A")
text(ax, 5.2, l3y + 0.44, "反馈", fs=8, color="#3F5A5A")
text(ax, 9.35, l3y + 0.22, "输出：最优动作序列", fs=8.5, color="#3F5A5A",
     weight="bold")

# ================= L4 执行层 =================
l4y, l4h = 1.05, 1.6
rbox(ax, X0, l4y, X1 - X0, l4h, C_SAND, C_SAND, lw=1.6, alpha=0.20)
text(ax, 0.15, l4y + l4h / 2, "L4\n执行层", fs=9.5, color="#555555", ha="left")
rbox(ax, 1.55, l4y + 0.42, 2.9, 0.78, "#FFFFFF", C_SAND, lw=1.1, alpha=1.0)
text(ax, 3.0, l4y + 0.81, "动作护栏\n（限幅 / 白名单 / SPC 互锁）", fs=9,
     color="#6B4E1F")
rbox(ax, 5.3, l4y + 0.42, 1.9, 0.78, "#FFFFFF", C_SAND, lw=1.1, alpha=1.0)
text(ax, 6.25, l4y + 0.81, "实际产线", fs=9.5, weight="bold",
     color="#6B4E1F")
rbox(ax, 8.1, l4y + 0.42, 1.7, 0.78, "#FFFFFF", C_SAND, lw=1.1, alpha=1.0)
text(ax, 8.95, l4y + 0.81, "新数据", fs=9.5, weight="bold", color="#6B4E1F")
arrow(ax, 4.48, l4y + 0.81, 5.27, l4y + 0.81, lw=1.3, color="#6B4E1F")
text(ax, 4.88, l4y + 1.02, "执行动作", fs=8, color="#6B4E1F")
arrow(ax, 7.23, l4y + 0.81, 8.07, l4y + 0.81, lw=1.3, color="#6B4E1F")
text(ax, 7.65, l4y + 1.02, "执行结果", fs=8, color="#6B4E1F")

# ================= 层间箭头（标数据内容） =================
arrow(ax, 5.0, l1y - 0.03, 5.0, l2y + l2h + 0.03, lw=1.6)
text(ax, 5.15, (l1y + l2y + l2h) / 2, "意图 / 子任务", fs=8.5,
     color="#555555", ha="left")
arrow(ax, 5.0, l2y - 0.03, 5.0, l3y + l3h + 0.03, lw=1.6)
text(ax, 5.15, (l2y + l3y + l3h) / 2, "证据链状态", fs=8.5, color="#555555",
     ha="left")
arrow(ax, 5.0, l3y - 0.03, 5.0, l4y + l4h + 0.03, lw=1.6)
text(ax, 5.15, (l3y + l4y + l4h) / 2, "动作序列", fs=8.5, color="#555555",
     ha="left")

# ================= 右侧持续学习反馈环 =================
# 新数据 -> 回廊
arrow(ax, X1 + 0.02, l4y + 0.81, LOOPX, l4y + 0.81, lw=1.6, color=C_GRAY,
      style="-")
arrow(ax, LOOPX, l4y + 0.81, LOOPX, l2y + 0.68, lw=1.6, color=C_GRAY,
      style="-")
# 回廊 -> L3
arrow(ax, LOOPX, l3y + 0.81, X1 + 0.02, l3y + 0.81, lw=1.6, color=C_GRAY)
# 回廊 -> L2
arrow(ax, LOOPX, l2y + 0.68, X1 + 0.02, l2y + 0.68, lw=1.6, color=C_GRAY)
text(ax, 10.6, l4y + 1.05, "新数据回流", fs=8.5, color="#555555", ha="left")
text(ax, LOOPX + 0.33, 5.05,
     "持续学习闭环\n+ 反馈污染防御：\n永久基线对照 lot", fs=9, color="#555555",
     ha="center", va="center")

fig.tight_layout()
save(fig, "fig13_brain_hands_architecture")
