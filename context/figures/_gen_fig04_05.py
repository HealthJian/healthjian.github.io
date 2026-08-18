# -*- coding: utf-8 -*-
import numpy as np
import matplotlib.pyplot as plt
from _figstyle import *

rng = np.random.default_rng(7)

# ================= fig04 =================
steps = np.arange(0, 1201)
fig, axes = plt.subplots(1, 3, figsize=(12.5, 3.9))

# (a) policy loss：围绕 0 震荡，幅度收敛
ax = axes[0]
amp = 0.35 * np.exp(-steps / 450.0) + 0.06
loss = amp * smooth_noise(rng, len(steps), 1.0, 7)
ma = moving_avg(loss, 61)
ma[:30] = ma[30]; ma[-30:] = ma[-30]
ax.plot(steps, loss, color=C_MAIN, lw=0.7, alpha=0.35, zorder=2, label="单步 loss")
ax.plot(steps, ma, color=C_MAIN, lw=2.0, zorder=3, label="滑动平均 (w=61)")
ax.axhline(0, color=C_GRAY, ls="--", lw=1.0, zorder=1)
ax.set_xlabel("训练步数", fontsize=11)
ax.set_ylabel("policy loss", fontsize=11)
ax.set_xlim(0, 1200)
ax.legend(fontsize=9, frameon=False, loc="upper right")
style_ax(ax)
panel_label(ax, "(a)")

# (b) 平均 reward：S 型 0.1 -> 0.75
ax = axes[1]
trend = 0.1 + 0.65 / (1 + np.exp(-(steps - 480) / 150.0))
reward = trend + smooth_noise(rng, len(steps), 0.018, 15)
ci = 0.035 * np.exp(-steps / 700.0) + 0.012
ax.fill_between(steps, reward - ci, reward + ci, color=C_MAIN, alpha=0.18, zorder=2)
ax.plot(steps, reward, color=C_MAIN, lw=2.0, zorder=3)
ax.set_xlabel("训练步数", fontsize=11)
ax.set_ylabel("平均 reward", fontsize=11)
ax.set_xlim(0, 1200)
ax.set_ylim(0, 0.9)
style_ax(ax)
panel_label(ax, "(b)")

# (c) 平均响应长度：350 -> 520 先升后稳
ax = axes[2]
length = 350 + 170 / (1 + np.exp(-(steps - 420) / 160.0))
length += smooth_noise(rng, len(steps), 6.0, 15)
ax.plot(steps, length, color=C_MAIN, lw=2.0, zorder=3)
ax.fill_between(steps, length - 14, length + 14, color=C_MAIN, alpha=0.15, zorder=2)
x1, x2 = 300, 800
ax.axvspan(x1, x2, color=C_SAND, alpha=0.13, zorder=1)
ax.axvline(x1, color=C_SAND, ls="--", lw=1.1, zorder=2)
ax.axvline(x2, color=C_SAND, ls="--", lw=1.1, zorder=2)
ax.text((x1 + x2) / 2, 375, "Overlong Shaping\n生效区间", fontsize=9,
        color="#7A6234", ha="center", va="center")
ax.set_xlabel("训练步数", fontsize=11)
ax.set_ylabel("平均响应长度 (tokens)", fontsize=11)
ax.set_xlim(0, 1200)
ax.set_ylim(320, 580)
style_ax(ax)
panel_label(ax, "(c)")

note_sim(fig)
fig.tight_layout()
save(fig, "fig04_dapo_training")

# ================= fig05 =================
fig, axes = plt.subplots(1, 2, figsize=(12.5, 4.0))

# (a) 训练 reward 曲线
ax = axes[0]
dapo = 0.08 + 0.70 / (1 + np.exp(-(steps - 430) / 140.0))
grpo = 0.08 + 0.62 / (1 + np.exp(-(steps - 520) / 170.0))
ppo = 0.08 + 0.58 / (1 + np.exp(-(steps - 640) / 210.0))
# GRPO 中后期熵坍缩平台 + 抖动
plat = (steps > 750) & (steps < 980)
grpo[plat] -= 0.035 * np.sin((steps[plat] - 750) / 230 * np.pi)
grpo[plat] += smooth_noise(rng, plat.sum(), 0.02, 7)
dapo_r = dapo + smooth_noise(rng, len(steps), 0.012, 15)
grpo_r = grpo + smooth_noise(rng, len(steps), 0.014, 15)
ppo_r = ppo + smooth_noise(rng, len(steps), 0.026, 13)
for curve, c, lb, band in [(ppo_r, C_GRAY, "PPO", 0.030),
                           (grpo_r, C_TEAL, "GRPO", 0.020),
                           (dapo_r, C_MAIN, "DAPO", 0.016)]:
    ax.fill_between(steps, curve - band, curve + band, color=c, alpha=0.13, zorder=2)
    ax.plot(steps, curve, color=c, lw=1.9, label=lb, zorder=3)
ax.annotate("GRPO 熵坍缩平台", xy=(860, grpo_r[860] + 0.02), xytext=(700, 0.36),
            fontsize=8.5, color="#3F5A5A",
            arrowprops=dict(arrowstyle="->", color="#666666", lw=0.9))
ax.set_xlabel("训练步数", fontsize=11)
ax.set_ylabel("训练 reward", fontsize=11)
ax.set_xlim(0, 1200)
ax.set_ylim(0, 0.9)
ax.legend(fontsize=9, frameon=False, loc="lower right")
style_ax(ax)
panel_label(ax, "(a)")

# (b) 验证集良率决策准确率
ax = axes[1]
acc_d = 0.61 + 0.25 / (1 + np.exp(-(steps - 480) / 160.0))
acc_g = 0.61 + 0.20 / (1 + np.exp(-(steps - 560) / 180.0))
acc_p = 0.61 + 0.17 / (1 + np.exp(-(steps - 660) / 210.0))
acc_d += smooth_noise(rng, len(steps), 0.006, 15)
acc_g += smooth_noise(rng, len(steps), 0.007, 15)
acc_p += smooth_noise(rng, len(steps), 0.009, 13)
ax.plot(steps, acc_p, color=C_GRAY, lw=1.9, label="PPO → 0.78", zorder=3)
ax.plot(steps, acc_g, color=C_TEAL, lw=1.9, label="GRPO → 0.81", zorder=3)
ax.plot(steps, acc_d, color=C_MAIN, lw=2.0, label="DAPO → 0.86", zorder=4)
ax.axhline(0.70, color=C_GRAY, ls="--", lw=1.1, zorder=2)
ax.text(60, 0.705, "SFT 基线 0.70", fontsize=8.5, color="#555555")
ax.set_xlabel("训练步数", fontsize=11)
ax.set_ylabel("验证集良率决策准确率", fontsize=11)
ax.set_xlim(0, 1200)
ax.set_ylim(0.58, 0.90)
ax.legend(fontsize=9, frameon=False, loc="lower right")
style_ax(ax)
panel_label(ax, "(b)")

note_sim(fig)
fig.tight_layout()
save(fig, "fig05_rl_comparison")
