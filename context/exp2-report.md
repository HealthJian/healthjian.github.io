# 实验二：SVM 乳腺癌检测报告

## 摘要

本报告详尽记录了应用支持向量机 (SVM) 对公开的威斯康星州乳腺癌（诊断）数据集进行二分类预测的完整实验流程与分析。实验核心目标聚焦于利用描述细胞核形态学特性的 30 个数值型特征，构建一个高性能模型以准确区分恶性 (Malignant) 与良性 (Benign) 乳腺肿瘤。遵循标准的机器学习实践，实验始于数据加载和全面的探索性数据分析 (EDA)。通过细致的可视化，包括按特征类型（均值、标准误、最差值）分组的相关性热力图、基于标准化值的特征分布小提琴图以及 PCA 降维图，我们揭示了特征间显著的相关性结构（如半径、周长、面积特征的高度相关），确认了不同类别样本在关键特征（如凹度、凹点数）上的分布差异，并验证了数据的可分离性。关键的预处理步骤是对特征进行了标准化，以适应 SVM 对尺度的敏感性。实验的核心环节在于系统性比较了四种常用 SVM 核函数（Linear, Poly, RBF, Sigmoid）的分类性能，采用准确率、ROC 曲线下面积 (AUC)、混淆矩阵及分类报告（精确率、召回率、F1 分数）作为评估指标。性能对比（见 `exp2/output/roc_curves.png`, `exp2/output/accuracy_comparison.png`）清晰表明，非线性的 RBF 核与线性 Linear 核在此数据集上展现出最优越的性能。基于此发现，我们运用网格搜索 (GridSearchCV) 结合交叉验证，对性能最佳的核函数进行了细致的超参数调优，重点优化了惩罚参数 `C` 和核系数 `gamma`。最终，优化后的 SVM 模型在测试集上表现卓越，其性能通过混淆矩阵 (`exp2/output/confusion_matrix.png`) 和分类报告得以验证：模型不仅实现了极高的整体准确率（通常稳定在 98% 以上），更重要的是，其在识别恶性肿瘤方面展现出高召回率，将恶性误诊为良性的假阴性 (FN) 案例数量控制在极低水平，这对于临床应用具有重大意义。本次实验不仅成功构建了一个有效的乳腺癌分类模型，也为理解和应用 SVM 解决实际生物医学分类问题提供了宝贵的实践经验。

## 1. 引言

### 1.1 项目背景与意义

乳腺癌作为全球范围内威胁女性健康的主要恶性肿瘤之一，其发病率和死亡率长期居高不下，给患者、家庭乃至社会带来了沉重的负担。临床实践反复证明，早期发现和精确诊断是显著提高乳腺癌患者五年生存率、改善预后和降低治疗成本的关键所在。目前，乳腺癌的诊断流程通常结合了多种手段，包括临床体检、影像学检查（如钼靶 X 线摄影、超声、MRI）以及组织病理学分析。其中，通过细针穿刺 (Fine Needle Aspiration, FNA) 或核心活检获取组织样本，并由病理医生在显微镜下观察细胞形态特征，是确定肿瘤性质（良性或恶性）的金标准。然而，这些传统方法也面临着一些挑战和局限性。首先，影像学检查可能存在一定的假阳性或假阴性率，尤其对于致密型乳腺或早期微小病灶。其次，病理诊断虽然准确性高，但依赖于病理医生的专业知识和经验，不同医生之间可能存在观察和判读上的差异（inter-observer variability），且阅片过程耗时较长。此外，活检本身具有一定的侵入性，可能给患者带来不适和风险。

近年来，人工智能，特别是机器学习技术的飞速发展，为改进医学诊断流程、提高效率和精度带来了革命性的机遇 [1, 2]。机器学习算法擅长从高维、复杂的数据中学习隐藏的模式和规律，这使其在处理医学影像、基因组学数据以及本实验所关注的细胞形态学数据方面具有巨大潜力。通过将从 FNA 样本数字图像中定量提取的细胞核特征（如大小、形状、纹理等）作为输入，机器学习模型可以学习构建一个客观、可重复的分类器，辅助医生进行良恶性肿瘤的鉴别。这不仅有望提高诊断的一致性和速度，减少不必要的侵入性检查，还可能发现人类视觉难以察觉的细微病理特征，为更早期的诊断和更精准的预后判断提供支持。

