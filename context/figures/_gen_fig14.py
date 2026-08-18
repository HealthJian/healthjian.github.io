# -*- coding: utf-8 -*-
"""fig14 AI 闭环自治成熟度阶梯（L0–L5，示意图）"""
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Polygon
from _figstyle import C_MAIN, C_TEAL, C_SAND, C_SLATE, C_GRAY, C_BG, save

TXT = "#222222"

fig, ax = plt.subplots(figsize=(12, 7))
ax.set_xlim(0, 12)
ax.set_ylim(0, 7)
ax.axis("off")
fig.patch.set_facecolor(C_BG)

levels = [
    ("L0", "纯人工", "所有决策由工程师\n手动完成", C_GRAY, 0.16),
    ("L1", "建议仅供参考", "open-loop：AI 给出建议，\n人工决定是否采纳", C_SLATE, 0.20),
    ("L2", "HITL 审批后执行", "AI 生成动作，\n人工审批后下发", C_TEAL, 0.24),
    ("L3", "HOTL 监督下自动", "护栏内自动执行，\n越界即回退人工", C_MAIN, 0.30),
    ("L4", "受限自治", "域内自闭环，\n异常自动回滚", C_SAND, 0.22),
    ("L5", "全自治", "无人工监督\n全量自动决策", C_GRAY, 0.13),
]

x0, dx = 0.50, 1.90
bw, bh = 1.82, 1.30
y0, dy = 2.45, 0.60

for i, (lv, name, desc, c, alpha) in enumerate(levels):
    xi = x0 + i * dx
    yi = y0 + i * dy
    is_l5 = lv == "L5"
    is_l3 = lv == "L3"
    box = FancyBboxPatch(
        (xi, yi), bw, bh,
        boxstyle="round,pad=0.02,rounding_size=0.06",
        fc=c if not is_l5 else "#CFCFCF",
        alpha=alpha if not is_l5 else 0.40,
        ec=c if not is_l5 else "#999999",
        lw=1.8 if is_l3 else 1.0,
        hatch="///" if is_l5 else None,
        zorder=3)
    ax.add_patch(box)
    hc = C_MAIN if is_l3 else ("#666666" if is_l5 else c)
    if lv in ("L0",):
        hc = "#666666"
    ax.text(xi + 0.16, yi + bh - 0.20, lv, fontsize=11.5, fontweight="bold",
            color=hc, ha="left", va="center", zorder=5)
    ax.text(xi + bw / 2, yi + bh - 0.52, name, fontsize=9.6,
            fontweight="bold", color=TXT, ha="center", va="center", zorder=5)
    ax.text(xi + bw / 2, yi + 0.38, desc, fontsize=8.6,
            color=TXT, ha="center", va="center", zorder=5, linespacing=1.45)

# L3 标注：已量产先例（注释框） + 推荐终态徽章
l3x, l3y = x0 + 3 * dx, y0 + 3 * dy
ax.annotate("半导体 R2R / EWMA 已量产 25 年",
            xy=(l3x + bw * 0.35, l3y + bh), xytext=(l3x - 1.9, l3y + bh + 0.95),
            fontsize=9.5, color=C_MAIN, ha="center", va="center",
            arrowprops=dict(arrowstyle="-|>", color=C_MAIN, lw=1.1),
            bbox=dict(boxstyle="round,pad=0.35", fc="#FBF4F2",
                      ec=C_MAIN, lw=1.0))
badge = FancyBboxPatch(
    (l3x + bw - 0.98, l3y + bh + 0.12), 1.06, 0.36,
    boxstyle="round,pad=0.02,rounding_size=0.08",
    fc=C_MAIN, ec="none", zorder=6)
ax.add_patch(badge)
ax.text(l3x + bw - 0.45, l3y + bh + 0.30, "推荐终态", fontsize=9,
        fontweight="bold", color="white", ha="center", va="center", zorder=7)

# L5 高风险标注（置于台阶下方空白处）
l5x, l5y = x0 + 5 * dx, y0 + 5 * dy
ax.text(l5x + bw / 2, l5y - 0.30, "高风险，不建议",
        fontsize=9.5, color="#777777", ha="center", va="top",
        fontweight="bold")

# 台阶间上升箭头
for i in range(5):
    xa = x0 + i * dx + bw - 0.28
    ya = y0 + i * dy + bh + 0.05
    xb = x0 + (i + 1) * dx + 0.22
    yb = y0 + (i + 1) * dy - 0.05
    ax.add_patch(FancyArrowPatch((xa, ya), (xb, yb), arrowstyle="-|>",
                                 mutation_scale=11, color="#999999",
                                 lw=1.0, ls=(0, (4, 3)), zorder=2))

# 下方：证据积累/信任（向右渐宽）
band_y = 1.42
trust = Polygon([(0.7, band_y - 0.15), (0.7, band_y + 0.15),
                 (9.7, band_y + 0.58), (9.7, band_y - 0.58)],
                closed=True, fc=C_TEAL, ec="none", alpha=0.28, zorder=1)
ax.add_patch(trust)
ax.add_patch(Polygon([(9.7, band_y - 0.58), (9.7, band_y + 0.58),
                      (10.6, band_y)], closed=True,
                     fc=C_TEAL, ec="none", alpha=0.42, zorder=1))
ax.text(1.0, band_y, "证据积累 / 信任", fontsize=10, fontweight="bold",
        color="#527070", ha="left", va="center", zorder=2)

# 风险（向左递减，即向右随自治等级递增）
risk_y = 0.62
risk = Polygon([(10.6, risk_y - 0.50), (10.6, risk_y + 0.50),
                (1.75, risk_y + 0.12), (1.75, risk_y - 0.12)],
               closed=True, fc=C_MAIN, ec="none", alpha=0.22, zorder=1)
ax.add_patch(risk)
ax.add_patch(Polygon([(1.75, risk_y - 0.30), (1.75, risk_y + 0.30),
                      (0.75, risk_y)], closed=True,
                     fc=C_MAIN, ec="none", alpha=0.38, zorder=1))
ax.text(10.42, risk_y, "风险（向右递增）", fontsize=9.5, fontweight="bold",
        color="#8a4a45", ha="right", va="center", zorder=2)

# 右下角小注：晋升门禁
ax.text(11.9, 0.06, "晋升门禁 = 非劣性检验 + 影子模式期",
        fontsize=9, color="#555555", ha="right", va="bottom",
        bbox=dict(boxstyle="round,pad=0.35", fc="#F7F3EE",
                  ec=C_GRAY, lw=0.8), zorder=4)

fig.tight_layout()
save(fig, "fig14_autonomy_ladder")
