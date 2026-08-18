# -*- coding: utf-8 -*-
"""fig10 半导体 AI 决策技术演进时间线（1980–2026）"""
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, Rectangle
from _figstyle import C_MAIN, C_TEAL, C_GRAY, C_BG, save

TXT = "#222222"

fig, ax = plt.subplots(figsize=(13, 6))
ax.set_xlim(0, 13)
ax.set_ylim(0, 6)
ax.axis("off")
fig.patch.set_facecolor(C_BG)

# 节点：(年份, 标签, 颜色, 方向(+1上/-1下), 层级)
nodes = [
    ("1980s", "SPC 统计\n过程控制", C_GRAY, +1, 1),
    ("1990s", "FDC 故障\n检测分类", C_GRAY, -1, 1),
    ("1993",  "R2R / EWMA\n控制", C_GRAY, +1, 2),
    ("2000s", "APC 体系", C_TEAL, -1, 2),
    ("2005",  "虚拟量测\nVM", C_TEAL, +1, 1),
    ("2016",  "大数据\nAPC", C_TEAL, -1, 1),
    ("2018",  "深度学习\n缺陷检测", C_TEAL, +1, 2),
    ("2020",  "RL 调度\n/ R2R", C_MAIN, -1, 2),
    ("2022",  "表格网络\nTabNet / FT-T", C_TEAL, +1, 1),
    ("2024",  "行业 LLM\nSemiKong / ChipNeMo", C_TEAL, -1, 1),
    ("2025",  "DAPO / RLVR", C_MAIN, +1, 2),
    ("2026",  "自主 Fab 路线图\n(agentic fab，趋势)", C_MAIN, -1, 2),
]
n = len(nodes)
x0, x1 = 0.85, 12.15
xs = [x0 + i * (x1 - x0) / (n - 1) for i in range(n)]
Y0 = 3.0

# 右侧浅色背景带：决策层智能化窗口期（覆盖 2025–2026 区域）
band_x0 = (xs[9] + xs[10]) / 2
ax.add_patch(Rectangle((band_x0, 0.35), 12.9 - band_x0, 5.3,
                       fc=C_MAIN, ec="none", alpha=0.08, zorder=0))
ax.text(12.8, 5.48, "决策层智能化窗口期", ha="right",
        va="bottom", fontsize=9, color=C_MAIN, alpha=0.9)

# 时间轴
ax.add_patch(FancyArrowPatch((0.3, Y0), (12.85, Y0), arrowstyle="-|>",
                             mutation_scale=16, color="#666666", lw=1.4,
                             zorder=2))
ax.text(0.3, Y0 - 0.18, "1980", fontsize=9, color="#555555",
        ha="center", va="top")
ax.text(12.85, Y0 - 0.18, "2026", fontsize=9, color="#555555",
        ha="center", va="top")

stem_len = {1: 0.95, 2: 1.62}
for (yr, lab, c, d, lvl), x in zip(nodes, xs):
    is_trend = yr == "2026"
    sl = stem_len[lvl]
    # 引线
    ax.plot([x, x], [Y0, Y0 + d * sl], color=c, lw=1.1,
            ls=(0, (3, 2)) if is_trend else "-", alpha=0.8, zorder=2)
    # 节点圆点（2026 为空心虚线样式）
    if is_trend:
        ax.plot([x], [Y0], "o", ms=9, mfc="white", mec=c, mew=1.4,
                ls="none", zorder=4)
    else:
        ax.plot([x], [Y0], "o", ms=8, color=c, mec="white", mew=1.0,
                zorder=4)
    # 年份 + 标签
    yb = Y0 + d * (sl + 0.12)
    va = "bottom" if d > 0 else "top"
    ax.text(x, yb, yr, fontsize=10, weight="bold", color=c,
            ha="center", va=va, zorder=5)
    dy = 0.30 if d > 0 else -0.30
    ax.text(x, yb + dy, lab, fontsize=8.8, color=TXT, ha="center",
            va=va, zorder=5,
            style="italic" if is_trend else "normal")

# RL 决策强调图例说明（底部）
ax.text(0.35, 0.12, "●", fontsize=11, color=C_MAIN, ha="left", va="center")
ax.text(0.62, 0.12, "RL 决策相关节点", fontsize=9, color=TXT,
        ha="left", va="center")
ax.text(3.4, 0.12, "●", fontsize=11, color=C_TEAL, ha="left", va="center")
ax.text(3.67, 0.12, "控制/检测/建模技术", fontsize=9, color=TXT,
        ha="left", va="center")
ax.text(6.6, 0.12, "●", fontsize=11, color=C_GRAY, ha="left", va="center")
ax.text(6.87, 0.12, "传统统计控制", fontsize=9, color=TXT,
        ha="left", va="center")

fig.tight_layout()
save(fig, "fig10_roadmap")