在众多机器学习算法中，支持向量机 (Support Vector Machine, SVM) 因其优秀的泛化能力和处理高维数据的有效性，在生物医学分类任务中得到了广泛应用 [3]。SVM 的核心思想是找到一个最优的超平面，以最大间隔 (maximum margin) 将不同类别的样本点分开。对于非线性可分的数据，SVM 通过引入核函数（如线性核、多项式核、RBF 核、Sigmoid 核）将数据巧妙地映射到更高维甚至无限维的特征空间，从而在高维空间中找到线性决策边界。这种"核技巧"使得 SVM 能够有效地处理复杂的非线性关系，而无需显式地计算高维空间的坐标，保持了计算效率。其最大间隔的特性也赋予了模型良好的泛化性能，不易过拟合，尤其是在样本量相对有限的情况下。

本项目选择经典的威斯康星州乳腺癌（诊断）数据集 [4] 进行实验研究，该数据集正是基于 FNA 图像计算得到的细胞核特征。选用此数据集具有多重意义：首先，它是一个公开、标注良好、被广泛用于机器学习分类任务性能评估的基准数据集，便于比较和复现结果；其次，它直接关联临床实践中通过 FNA 获取细胞学特征进行诊断的场景，使得基于此数据集训练的模型具有潜在的临床应用价值；最后，通过在本数据集上系统性地应用和比较不同 SVM 核函数及优化策略，可以深入理解 SVM 算法的工作原理、参数影响以及在实际生物医学问题中的应用方法。因此，本实验不仅旨在构建一个高性能的乳腺癌分类器，更重要的是通过这个过程，探索和展示机器学习技术，特别是 SVM，在辅助癌症诊断、提高医疗效率和精度方面的巨大潜力，为未来更智能化的医疗诊断系统研发提供参考和基础。

### 1.2 实验目标

本次实验的核心目标是利用威斯康星州乳腺癌（诊断）数据集，构建并优化一个基于 SVM 的分类模型，以准确区分恶性和良性肿瘤。具体子目标包括：

1.  **数据理解与探索**: 加载数据集，理解特征含义，利用统计分析和可视化手段探索数据分布、特征相关性以及特征与诊断结果的关系。
2.  **数据预处理**: 对特征数据进行标准化处理，以适应 SVM 算法的要求。
3.  **SVM 核函数比较**: 系统性地训练和评估使用不同核函数（Linear, Poly, RBF, Sigmoid）的 SVM 模型。
4.  **模型评估与选择**: 使用准确率、ROC 曲线、AUC 值、混淆矩阵和分类报告（精确率、召回率、F1 分数）等指标评估和比较不同核函数的性能，选择最优核函数。
5.  **超参数优化**: 对选定的最佳核函数，使用网格搜索 (GridSearchCV) 寻找最优的超参数组合（如 `C`, `gamma`）。
6.  **结果分析与报告**: 分析可视化结果和模型性能指标，总结实验发现，并撰写实验报告。

### 1.3 数据集概述

本实验使用的数据集是公开的威斯康星州乳腺癌（诊断）数据集 [4]，可从 UCI 机器学习库获取。

*   **数据来源**: 从乳腺肿块的细针穿刺 (FNA) 数字图像中计算得出。
*   **数据文件**: 主要使用 `data/exp2/data.csv`。
*   **样本数量**: 569 个样本。
*   **特征数量**: 32 列，包括 'id'、'diagnosis' (目标变量) 和 30 个数值型特征。
*   **特征描述**: 30 个特征是基于 10 个基本细胞核特性计算得出的均值 (mean)、标准误 (se) 和最差值 (worst)。这 10 个基本特性包括：
    *   `radius`: **半径** (从中心到周长上点的距离的平均值)
    *   `texture`: **纹理** (灰度值的标准差)
    *   `perimeter`: **周长**
    *   `area`: **面积**
    *   `smoothness`: **平滑度** (半径长度的局部变化)
    *   `compactness`: **紧凑度** (周长² / 面积 - 1.0)
    *   `concavity`: **凹度** (轮廓凹陷部分的严重程度)
    *   `concave points`: **凹点数** (轮廓凹陷部分的数量)
    *   `symmetry`: **对称性**
    *   `fractal dimension`: **分形维数** ("海岸线近似" - 1)
*   **目标变量**: `diagnosis`，包含两个类别：'M' (Malignant - 恶性) 和 'B' (Benign - 良性)。实验中将其编码为 1 (恶性) 和 0 (良性)。
*   **类别分布**: 数据相对均衡，包含 357 例良性 (62.74%) 和 212 例恶性 (37.26%)。
*   **缺失值**: 原始数据集中无缺失值，但加载代码中包含了处理潜在缺失列（如 'Unnamed: 32'）和填充缺失值的逻辑。

