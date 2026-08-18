# -*- coding: utf-8 -*-
"""fig03 DAPO 训练机制流程图（五阶段 + 三注记）"""
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Polygon
from _figstyle import C_MAIN, C_TEAL, C_SAND, C_GRAY, C_BG, OUT, save

ARROW_C = "#666666"
TXT = "#222222"


def rbox(ax, x, y, w, h, fc, ec, lw=1.2, alpha=0.22, zorder=2):
    p = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.03",
                       fc=fc, ec=ec, lw=lw, alpha=alpha, zorder=zorder)
    ax.add_patch(p)
    return p


def text(ax, x, y, s, fs=9.5, weight="normal", color=TXT, **kw):
    ax.text(x, y, s, ha="center", va="center", fontsize=fs,
            color=color, weight=weight, zorder=5, **kw)


def arrow(ax, x1, y1, x2, y2, lw=1.6, color=ARROW_C, style="-|>", ls="-",
          shrinkA=1, shrinkB=1, zorder=3, conn=None):
    a = FancyArrowPatch((x1, y1), (x2, y2), arrowstyle=style, mutation_scale=13,
                        color=color, lw=lw, linestyle=ls, zorder=zorder,
                        shrinkA=shrinkA, shrinkB=shrinkB,
                        connectionstyle=conn or "arc3,rad=0")
    ax.add_patch(a)


fig, ax = plt.subplots(figsize=(13, 7.5))
ax.set_xlim(0, 13)
ax.set_ylim(0, 7.5)
ax.axis("off")
fig.patch.set_facecolor(C_BG)

# ---------- 五阶段 ----------
SW, SH, SY = 2.15, 2.7, 4.0
lefts = [0.35, 2.85, 5.35, 7.85, 10.35]
titles = ["① 提示批次", "② 组采样 Rollout", "③ 奖励评估", "④ 动态采样过滤",
          "⑤ Token 级策略更新"]

# 阶段 1：提示批次
x = lefts[0]
rbox(ax, x, SY, SW, SH, C_TEAL, C_TEAL, alpha=0.16)
text(ax, x + SW / 2, SY + SH - 0.28, titles[0], fs=10.5, weight="bold")
chip_y = [5.85, 5.28, 4.71]
for i, (cy, lab) in enumerate(zip(chip_y, ["q₁", "q₂", "qₙ"])):
    rbox(ax, x + 0.42, cy - 0.19, 1.3, 0.38, "#FFFFFF", C_TEAL, lw=1.0, alpha=1.0)
    text(ax, x + 1.07, cy, lab, fs=9, color=C_TEAL)
    if i == 1:
        text(ax, x + 1.07, cy - 0.285, "⋮", fs=9, color=C_TEAL)
text(ax, x + SW / 2, 4.28, "良率决策 prompt\n（90 维特征序列化）", fs=8.5)

# 阶段 2：组采样
x = lefts[1]
rbox(ax, x, SY, SW, SH, C_TEAL, C_TEAL, alpha=0.16)
text(ax, x + SW / 2, SY + SH - 0.28, titles[1], fs=10.5, weight="bold")
ox, oy = x + 0.32, 5.35
ax.plot([ox], [oy], "o", ms=5, color=C_TEAL, zorder=4)
for k in range(8):
    ty = 4.62 + k * 0.205
    ax.plot([ox, x + 1.78], [oy, ty], color=C_TEAL, lw=1.0, alpha=0.75, zorder=3)
    ax.plot([x + 1.78], [ty], "o", ms=3.2, color=C_TEAL, zorder=4)
text(ax, x + SW / 2, 4.28, "每 prompt 采样 G=8 条响应", fs=8.5)
text(ax, x + SW / 2, 6.06, "vLLM 推理", fs=8.5, color="#4A6A6A")

