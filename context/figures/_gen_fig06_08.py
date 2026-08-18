# -*- coding: utf-8 -*-
import numpy as np
import matplotlib.pyplot as plt
from _figstyle import *

rng = np.random.default_rng(11)
steps = np.arange(0, 1201)

# ================= fig06 =================
fig, axes = plt.subplots(1, 3, figsize=(13, 3.9))

# (a) reward: train vs val，后期脱钩
ax = axes[0]
tr = 0.1 + 0.72 / (1 + np.exp(-(steps - 480) / 160.0))
val = 0.1 + 0.56 / (1 + np.exp(-(steps - 520) / 150.0))
val += 0.008 * np.sin(steps / 40.0)
tr += smooth_noise(rng, len(steps), 0.010, 13)
val += smooth_noise(rng, len(steps), 0.009, 13)
ax.plot(steps, tr, color=C_MAIN, lw=2.0, label="train reward", zorder=3)
ax.plot(steps, val, color=C_TEAL, lw=2.0, label="validation reward", zorder=3)
ax.axvspan(850, 1200, color=C_SAND, alpha=0.14, zorder=1)
ax.text(1025, 0.22, "脱钩警戒区", fontsize=9, color="#7A6234", ha="center")
ax.annotate("", xy=(1130, tr[1130]), xytext=(1130, val[1130]),
            arrowprops=dict(arrowstyle="<->", color="#666666", lw=1.0))
ax.set_xlabel("训练步数", fontsize=11)
ax.set_ylabel("reward", fontsize=11)
ax.set_xlim(0, 1200)
ax.set_ylim(0, 0.95)
ax.legend(fontsize=9, frameon=False, loc="lower right")
style_ax(ax)
panel_label(ax, "(a)")

# (b) KL(policy||ref)
ax = axes[1]
kl_ok = 0.35 * (1 - np.exp(-steps / 500.0)) + smooth_noise(rng, len(steps), 0.006, 13)
kl_bad = np.where(steps < 700, 0.30 * (1 - np.exp(-steps / 480.0)),
                  0.30 * (1 - np.exp(-700 / 480.0)) * np.exp((steps - 700) / 160.0))
kl_bad = np.clip(kl_bad, 0, 3.2)
ax.plot(steps, kl_ok, color=C_MAIN, lw=2.0, label="DAPO（无 KL 惩罚，clip 约束）", zorder=3)
ax.plot(steps, kl_bad, color=C_GRAY, lw=1.8, ls="--", label="KL 爆炸反例", zorder=3)
ax.annotate("需回滚", xy=(1030, kl_bad[1030]), xytext=(760, 2.4),
            fontsize=9, color="#555555",
            arrowprops=dict(arrowstyle="->", color="#666666", lw=0.9))
ax.set_xlabel("训练步数", fontsize=11)
ax.set_ylabel("KL(policy ‖ ref)", fontsize=11)
ax.set_xlim(0, 1200)
ax.set_ylim(0, 3.4)
ax.legend(fontsize=9, frameon=False, loc="upper left")
style_ax(ax)
panel_label(ax, "(b)")

# (c) policy entropy
ax = axes[2]
ent_ok = 1.6 - 0.55 / (1 + np.exp(-(steps - 500) / 200.0))
ent_ok += smooth_noise(rng, len(steps), 0.015, 13)
ent_bad = 1.6 - 0.4 / (1 + np.exp(-(steps - 450) / 200.0))
coll = steps > 780
ent_bad[coll] = 1.2 * np.exp(-(steps[coll] - 780) / 90.0) + 0.04
ent_bad += smooth_noise(rng, len(steps), 0.012, 11)
ax.axhspan(0.75, 1.35, color=C_TEAL, alpha=0.12, zorder=1)
ax.text(80, 1.28, "健康带", fontsize=9, color="#3F5A5A")
ax.plot(steps, ent_ok, color=C_MAIN, lw=2.0, label="健康曲线（缓降趋稳）", zorder=3)
ax.plot(steps, ent_bad, color=C_GRAY, lw=1.8, ls="--", label="熵坍缩反例", zorder=3)
ax.annotate("骤降至近 0", xy=(950, ent_bad[950]), xytext=(620, 0.55),
            fontsize=9, color="#555555",
            arrowprops=dict(arrowstyle="->", color="#666666", lw=0.9))