实验代码位于 `exp2/breast_cancer_svm.py` 和 `exp2/run_experiment.py`，依赖 NumPy, Pandas, Matplotlib, Scikit-learn 和 Seaborn 等库。可视化结果和分析报告输出到 `exp2/output` 文件夹。

## 2. 数据加载与探索性数据分析 (EDA)

### 2.1 数据加载与初步处理

脚本首先使用 `pandas` 加载 `data/exp2/data.csv` 数据集。执行了以下初步处理：
*   移除了不用于模型训练的 `id` 列。
*   移除了在 `data.csv` 中存在的全空列 `Unnamed: 32`。
*   将目标变量 `diagnosis` 从 'M'/'B' 映射为 1/0 的数值类型。
*   分离特征数据 `X` (30个特征) 和目标变量 `y` (`diagnosis`)。
*   检查并确认处理后的数据中无缺失值。
*   打印了目标变量的类别分布情况。

### 2.2 探索性数据分析 (EDA)

为了深入理解数据特性，进行了以下 EDA：

*   **特征相关性分析**:
    *   计算了 30 个数值特征之间的皮尔逊相关系数。为了避免单个大型热力图信息密度过高，将特征按度量类型（Mean, SE, Worst）分为三组，分别绘制相关性热力图：
        *   **Mean 特征相关性 (`exp2/output/correlation_heatmap_mean.png`)**:
            ![Mean 特征相关性热力图](exp2/output/correlation_heatmap_mean.png)
            *分析*: `radius_mean`, `perimeter_mean`, `area_mean` 之间以及 `concavity_mean`, `concave points_mean` 之间存在强正相关。
        *   **SE 特征相关性 (`exp2/output/correlation_heatmap_se.png`)**:
            ![SE 特征相关性热力图](exp2/output/correlation_heatmap_se.png)
            *分析*: SE 特征内部也存在类似的相关性模式，如 `radius_se`, `perimeter_se`, `area_se` 强相关。
        *   **Worst 特征相关性 (`exp2/output/correlation_heatmap_worst.png`)**:
            ![Worst 特征相关性热力图](exp2/output/correlation_heatmap_worst.png)
            *分析*: Worst 特征同样显示出组内强相关性，如 `radius_worst`, `perimeter_worst`, `area_worst`。
    *   *总体评价*: 分组热力图清晰展示了特征组内部的高度相关性，提示了潜在的多重共线性问题。

*   **特征分布分析**:
    *   为了比较不同诊断结果下特征的分布，绘制了前 10 个 Mean 特征的小提琴图。由于原始特征尺度差异大，**绘图时对特征值进行了标准化处理**。
        ![特征分布小提琴图 (标准化值)](exp2/output/feature_distribution_violinplot.png)
        *分析*: 标准化后的小提琴图清晰显示，对于大多数 Mean 特征，恶性肿瘤样本（salmon色）的分布中位数和整体范围通常高于良性肿瘤样本（skyblue色），表明这些特征具有良好的区分潜力。

*   **降维可视化 (PCA)**:
    *   使用主成分分析 (PCA) 将 30 维特征降到 2 维进行可视化。
        ![PCA 降维可视化](exp2/output/pca_visualization.png)
        *分析*: 图中显示，即使在二维空间中，良性（绿点）和恶性（红方块）样本也表现出较好的可分离性，说明数据内部结构适合分类任务。前两个主成分解释了相当一部分数据方差（具体比例在运行时输出）。

## 3. SVM 数学原理

支持向量机 (SVM) 是一种强大的监督学习算法，广泛应用于分类和回归任务。其核心思想是找到一个最优的决策边界（对于二分类问题，通常是一个超平面），使得不同类别样本之间的间隔最大化。

### 3.1 线性 SVM

对于线性可分的数据集，假设我们有一个包含 \(n\) 个样本的数据集 \(\{(x_i, y_i)\}_{i=1}^n\)，其中 \(x_i \in \mathbb{R}^p\) 是 \(p\) 维特征向量，\(y_i \in \{-1, 1\}\) 是类别标签。SVM 旨在找到一个超平面 \(w \cdot x + b = 0\)，其中 \(w\) 是法向量，\(b\) 是偏置项。

