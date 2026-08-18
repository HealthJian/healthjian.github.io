# 期刊级绘图风格规范（Nature/Science 美学，中文标注）

## 总体
- 目标期刊审美：Nature / Science / IEEE TSM 风格——白底、低饱和暖色调、克制配色、充分留白、信息密度适中
- 禁止：高饱和纯色、蓝紫渐变、3D 效果、阴影、花哨背景、Google 风格
- 中文标注（图题、轴、图例、注释均中文；算法名/术语保留英文如 DAPO、PPO、KL、entropy）
- 每个子图标注 (a) (b) (c)，粗体，置于子图左上角外侧
- 输出：PNG（dpi=300）+ PDF 矢量版，保存到 /mnt/agents/output/figures/
- 所有模拟数据图必须在图内或图题明确标注 "模拟数据，仅作示意"（小字，右下角）
- matplotlib 中文字体已预装，不要修改 rcParams 的 font.family / font.sans-serif / axes.unicode_minus

## 配色（低饱和暖色系，跨图统一）
- C_MAIN = "#A65D57"   # 赭红（主线/主强调）
- C_TEAL = "#6E8B8B"   # 灰青（第二序列）
- C_SAND = "#C9A36A"   # 沙金（第三序列）
- C_SLATE = "#6B7B8D"  # 石板蓝灰（第四序列）
- C_GRAY = "#8C8C8C"   # 中性灰（参考线/基线）
- C_BG = "#FFFFFF"
- 辅助浅色调（填充/置信带）：上述色 alpha=0.15~0.25

## 版式
- 单面板图：figsize ≈ (6.5, 4.2)；多面板：宽度 10–13，每面板高约 3.2–3.8
- 字号：轴标题 11，刻度 9.5，图例 9，子图标签 (a) 12 粗体，图内注释 9
- 轴线：仅左/下脊柱（spine）显示，颜色 #444444，线宽 0.8；刻度朝外
- 网格：仅 y 方向浅灰虚线（#DDDDDD, lw=0.6, zorder=0）
- 线宽：主线 1.8–2.2，参考线 1.0–1.2 虚线
- 曲线加轻微半透明置信带/噪声，使其看起来像真实训练日志（但标注为模拟）
- 图题不作为图内 suptitle（报告正文中写图注），图内只放面板标签与必要注释
- tight_layout / constrained_layout，保存 bbox_inches="tight"

## 架构图/流程图规范
- 圆角矩形（FancyBboxPatch, boxstyle="round,pad=0.02, rounding_size=0.03"）
- 箭头：FancyArrowPatch，arrowstyle="-|>"，颜色 #666666
- 分层配色用上述四主色的浅色填充（alpha≈0.85 太深则降到 0.7）+ 深色描边
- 文字深灰 #222222，模块内文字居中