# 阶段 3：奖励评估（三个奖励块汇入）
x = lefts[2]
rbox(ax, x, SY, SW, SH, C_TEAL, C_TEAL, alpha=0.16)
text(ax, x + SW / 2, SY + SH - 0.28, titles[2], fs=10.5, weight="bold")
rewards = [("决策正确性", 5.82), ("校准", 5.30), ("格式门控", 4.78)]
for lab, cy in rewards:
    rbox(ax, x + 0.13, cy - 0.20, 0.98, 0.40, C_SAND, C_SAND, lw=1.0, alpha=0.55)
    text(ax, x + 0.62, cy, lab, fs=8, color="#6B5326")
rbox(ax, x + 1.28, 5.06, 0.76, 0.50, C_SAND, "#8A6D3B", lw=1.1, alpha=0.85)
text(ax, x + 1.66, 5.31, "可验证\n奖励 r", fs=7.8, color="#4A3A16")
for _, cy in rewards:
    arrow(ax, x + 1.11, cy, x + 1.28, 5.31, lw=0.9, style="-|>")
text(ax, x + SW / 2, 4.28, "规则校验，无需人工打分", fs=8.5)

# 阶段 4：动态采样过滤（漏斗）
x = lefts[3]
rbox(ax, x, SY, SW, SH, C_TEAL, C_TEAL, alpha=0.16)
text(ax, x + SW / 2, SY + SH - 0.28, titles[3], fs=10.5, weight="bold")
funnel = Polygon([(x + 0.35, 6.0), (x + 1.8, 6.0), (x + 1.32, 4.95),
                  (x + 0.83, 4.95)], closed=True, fc=C_TEAL, ec=C_TEAL,
                 alpha=0.45, lw=1.2, zorder=3)
ax.add_patch(funnel)
arrow(ax, x + 1.075, 6.25, x + 1.075, 6.05, lw=1.2)
arrow(ax, x + 1.075, 4.95, x + 1.075, 4.72, lw=1.2)
text(ax, x + SW / 2, 4.28, "剔除全对 / 全零优势组\n（零优势组丢弃）", fs=8.5)

# 阶段 5：策略更新
x = lefts[4]
rbox(ax, x, SY, SW, SH, C_MAIN, C_MAIN, alpha=0.20)
text(ax, x + SW / 2, SY + SH - 0.28, titles[4], fs=10, weight="bold")
text(ax, x + SW / 2, 5.35, "Token 级\n策略梯度更新\n\n∇θ J(θ)", fs=9.5)

# 阶段间箭头
for i in range(4):
    arrow(ax, lefts[i] + SW + 0.03, 5.35, lefts[i + 1] - 0.03, 5.35, lw=1.8)

# ---------- 注记框（白底灰边） ----------
EC_NOTE = "#999999"
# ③ Overlong → 阶段 3
rbox(ax, 3.55, 1.35, 3.5, 1.05, "#FFFFFF", EC_NOTE, lw=1.1, alpha=1.0)
text(ax, 5.30, 2.12, "③ Overlong Reward Shaping", fs=9.2, weight="bold")
text(ax, 5.30, 1.72, "超长软惩罚：超出长度预算线性扣分", fs=8.5)
arrow(ax, 5.90, 2.40, 6.30, 3.97, lw=1.0, color=EC_NOTE)

# ① Clip-Higher → 阶段 5
rbox(ax, 7.15, 2.05, 3.7, 1.05, "#FFFFFF", EC_NOTE, lw=1.1, alpha=1.0)
text(ax, 9.0, 2.82, "① Clip-Higher", fs=9.2, weight="bold")
text(ax, 9.0, 2.42, "ε_low=0.2 / ε_high=0.28 非对称裁剪", fs=8.5)
arrow(ax, 10.35, 3.10, 11.05, 3.97, lw=1.0, color=EC_NOTE)

# ② Token-level Loss → 阶段 5
rbox(ax, 8.85, 0.62, 3.65, 1.05, "#FFFFFF", EC_NOTE, lw=1.1, alpha=1.0)
text(ax, 10.675, 1.39, "② Token-level Loss", fs=9.2, weight="bold")
text(ax, 10.675, 0.99, "按组内总 token 数归一化损失", fs=8.5)
arrow(ax, 11.85, 1.67, 11.72, 3.97, lw=1.0, color=EC_NOTE)

fig.tight_layout()
save(fig, "fig03_dapo_mechanism")