该超平面需要满足以下条件：
\[y_i (w \cdot x_i + b) \ge 1, \quad \forall i=1, ..., n\]
这个条件确保所有样本点都被正确分类，并且距离超平面至少有一定的间隔。两个支撑超平面（距离决策超平面最近的样本点所在的超平面）分别是 \(w \cdot x + b = 1\) 和 \(w \cdot x + b = -1\)。它们之间的距离称为**间隔 (margin)**，等于 \(\frac{2}{\|w\|}\)。

SVM 的目标是**最大化这个间隔**，这等价于**最小化 \(\|w\|^2\)**（或 \(\frac{1}{2}\|w\|^2\) 以方便计算）。因此，线性可分 SVM 的基本型（硬间隔 SVM）可以表示为以下约束优化问题：
\[
\begin{aligned}
& \min_{w, b} & & \frac{1}{2} \|w\|^2 \\
& \text{s.t.} & & y_i (w \cdot x_i + b) \ge 1, \quad i = 1, ..., n
\end{aligned}
\]

在现实数据中，样本通常不是完全线性可分的。为了处理这种情况，引入了**软间隔 SVM**。软间隔允许一些样本点不满足间隔约束（即允许被错误分类或落在间隔内部），但需要为此付出一定的代价。通过引入松弛变量 \(\xi_i \ge 0\)，约束条件变为 \(y_i (w \cdot x_i + b) \ge 1 - \xi_i\)。优化目标变为：
\[
\begin{aligned}
& \min_{w, b, \xi} & & \frac{1}{2} \|w\|^2 + C \sum_{i=1}^n \xi_i \\
& \text{s.t.} & & y_i (w \cdot x_i + b) \ge 1 - \xi_i, \quad \xi_i \ge 0, \quad i = 1, ..., n
\end{aligned}
\]
其中 \(C > 0\) 是**惩罚参数**（正则化参数），它控制着最大化间隔和最小化分类错误之间的权衡。\(C\) 越大，对误分类的惩罚越重，模型倾向于选择更小的间隔以减少训练错误；\(C\) 越小，对误分类的容忍度越高，模型倾向于选择更大的间隔，可能容忍更多的训练错误以获得更好的泛化能力。

### 3.2 核技巧 (Kernel Trick)

对于线性不可分的数据，SVM 使用**核技巧**来处理。其思想是将原始特征空间 \(\mathcal{X}\) 中的数据通过一个非线性映射函数 \(\phi: \mathcal{X} \to \mathcal{F}\) 映射到一个更高维甚至无限维的特征空间 \(\mathcal{F}\)，使得数据在新的特征空间 \(\mathcal{F}\) 中变得线性可分（或近似线性可分）。然后，在高维特征空间中应用线性 SVM。

核技巧的关键在于，我们不需要显式地计算高维特征 \(\phi(x)\)，也不需要知道映射函数 \(\phi\) 的具体形式。我们只需要定义一个**核函数 (Kernel Function)** \(K(x_i, x_j) = \phi(x_i) \cdot \phi(x_j)\)，它直接计算了两个样本在**高维空间中的内积**。

通过求解 SVM 的对偶问题，可以发现决策函数仅依赖于样本之间的内积。因此，可以将对偶问题和决策函数中的内积 \(x_i \cdot x_j\) 替换为核函数 \(K(x_i, x_j)\)。最终的决策函数形式为：
\[ f(x) = \text{sign} \left( \sum_{i=1}^n \alpha_i y_i K(x_i, x) + b \right) \]
其中 \(\alpha_i\) 是通过求解对偶问题得到的拉格朗日乘子，只有支持向量（距离超平面最近或被错误分类的样本）对应的 \(\alpha_i\) 才非零。

### 3.3 常用核函数

本实验中比较了以下几种常用的核函数：

1.  **线性核 (Linear Kernel)**: \(K(x_i, x_j) = x_i \cdot x_j\)。这实际上等价于在原始空间进行线性分类。
2.  **多项式核 (Polynomial Kernel)**: \(K(x_i, x_j) = (\gamma (x_i \cdot x_j) + r)^d\)。其中 \(\gamma\) 是核系数，\(r\) 是常数项，\(d\) 是多项式的阶数。可以捕捉特征之间的多项式关系。
3.  **径向基函数核 (Radial Basis Function Kernel, RBF Kernel)**，也称高斯核: \(K(x_i, x_j) = \exp(-\gamma \|x_i - x_j\|^2)\)。其中 \(\gamma > 0\) 是核系数，控制了单个样本影响的范围（\(\gamma\) 越大，影响范围越小）。RBF 核可以将数据映射到无限维空间，具有很强的非线性拟合能力，是 SVM 中最常用和默认的核函数之一。
4.  **Sigmoid 核 (Sigmoid Kernel)**: \(K(x_i, x_j) = \tanh(\gamma (x_i \cdot x_j) + r)\)。源于神经网络，其性能通常不如 RBF 核，且对参数选择更敏感。

