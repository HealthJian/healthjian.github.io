# 实验二结果目录

本目录包含SVM乳腺癌分类实验的所有结果和分析报告。

## 目录结构

```
exp2/output/
├── README.md                  # 本文件
├── analysis_report.md         # 详细分析报告
├── result_summary.md          # 结果摘要
├── feature_comparison.png     # 特征比较图表
├── pca_visualization.png      # PCA降维可视化
├── roc_curves.png             # 不同核函数ROC曲线
├── accuracy_comparison.png    # 准确率比较条形图
└── confusion_matrix.png       # 最佳模型混淆矩阵
```

## 文件说明

1. **analysis_report.md**: 包含详细的实验分析，包括实验背景、方法、结果和讨论。适合深入了解实验细节。

2. **result_summary.md**: 简洁地总结了实验结果和关键发现，适合快速了解实验结论。

3. **图表文件**:
   - **feature_comparison.png**: 显示良性和恶性肿瘤在主要特征上的差异
   - **pca_visualization.png**: 使用PCA将30维特征降至2维的可视化结果
   - **roc_curves.png**: 四种核函数的ROC曲线比较
   - **accuracy_comparison.png**: 四种核函数准确率比较
   - **confusion_matrix.png**: 最佳模型(RBF核)的混淆矩阵

## 查看结果

1. 通过查看 `result_summary.md` 快速了解实验结果
2. 阅读 `analysis_report.md` 获取详细分析
3. 参考图表文件直观理解数据特征和模型性能

## 重新运行实验

如需重新运行实验，请在项目根目录执行:

```bash
python exp2/run_experiment.py
```

或在exp2目录中执行:

```bash
python run_experiment.py
```

这将重新生成本目录中的所有结果文件。 