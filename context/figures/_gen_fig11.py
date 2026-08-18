# -*- coding: utf-8 -*-
"""fig11 标注策略对比（成本-规模-质量 + 标注量-性能学习曲线，模拟数据）"""
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter
from _figstyle import (C_MAIN, C_TEAL, C_SAND, C_SLATE, C_GRAY,
                       style_ax, panel_label, note_sim, save, smooth_noise)

rng = np.random.default_rng(7)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 4.2))

# ============ (a) 成本 vs 准确率 ============
strategies = ["全人工\n专家标注", "Snorkel 弱监督\n标注函数", "主动学习\n(人工只标难例)", "规则自动标签\n(bin 测试天然标签)"]
x = np.arange(len(strategies))
# 每万条标注成本（千元，对数轴）：全人工 60–300 元/条 -> 取中位 ~150 元/条 => 1500 千元/万条
cost = [1500, 30, 500, 0.5]            # 千元 / 万条
acc = [97.5, 88.5, 95.0, 99.0]         # 标签准确率 %
acc_err = [1.0, 3.0, 1.5, 0.4]

bars = ax1.bar(x, cost, width=0.52, color=C_MAIN, alpha=0.85,
               edgecolor="#7a423d", linewidth=0.8, zorder=3,
               label="每万条标注成本（左轴，对数）")
ax1.set_yscale("log")
ax1.set_ylim(0.2, 8000)
ax1.set_ylabel("每万条标注成本（千元，对数）", fontsize=11)
ax1.set_xticks(x)
ax1.set_xticklabels(strategies, fontsize=9)
for xi, c in zip(x, cost):
    txt = f"{c:,.0f}" if c >= 10 else f"{c:g}"
    ax1.text(xi, c * 1.25, txt, ha="center", va="bottom",
             fontsize=9, color="#7a423d")
style_ax(ax1)

ax1b = ax1.twinx()
ax1b.errorbar(x + 0.24, acc, yerr=acc_err, fmt="o", ms=7, color=C_TEAL,
              mec="white", mew=1.0, ecolor=C_TEAL, elinewidth=1.4,
              capsize=3.5, zorder=5, label="标签准确率（右轴）")
ax1b.set_ylim(70, 102)
ax1b.set_ylabel("标签准确率 %", fontsize=11, color=C_TEAL)
ax1b.tick_params(axis="y", labelsize=9.5, colors=C_TEAL, direction="out")
for s in ("top",):
    ax1b.spines[s].set_visible(False)
ax1b.spines["right"].set_color(C_TEAL)
ax1b.spines["right"].set_linewidth(0.8)

# 合并图例
h1, l1 = ax1.get_legend_handles_labels()
h2, l2 = ax1b.get_legend_handles_labels()
ax1.legend(h1 + h2, l1 + l2, loc="upper left", bbox_to_anchor=(0.24, 1.0),
           fontsize=9, frameon=False, ncol=1)

# 规则标签局限注释框
ax1.annotate("仅覆盖 好/坏 判定，\n不覆盖根因类别",
             xy=(3, 0.5), xytext=(2.42, 2.2),
             fontsize=8.5, color="#555555", ha="center", va="bottom",
             arrowprops=dict(arrowstyle="-", color="#888888", lw=0.8),
             bbox=dict(boxstyle="round,pad=0.32", fc="#F7F3EE",
                       ec=C_SAND, lw=0.9))
panel_label(ax1, "(a)", x=-0.16)

# ============ (b) 学习曲线 ============
npts = 220
xs = np.geomspace(50, 20000, npts)
lx = np.log10(xs)

def logistic(lo, hi, mid, k):
    return lo + (hi - lo) / (1 + np.exp(-k * (lx - mid)))

# 纯人工标注：高斜率、上限高
y_manual = logistic(0.42, 0.955, 3.35, 2.6) + smooth_noise(rng, npts, 0.004, 21)
# 弱监督 + 少量人工校准：快速上升后平台
y_ws = logistic(0.55, 0.905, 2.55, 3.4) + smooth_noise(rng, npts, 0.004, 21)
# 规则标签：好/坏任务高起点平台；根因任务恒为零
y_rule_gb = 0.86 + smooth_noise(rng, npts, 0.003, 21) - 0.03 * (lx - lx.min()) / (lx.max() - lx.min())
y_rule_root = np.zeros(npts)

ax2.plot(xs, y_manual, color=C_MAIN, lw=2.0, label="纯人工标注（上限高，成本高）")
ax2.plot(xs, y_ws, color=C_TEAL, lw=2.0, label="弱监督 + 少量人工校准")
ax2.plot(xs, y_rule_gb, color=C_SAND, lw=2.0, ls="--",
         label="规则标签：好/坏判定任务")
ax2.plot(xs, y_rule_root + 0.005, color=C_GRAY, lw=1.6, ls=":",
         label="规则标签：根因定位任务（无法覆盖）")

# 拐点区
ax2.axvspan(1400, 2800, color=C_MAIN, alpha=0.10, zorder=0)
ax2.axvline(2000, color=C_MAIN, lw=1.0, ls=(0, (4, 3)), alpha=0.7)
ax2.annotate("拐点区：~2000 条人工金标准\n+ 标注函数覆盖其余",
             xy=(2000, 0.88), xytext=(3200, 0.66),
             fontsize=9, color=C_MAIN, ha="left", va="center",
             arrowprops=dict(arrowstyle="-|>", color=C_MAIN, lw=1.0))

ax2.set_xscale("log")
ax2.set_xlim(50, 20000)
ax2.set_xticks([100, 500, 2000, 10000, 20000])
ax2.xaxis.set_major_formatter(FuncFormatter(lambda v, p: f"{int(v):,}"))
ax2.set_ylim(-0.03, 1.02)
ax2.set_xlabel("人工标注条数（对数刻度）", fontsize=11)
ax2.set_ylabel("下游决策 F1", fontsize=11)
ax2.legend(loc="lower right", fontsize=9, frameon=False)
style_ax(ax2)
panel_label(ax2, "(b)", x=-0.13)

note_sim(fig)
fig.tight_layout()
save(fig, "fig11_annotation_strategy")