ax.set_xlabel("训练步数", fontsize=11)
ax.set_ylabel("policy entropy", fontsize=11)
ax.set_xlim(0, 1200)
ax.set_ylim(0, 1.85)
ax.legend(fontsize=9, frameon=False, loc="upper right")
style_ax(ax)
panel_label(ax, "(c)")

note_sim(fig)
fig.tight_layout()
save(fig, "fig06_monitor_core")

# ================= fig07 =================
fig, axes = plt.subplots(1, 3, figsize=(13, 3.9))

# (a) 梯度范数
ax = axes[0]
gn = 1.2 + 0.35 * np.sin(steps / 90.0) + np.abs(smooth_noise(rng, len(steps), 0.25, 7))
gn = np.clip(gn, 0.5, 2.0)
spike_idx = rng.choice(np.arange(80, 1150), 6, replace=False)
for si in spike_idx:
    gn[si] = rng.uniform(8.0, 11.0)
ax.plot(steps, gn, color=C_MAIN, lw=1.0, alpha=0.85, zorder=3)
ax.axhline(2.0, color=C_GRAY, ls="--", lw=1.0, zorder=2)
ax.text(1190, 2.1, "健康上界 ≈2.0", fontsize=8.5, color="#555555", ha="right")
ax.scatter(spike_idx, gn[spike_idx], s=26, color=C_SAND, zorder=4,
           edgecolors="#7A6234", linewidths=0.6, label="clip 事件")
ax.annotate("clip 事件（偶发 >8）", xy=(spike_idx[1], gn[spike_idx[1]]),
            xytext=(spike_idx[1] - 260, 10.6), fontsize=9, color="#333333",
            arrowprops=dict(arrowstyle="->", color="#666666", lw=0.9))
ax.set_xlabel("训练步数", fontsize=11)
ax.set_ylabel("梯度范数", fontsize=11)
ax.set_xlim(0, 1200)
ax.set_ylim(0, 12.5)
ax.legend(fontsize=9, frameon=False, loc="upper left")
style_ax(ax)
panel_label(ax, "(a)")

# (b) clip fraction
ax = axes[1]
cf = 15.0 + 3.0 * np.sin(steps / 110.0) + smooth_noise(rng, len(steps), 1.6, 9)
cf = np.clip(cf, 9.5, 20.5)
ax.plot(steps, cf, color=C_MAIN, lw=1.5, zorder=3)
ax.fill_between(steps, cf - 1.2, cf + 1.2, color=C_MAIN, alpha=0.14, zorder=2)
ax.axhspan(10, 20, color=C_TEAL, alpha=0.10, zorder=1)
ax.text(1180, 19.0, "10–20% 稳定区间", fontsize=8.5, color="#3F5A5A", ha="right")
ax.set_xlabel("训练步数", fontsize=11)
ax.set_ylabel("clip fraction (%)", fontsize=11)
ax.set_xlim(0, 1200)
ax.set_ylim(0, 26)
style_ax(ax)
panel_label(ax, "(b)")

# (c) 动态采样有效样本率
ax = axes[2]
es = 95 - 20 / (1 + np.exp(-(steps - 600) / 220.0))
es += smooth_noise(rng, len(steps), 0.5, 13)
ax.plot(steps, es, color=C_MAIN, lw=2.0, zorder=3)
ax.fill_between(steps, es - 1.2, es + 1.2, color=C_MAIN, alpha=0.15, zorder=2)
ax.annotate("Dynamic Sampling 过滤率上升\n（全对/全错组被过滤）",
            xy=(950, es[950]), xytext=(330, 79), fontsize=9, color="#333333",
            arrowprops=dict(arrowstyle="->", color="#666666", lw=0.9))
