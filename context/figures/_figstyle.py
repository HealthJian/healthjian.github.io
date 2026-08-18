# -*- coding: utf-8 -*-
"""共享绘图风格辅助（依据 STYLE_GUIDE.md）"""
import numpy as np
import matplotlib.pyplot as plt

C_MAIN = "#A65D57"   # 赭红
C_TEAL = "#6E8B8B"   # 灰青
C_SAND = "#C9A36A"   # 沙金
C_SLATE = "#6B7B8D"  # 石板蓝灰
C_GRAY = "#8C8C8C"   # 中性灰
C_BG = "#FFFFFF"

OUT = "/mnt/agents/output/figures/"


def style_ax(ax):
    for s in ("top", "right"):
        ax.spines[s].set_visible(False)
    for s in ("left", "bottom"):
        ax.spines[s].set_color("#444444")
        ax.spines[s].set_linewidth(0.8)
    ax.tick_params(direction="out", labelsize=9.5, colors="#333333")
    ax.yaxis.grid(True, color="#DDDDDD", lw=0.6, zorder=0)
    ax.set_axisbelow(True)
    ax.set_facecolor(C_BG)


def panel_label(ax, s, x=-0.14):
    ax.text(x, 1.06, s, transform=ax.transAxes, fontsize=12,
            fontweight="bold", va="top", ha="left", color="#222222")


def note_sim(fig):
    fig.text(0.995, 0.005, "模拟数据，仅作示意", ha="right", va="bottom",
             fontsize=8, color="#888888")


def save(fig, name):
    fig.savefig(OUT + name + ".png", dpi=300, bbox_inches="tight",
                facecolor=C_BG)
    fig.savefig(OUT + name + ".pdf", bbox_inches="tight", facecolor=C_BG)
    plt.close(fig)
    print("saved", name)


def smooth_noise(rng, n, scale=1.0, smooth=15):
    """平滑噪声：高斯噪声滑动平均，模拟真实训练日志抖动"""
    e = rng.normal(0, scale, n)
    k = max(3, smooth)
    ker = np.ones(k) / k
    return np.convolve(e, ker, mode="same")


def moving_avg(x, w=25):
    k = np.ones(w) / w
    return np.convolve(x, k, mode="same")
