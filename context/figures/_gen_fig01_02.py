# -*- coding: utf-8 -*-
import numpy as np
import matplotlib.pyplot as plt
from _figstyle import *

# ================= fig01 =================
rng = np.random.default_rng(42)

modules = {
    "CMP": ["抛光压力", "抛光转速", "研磨液流量", "抛光时间", "垫温度", "下压力波动"],
    "ETCH": ["RF功率", "腔体压力", "气体流量比", "刻蚀时间", "电极温度", "终点信号强度", "偏置电压"],
    "CVD": ["腔体温度", "前驱体流量", "沉积压力", "射频偏置", "载气流量", "沉积速率"],
    "LITHO": ["曝光剂量", "对焦偏移", "显影时间", "匀胶转速", "烘烤温度", "掩模对准误差"],
    "MET": ["膜厚均值", "膜厚均匀性", "电阻率", "应力值", "颗粒计数", "反射率"],
    "DIFF": ["退火温度", "退火时间", "推结深度", "方阻均值"],
    "ION": ["注入剂量", "注入能量", "束流稳定性", "倾角偏差"],
    "WET": ["清洗液浓度", "超声功率", "清洗时间", "干燥转速"],
    "PVD": ["溅射功率", "靶材温度", "氩气流量", "基底偏压"],
    "CMP2": ["去除速率", "终点过抛量", "表面粗糙度"],
    "ETCH2": ["侧壁角度", "选择比", "残留物计数"],
    "MET2": ["线宽CD均值", "线宽CD均匀性", "缺陷密度", "套刻误差X", "套刻误差Y", "量测重复性"],
    "CVD2": ["膜应力梯度", "台阶覆盖率", "折射率"],
    "DIFF2": ["氧化层厚度", "炉管温均性", "掺杂浓度"],
    "WET2": ["表面张力", "颗粒残留", "干燥水印计数"],
    "PVD2": ["膜致密性", "附着力", "晶粒尺寸"],
    "RTP": ["升温速率", "峰值温度", "保温时间", "冷却速率"],
    "IMP": ["沟道效应指数", "射程偏差", "横向扩散"],
    "CLN": ["兆声能量", "SC1配比", "SC2配比", "甩干时间"],
    "DEPO": ["旋涂厚度", "边缘 bead 宽度", "溶剂挥发率"],
    "TEST": ["接触电阻", "阈值电压漂移", "漏电流均值", "击穿电压", "栅氧完整性"],
}
feat_names = []
for m, subs in modules.items():
    prefix = m.rstrip("2")
    for s in subs:
        feat_names.append(f"{prefix}_{s}")
assert len(feat_names) >= 90, len(feat_names)
feat_names = feat_names[:90]

# 聚合重要性：指数衰减 + 噪声，归一化到 0-1
base = np.exp(-np.arange(90) / 16.2)
base += rng.normal(0, 0.015, 90)
base = np.clip(base, 1e-4, None)
order = np.argsort(base)[::-1]
sorted_names = [feat_names[i] for i in order]
sorted_base = base[order]
agg = sorted_base / sorted_base.max()

# 各算法得分：围绕聚合值扰动
algos = ["XGBoost", "互信息", "SHAP", "ANOVA"]
algo_colors = {"XGBoost": C_TEAL, "互信息": C_SAND, "SHAP": C_SLATE, "ANOVA": C_GRAY}
scores = {a: np.clip(agg + rng.normal(0, 0.035, 90), 0, 1) for a in algos}

fig, axes = plt.subplots(1, 2, figsize=(12, 6.4), gridspec_kw={"width_ratios": [1.15, 1]})

ax = axes[0]
topn = 25
ypos = np.arange(topn)[::-1]
ax.barh(ypos, agg[:topn], height=0.62, color=C_MAIN, alpha=0.88, zorder=2,
        label="聚合重要性")
for a in algos:
    ax.scatter(scores[a][:topn], ypos, s=14, color=algo_colors[a], alpha=0.75,
               zorder=3, label=a, edgecolors="white", linewidths=0.4)
ax.set_yticks(ypos)
ax.set_yticklabels(sorted_names[:topn], fontsize=8.5)
ax.set_xlabel("归一化重要性", fontsize=11)
ax.set_xlim(0, 1.08)
ax.legend(fontsize=8, loc="lower right", frameon=False, ncol=2)
style_ax(ax)
panel_label(ax, "(a)")

ax = axes[1]
cum = np.cumsum(sorted_base) / sorted_base.sum()
xs = np.arange(1, 91)
ax.plot(xs, cum, color=C_MAIN, lw=2.0, zorder=3)
band = 0.012 * np.sin(xs / 9.0) ** 2
ax.fill_between(xs, cum - band, cum + band, color=C_MAIN, alpha=0.18, zorder=2)
k = 32
ax.axvline(k, color=C_GRAY, ls="--", lw=1.1, zorder=2)
ax.axhline(cum[k - 1], color=C_GRAY, ls="--", lw=1.1, zorder=2)
ax.scatter([k], [cum[k - 1]], s=42, color=C_MAIN, zorder=4)
ax.annotate(f"前 {k} 个特征 ≈ {cum[k-1]*100:.0f}%",
            xy=(k, cum[k - 1]), xytext=(40, 0.52),
            fontsize=9, color="#333333",
            arrowprops=dict(arrowstyle="->", color="#666666", lw=0.9))