ax.set_xlabel("训练步数", fontsize=11)
ax.set_ylabel("有效样本率 (%)", fontsize=11)
ax.set_xlim(0, 1200)
ax.set_ylim(65, 100)
style_ax(ax)
panel_label(ax, "(c)")

note_sim(fig)
fig.tight_layout()
save(fig, "fig07_monitor_system")

# ================= fig08 =================
fig, axes = plt.subplots(1, 2, figsize=(12.5, 4.0))

# (a) pass@1 与 pass@8
ax = axes[0]
p1 = 0.30 + 0.32 / (1 + np.exp(-(steps - 520) / 170.0))
p8 = 0.55 + 0.17 / (1 + np.exp(-(steps - 430) / 150.0))
p1 += smooth_noise(rng, len(steps), 0.006, 13)
p8 += smooth_noise(rng, len(steps), 0.006, 13)
ax.plot(steps, p8, color=C_TEAL, lw=2.0, label="pass@8", zorder=3)
ax.plot(steps, p1, color=C_MAIN, lw=2.0, label="pass@1", zorder=3)
ax.fill_between(steps, p1, p8, color=C_SAND, alpha=0.18, zorder=2)
ax.annotate("差距收窄 → 策略锐化", xy=(1050, (p1[1050] + p8[1050]) / 2),
            xytext=(520, 0.76), fontsize=9, color="#333333",
            arrowprops=dict(arrowstyle="->", color="#666666", lw=0.9))
ax.set_xlabel("训练步数", fontsize=11)
ax.set_ylabel("验证集通过率", fontsize=11)
ax.set_xlim(0, 1200)
ax.set_ylim(0.25, 0.95)
ax.legend(fontsize=9, frameon=False, loc="lower right")
style_ax(ax)
panel_label(ax, "(a)")

# (b) Reward hacking 三阶段
ax = axes[1]
tr2 = 0.15 + 0.72 / (1 + np.exp(-(steps - 520) / 180.0))
tr2 += smooth_noise(rng, len(steps), 0.008, 13)
b1_, b2_ = 500, 850
va = 0.15 + 0.38 / (1 + np.exp(-(steps - 350) / 110.0))
va -= 0.17 / (1 + np.exp(-(steps - 1010) / 85.0))
va += smooth_noise(rng, len(steps), 0.007, 13)
ax.plot(steps, tr2, color=C_MAIN, lw=2.0, label="train reward（持续上升）", zorder=3)
ax.plot(steps, va, color=C_TEAL, lw=2.0, label="val 准确率", zorder=3)
for xb in (b1_, b2_):
    ax.axvline(xb, color=C_GRAY, ls="--", lw=1.1, zorder=2)
ax.text(250, 0.13, "Ⅰ 正常学习", fontsize=9, color="#333333", ha="center")
ax.text((b1_ + b2_) / 2, 0.13, "Ⅱ 长度投机", fontsize=9, color="#333333", ha="center")
ax.text(1030, 0.13, "Ⅲ 崩溃", fontsize=9, color="#333333", ha="center")
es_x = 700
ax.scatter([es_x], [va[es_x]], s=55, color=C_SAND, zorder=5,
           edgecolors="#7A6234", linewidths=0.8)
ax.annotate("早停点", xy=(es_x, va[es_x]), xytext=(560, 0.68),
            fontsize=9, color="#7A6234",
            arrowprops=dict(arrowstyle="->", color="#666666", lw=0.9))
ax.set_xlabel("训练步数", fontsize=11)
ax.set_ylabel("指标值", fontsize=11)
ax.set_xlim(0, 1200)
ax.set_ylim(0, 0.95)
ax.legend(fontsize=9, frameon=False, loc="upper left")
style_ax(ax)
panel_label(ax, "(b)")

note_sim(fig)
fig.tight_layout()
save(fig, "fig08_monitor_eval")