选择合适的核函数及相应的超参数（如 \(C, \gamma, d\)）对于 SVM 模型的性能至关重要，通常需要通过交叉验证等方法进行选择和优化。

## 4. 特征工程与预处理

本实验中主要的预处理步骤是在模型训练和评估之前对特征数据进行**标准化**：
*   使用 `sklearn.preprocessing.StandardScaler` 对特征矩阵 `X` 进行拟合和转换，使其均值为 0，标准差为 1。
*   这对 SVM 尤其重要，因为 SVM 对特征尺度敏感。
*   在划分训练集和测试集后，使用在训练集上拟合的 `scaler` 对测试集进行转换，避免数据泄露。

## 5. 模型训练与评估

实验的核心是训练和评估使用不同核函数的 SVM 分类器。

*   **数据划分**: 使用 `train_test_split` (通常 test_size=0.25, random_state=42) 将数据划分为训练集和测试集，用于模型评估和比较。
*   **模型选择 (核函数比较)**: 比较了以下四种 SVM 核函数：
    *   **线性核 (`kernel='linear'`)**: 在原始特征空间中寻找线性决策边界。适用于线性可分或近似线性可分的数据。
    *   **多项式核 (`kernel='poly'`)**: 通过多项式映射将数据投影到更高维空间，寻找非线性决策边界。需要调整 `degree` (阶数) 和 `gamma` 参数。
    *   **径向基函数 (RBF) 核 (`kernel='rbf'`)**: 最常用的核函数之一。通过高斯函数将数据映射到无限维空间，可以处理复杂的非线性边界。需要调整 `C` 和 `gamma` 参数。
    *   **Sigmoid 核 (`kernel='sigmoid'`)**: 源于神经网络，将数据映射到 (-1, 1) 之间。性能通常不如 RBF 核。需要调整 `gamma` 参数。
*   **评估指标**:
    *   **准确率 (Accuracy)**: `accuracy_score`，预测正确的样本比例。
    *   **ROC 曲线 (Receiver Operating Characteristic Curve)** 和 **AUC (Area Under the Curve)**: `roc_curve`, `auc`，评估模型在不同阈值下的分类能力，AUC 越接近 1 越好。
    *   **混淆矩阵 (Confusion Matrix)**: `confusion_matrix`，展示 TP, TN, FP, FN 的数量。
    *   **分类报告 (Classification Report)**: `classification_report`，提供每个类别的精确率 (Precision)、召回率 (Recall) 和 F1 分数 (F1-Score)。
*   **交叉验证**: 在初步评估 (`evaluate_kernel`) 和超参数调优 (`GridSearchCV`) 中使用了 5 折交叉验证 (`cv=5`)，以获得更稳健的性能估计。
*   **核函数性能比较**:
    *   脚本分别训练了使用四种核函数的 SVM 模型，并在测试集上计算了性能指标。
    *   绘制了 ROC 曲线图和准确率比较图：
        ![不同核函数的 ROC 曲线](exp2/output/roc_curves.png)
        *分析*: 所有核函数的 AUC 值都远高于 0.5，表明 SVM 的有效性。RBF 和 Linear 核的 AUC 通常最高，曲线最靠近左上角。
        ![不同核函数的准确率比较](exp2/output/accuracy_comparison.png)
        *分析*: 条形图显示 RBF 和 Linear 核的准确率通常最高，显著优于 Poly 和 Sigmoid 核。脚本根据准确率选择最佳核函数进行后续优化。

### 5.3 核函数性能比较

根据 `result_summary.md` 中记录的典型运行结果，各核函数在测试集上的大致性能如下（注意：具体数值可能因随机划分略有差异）：

*   **Linear**: 准确率约 96.5%, AUC 约 0.99
*   **Poly**: 准确率约 95.1%, AUC 约 0.99
*   **RBF**: 准确率约 **97.2%**, AUC 约 0.99
*   **Sigmoid**: 准确率约 92.3%, AUC 约 0.97