ax.set_xlabel("特征数（按重要性排序）", fontsize=11)
ax.set_ylabel("累计重要性占比", fontsize=11)
ax.set_xlim(0, 90)
ax.set_ylim(0, 1.02)
style_ax(ax)
panel_label(ax, "(b)")

note_sim(fig)
fig.tight_layout()
save(fig, "fig01_feature_importance")

# ================= fig02 =================
fig, axes = plt.subplots(2, 2, figsize=(12.5, 7.6))

# (a) 缺失率直方图
ax = axes[0, 0]
n_feat = 240
miss_before = np.concatenate([
    rng.uniform(5, 15, int(n_feat * 0.45)),
    rng.uniform(15, 28, int(n_feat * 0.35)),
    rng.uniform(28, 40, n_feat - int(n_feat * 0.45) - int(n_feat * 0.35)),
])
miss_after = np.clip(rng.gamma(1.1, 0.55, n_feat), 0.02, 1.9)
bins = np.linspace(0, 40, 41)
ax.hist(miss_before, bins=bins, color=C_GRAY, alpha=0.65, label="治理前", zorder=2)
ax.hist(miss_after, bins=bins, color=C_MAIN, alpha=0.75, label="治理后", zorder=3)
ax.set_xlabel("特征缺失率 (%)", fontsize=11)
ax.set_ylabel("特征数", fontsize=11)
ax.legend(fontsize=9, frameon=False)
style_ax(ax)
panel_label(ax, "(a)")

# (b) PSI 时间序列
ax = axes[0, 1]
days = np.arange(300)
psi_after = 0.04 + 0.02 * np.sin(days / 25) + np.abs(smooth_noise(rng, 300, 0.012, 9))
psi_after = np.clip(psi_after, 0.005, 0.095)
psi_before = 0.10 + 0.03 * np.sin(days / 40) + np.abs(smooth_noise(rng, 300, 0.03, 9))
spike_idx = rng.choice(np.arange(20, 290), 7, replace=False)
for si in spike_idx:
    w = rng.integers(2, 5)
    psi_before[si:si + w] += rng.uniform(0.16, 0.30)
psi_before = np.clip(psi_before, 0, 0.52)
ax.plot(days, psi_before, color=C_GRAY, lw=1.4, alpha=0.9, label="治理前", zorder=3)
ax.plot(days, psi_after, color=C_MAIN, lw=1.6, label="治理后（重对齐+分组标准化）", zorder=4)
ax.axhline(0.25, color=C_GRAY, ls="--", lw=1.0, zorder=2)
ax.text(292, 0.258, "PSI=0.25 告警线", fontsize=8.5, color="#555555",
        ha="right", va="bottom")
ax.set_xlabel("时间 (天)", fontsize=11)
ax.set_ylabel("工艺漂移 PSI", fontsize=11)
ax.set_xlim(0, 300)
ax.set_ylim(0, 0.55)
ax.legend(fontsize=9, frameon=False, loc="upper right")
style_ax(ax)
panel_label(ax, "(b)")

# (c) 类别不平衡 → 有效损失权重
ax = axes[1, 0]
cats = ["正常类", "缺陷类"]
before_v = [97.0, 3.0]
after_v = [55.0, 45.0]
x = np.arange(2)
w = 0.34
b1 = ax.bar(x - w / 2, before_v, w, color=C_GRAY, alpha=0.85,
            label="治理前（样本占比）", zorder=2)
b2 = ax.bar(x + w / 2, after_v, w, color=C_MAIN, alpha=0.9,
            label="治理后（有效损失权重）", zorder=2)
for bars in (b1, b2):
    for r in bars:
        ax.text(r.get_x() + r.get_width() / 2, r.get_height() + 1.5,
                f"{r.get_height():.0f}%", ha="center", fontsize=9, color="#333333")
ax.set_xticks(x)
ax.set_xticklabels(cats, fontsize=9.5)
ax.set_ylabel("占比 (%)", fontsize=11)
ax.set_ylim(0, 112)
ax.legend(fontsize=9, frameon=False, loc="upper center")
ax.annotate("阈值调优 + 类权重\n（未使用过采样）", xy=(1.17, 47), xytext=(0.68, 80),
            fontsize=8.5, color="#333333",
            arrowprops=dict(arrowstyle="->", color="#666666", lw=0.9))
style_ax(ax)
panel_label(ax, "(c)")

# (d) 异常值占比箱线
ax = axes[1, 1]
n_f2 = 48
out_before = np.concatenate([rng.uniform(0.5, 4.0, 30), rng.uniform(4.0, 8.0, 18)])
out_after = np.clip(rng.gamma(0.9, 0.28, n_f2), 0.01, 0.95)
bp = ax.boxplot([out_before, out_after], widths=0.45, patch_artist=True,
                tick_labels=["治理前", "治理后"], showfliers=True,
                medianprops=dict(color="#333333", lw=1.4),
                flierprops=dict(marker="o", markersize=3, alpha=0.5))
for patch, c in zip(bp["boxes"], [C_GRAY, C_MAIN]):
    patch.set_facecolor(c)
    patch.set_alpha(0.75)
    patch.set_edgecolor("#444444")
ax.set_ylabel("异常值占比 (%)", fontsize=11)
ax.axhline(1.0, color=C_GRAY, ls="--", lw=1.0, zorder=2)
ax.text(0.62, 1.15, "1% 目标线", fontsize=8.5, color="#555555")
ax.tick_params(axis="x", labelsize=9.5)
style_ax(ax)
panel_label(ax, "(d)")

note_sim(fig)
fig.tight_layout()
save(fig, "fig02_data_governance")