评估结果表明，RBF 核和 Linear 核在此任务上表现最为出色。

## 6. 超参数调优

*   **方法**: 对上一阶段选出的最佳核函数（通常是 RBF 或 Linear），使用 `GridSearchCV` 结合 5 折交叉验证，在训练集上搜索最优的超参数组合。
*   **搜索范围**:
    *   `C` (惩罚参数): 控制对误分类的惩罚程度，搜索范围如 `[0.1, 1, 10, 100]`。
    *   `gamma` (核系数，用于 RBF, Poly, Sigmoid): 控制单个训练样本的影响范围，搜索范围如 `[0.001, 0.01, 0.1, 1, 'scale', 'auto']`。
    *   `degree` (多项式阶数，用于 Poly): 搜索范围如 `[2, 3, 4]`。
*   **目标**: 找到在交叉验证中平均准确率最高的超参数组合。

## 7. 预测与结果评估

### 7.1 最终模型与评估

根据 `result_summary.md` 中的典型结果，在使用网格搜索对性能最佳的 **RBF 核** 进行超参数调优后，得到的最优参数组合通常为 **`C=10`, `gamma=0.01`** （具体值可能随运行而变化）。

使用这些最优参数在完整训练集上重新训练 RBF-SVM 模型，并在测试集上进行评估：

*   **混淆矩阵**:
    ![优化后模型的混淆矩阵](exp2/output/confusion_matrix.png)
    *分析*: 混淆矩阵清晰地展示了最终模型在测试集上的表现。特别关注左下角的假阴性 (FN) 数量，即恶性被误判为良性。优化后的 SVM 在此数据集上通常能将 FN 控制在很低的水平（例如，`result_summary.md` 显示的运行中可能只有 1-2 个 FN）。
*   **分类报告**: 脚本运行时输出到控制台的分类报告提供了详细的性能指标。根据 `result_summary.md` 记录的一次典型运行结果：
    ```
                  precision    recall  f1-score   support

        良性(B)       0.99      0.98      0.99        89
        恶性(M)       0.97      0.98      0.98        54

        accuracy                           0.98       143
       macro avg       0.98      0.98      0.98       143
    weighted avg       0.98      0.98      0.98       143
    ```
    *分析*: 最终模型在测试集上达到了约 **98%** 的整体准确率。对于恶性类别 (M)，精确率约为 97%，召回率约为 98%，F1 分数约为 98%。高召回率表明模型能成功识别出绝大多数恶性肿瘤，这在临床应用中非常重要。

## 8. 结论

本实验成功应用支持向量机 (SVM) 对威斯康星州乳腺癌数据集进行了有效的分类。
*   通过 EDA 和可视化分析，确认了数据特征（特别是 Mean 特征组）包含了区分良恶性肿瘤的有效信息，但也存在多重共线性。
*   比较不同 SVM 核函数发现，RBF 和 Linear 核在此任务上表现最佳。
*   通过对 RBF 核进行超参数调优 (典型最优参数 C=10, gamma=0.01)，最终模型在测试集上展现出卓越的性能，准确率可达 98% 左右，并且关键的恶性肿瘤召回率很高（约 98%），假阴性样本极少。
*   改进后的可视化（分组热力图、标准化小提琴图）为数据理解和模型评估提供了更清晰的视角。
*   结果表明，经过适当选择核函数和优化参数的 SVM 是解决此类医学诊断辅助问题的强大工具。

## 参考文献

[1] Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., ... & Duchesnay, E. (2011). Scikit-learn: Machine learning in Python. *Journal of Machine Learning Research*, 12(Oct), 2825-2830.

[2] Kourou, K., Exarchos, T. P., Exarchos, K. P., Karamouzis, M. V., & Fotiadis, D. I. (2015). Machine learning applications in cancer prognosis and prediction. *Computational and structural biotechnology journal*, 13, 8-17.

[3] Huang, S., Cai, N., Pacheco, P. P., Narrandes, S., Wang, Y., & Xu, W. (2018). Applications of support vector machine (SVM) learning in cancer genomics. *Cancer genomics & proteomics*, 15(1), 41-51.

[4] Dua, D. and Graff, C. (2019). UCI Machine Learning Repository [http://archive.ics.uci.edu/ml]. Irvine, CA: University of California, School of Information and Computer Science. (Dataset: Breast Cancer Wisconsin (Diagnostic))

## 附录

(无) 