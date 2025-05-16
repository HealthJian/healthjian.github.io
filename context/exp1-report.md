# 实验一：波士顿房价预测报告

## 摘要

本报告详细记录了使用机器学习技术对经典波士顿房价数据集进行回归预测的实验过程。实验的核心目标是根据 13 个描述房屋及周边环境的特征（如房间数 `RM`、低收入人群比例 `LSTAT`、犯罪率 `CRIM` 等），构建能够准确预测自住房屋房价中位数 (`MEDV`) 的模型。实验遵循标准的机器学习工作流程，首先对数据进行了加载和全面的探索性数据分析（EDA）。通过可视化手段（如直方图、相关性热力图、散点图）揭示了数据的关键特性，包括部分特征的偏态分布、目标变量在高值处的截断现象、`RM` 与 `LSTAT` 对房价的强相关性以及特征间的共线性问题（如 `RAD` 与 `TAX`）。

基于 EDA 的发现，对数据进行了必要的预处理，核心步骤是使用 `StandardScaler` 对特征进行标准化，以消除量纲差异对模型训练的影响，同时探讨了添加交互特征和多项式特征的可能性。随后，系统性地训练和评估了多种常见的回归模型，涵盖了线性模型（线性回归、岭回归、Lasso 回归）和更复杂的集成模型（随机森林、梯度提升树、XGBoost）。模型性能通过均方根误差（RMSE）和决定系数（R²）进行量化，并利用 5 折交叉验证来评估其泛化能力和稳定性。评估结果（通过终端输出和可视化图表 `output/model_comparison.png` 展示）普遍表明，集成学习方法（特别是 XGBoost）在此任务上表现优于简单的线性模型。报告还讨论了超参数调优和特征重要性分析（`output/feature_importance.png`）作为进一步优化和理解模型的潜在步骤。最终，利用选定的最优模型对测试集进行预测，生成了预测结果文件 (`output/submission.csv`)，并通过预测值与真实值对比图 (`output/actualpricevspredictedprice.png`) 直观展示了模型效果。整个实验不仅完成了一个具体的预测任务，也完整地实践和展示了机器学习项目从数据理解到模型评估与应用的全过程。

## 1. 引言

### 1.1 项目背景与意义

在现代社会经济活动中，房地产市场扮演着至关重要的角色。房价不仅是衡量地区经济发展水平、居民生活成本的关键指标，也直接关系到个体家庭的资产配置、投资决策乃至整体金融市场的稳定。因此，对房价进行准确的预测和分析，无论是对于政府制定宏观调控政策、企业进行投资决策，还是个人进行房产买卖，都具有极其重要的现实意义和应用价值。机器学习技术的蓬勃发展 [1, 2]，为我们提供了强大的工具来处理复杂的数据集，挖掘隐藏在数据背后的模式，从而实现对房价等复杂经济现象的有效预测。通过构建精准的房价预测模型，我们可以更好地理解影响房价波动的关键因素，洞察市场趋势，为相关决策提供科学依据，减少信息不对称带来的风险。

本项目选取了经典的"波士顿房价数据集"作为研究对象。该数据集虽然年代较为久远（收集于 20 世纪 70 年代），但因其包含了丰富多样的、与房价相关的真实世界特征，并且数据量适中、易于获取，成为了机器学习领域，特别是回归问题研究中，广泛使用的基准数据集之一。通过对这个数据集进行分析和建模，我们可以系统性地学习和实践机器学习在回归预测任务中的标准流程，包括数据探索、特征工程、模型选择、训练评估以及结果解释等关键环节。这对于初学者掌握机器学习基本原理、熟悉常用算法库（如 Scikit-learn [1]）以及理解模型评价指标具有重要的教学价值。同时，尽管数据集本身存在一定的局限性（如时间滞后性、样本量相对较小等），但其揭示的影响房价的基本因素（如地理位置、房屋属性、社区环境、宏观经济指标等）在今天仍然具有一定的参考意义。通过本次实验，我们旨在深入理解如何运用机器学习方法解决实际的回归预测问题，并为后续更复杂、更现代的房地产市场分析打下坚实的基础。

### 1.2 实验目标

本次实验的核心目标是利用提供的波士顿房价训练数据集 (`train.csv`)，构建一个能够准确预测房屋价格中位数 (`MEDV`) 的机器学习回归模型。具体而言，实验包含以下几个子目标：

1.  **数据理解与探索**: 深入理解数据集的背景、各个特征的含义，利用统计分析和可视化手段（如直方图、散点图、相关性热力图等）探索数据的分布特性、特征之间的关系以及特征与目标变量（房价）的潜在联系，识别异常值或缺失值（尽管本数据集中无缺失值）。
2.  **数据预处理与特征工程**: 根据数据探索的发现，对数据进行必要的预处理，例如特征标准化（考虑到不同特征的量纲差异巨大），并可能尝试创建新的、更有预测能力的特征（如交互特征、多项式特征）来提升模型性能。
3.  **模型选择与训练**: 选用多种经典的机器学习回归算法，包括线性模型（线性回归、岭回归、Lasso 回归）和集成模型（随机森林 [3]、梯度提升树 [4]、XGBoost [5]），在处理后的训练数据上进行模型训练。
4.  **模型评估与比较**: 使用合适的评估指标（如均方根误差 RMSE、决定系数 R²）和交叉验证技术，客观地评估和比较不同模型的性能表现，理解各模型的优缺点和适用场景。
5.  **模型优化 (可选)**: 对表现较好的模型（如 XGBoost）进行超参数调优，寻找最佳参数组合以进一步提升预测精度。
6.  **特征重要性分析 (可选)**: 分析最终模型给出的特征重要性排序，理解哪些因素对波士顿房价影响最大，为模型提供一定的可解释性。
7.  **预测与结果生成**: 利用训练好的最优模型，对测试数据集 (`test.csv`) 进行房价预测，并将预测结果按照指定格式 (`sample.csv`) 保存到 `output/submission.csv` 文件中。

通过完成以上目标，我们期望不仅能得到一个性能良好的房价预测模型，更能全面掌握机器学习项目从数据到模型、再到结果解释的完整流程。

### 1.3 数据集概述

本次实验使用的数据集是波士顿房价数据集 [6]，具体包含以下文件：

*   `data/exp1/train.csv`: 训练数据，包含 404 个样本，每个样本有 13 个特征和 1 个目标变量 (`MEDV`)。
*   `data/exp1/test.csv`: 测试数据，包含 102 个样本，每个样本有 13 个特征，需要预测其对应的 `MEDV`。
*   `data/exp1/sample.csv`: 提交结果的示例文件，展示了 `submission.csv` 应有的格式。
*   `data/exp1/README.md`: 数据集的描述文件，包含了各特征的详细含义。

数据集包含的 13 个特征如下：

*   `CRIM`: 城镇人均犯罪率
*   `ZN`: 占地面积超过 25,000 平方英尺的住宅用地比例
*   `INDUS`: 城镇非零售商业用地所占比例
*   `CHAS`: 是否邻近查尔斯河（1 表示是，0 表示否）- 分类型特征
*   `NOX`: 一氧化氮浓度（百万分之一）- 环境指数
*   `RM`: 每栋住宅的平均房间数
*   `AGE`: 1940 年以前建成的自住单位比例
*   `DIS`: 与波士顿五个就业中心的加权距离
*   `RAD`: 距离高速公路的便利指数
*   `TAX`: 每万美元的不动产税率
*   `PTRATIO`: 城镇师生比例
*   `B`: 计算公式为 1000(Bk - 0.63)^2，其中 Bk 是城镇非裔美国人的比例
*   `LSTAT`: 房东属于低收入阶层人口的百分比

目标变量：

*   `MEDV`: 自住房屋房价中位数（单位：千美元）

需要注意的是，该数据集的特征类型多样，取值范围差异很大，且部分特征（如 `CRIM`, `ZN`, `B`）呈现明显的偏态分布，这在数据预处理和模型选择时需要特别考虑。同时，特征之间可能存在多重共线性（如 `RAD` 和 `TAX` 高度相关），这也可能影响某些模型的性能和解释性。实验代码位于 `exp1/exp1.py`，它将执行上述所有分析、处理和建模步骤，并依赖 NumPy [7] 和 Pandas [8] 等库进行数据处理，最终将可视化结果和预测文件输出到根目录下的 `output` 文件夹。

## 2. 数据加载与探索性数据分析 (EDA)

### 2.1 数据加载

脚本首先使用 `pandas` 库加载训练数据集 (`train.csv`) 和测试数据集 (`test.csv`)。根据 `exp1.py` 中的代码，数据文件是以空格分隔的，并且没有表头，因此在加载时指定了 `delim_whitespace=True` 和 `header=None`。加载后，为数据框添加了有意义的列名，如 'CRIM', 'ZN', 'RM', 'LSTAT', 'MEDV' 等。测试集比训练集少 'MEDV' 这一列。

### 2.2 探索性数据分析

脚本执行了详细的 EDA 来理解数据特性：

*   **基本信息**: 打印了数据的基本统计描述（如均值、标准差、分位数）和信息（数据类型、非空值数量）。确认了数据没有缺失值。
*   **特征分布**: 使用 `seaborn` 和 `matplotlib` 可视化了所有 13 个特征以及目标变量 `MEDV` 的分布直方图。具体可参见下图：
    ![特征分布](exp1/output/features_distribution.png)
    *分析*：从特征分布图中可以看出，许多特征并非理想的正态分布。例如 `CRIM`（犯罪率）、`ZN`（大面积住宅比例）、`B`（非裔美国人比例）呈现明显的右偏（正偏态），意味着大部分城镇这些指标的值较低，少数城镇的值很高。`CHAS`（是否临河）是一个二元变量。目标变量 `MEDV`（房价中位数）的分布相对接近正态分布，但尾部可能存在一些高价房产，且在最高值附近（50k美元）有截断现象（意味着部分房价可能超过了记录上限）。了解这些分布有助于选择合适的数据转换方法（如对数变换）或对模型选择提供参考。
    ![目标变量分布](exp1/output/target_distribution.png)
    *分析*：目标变量 `MEDV` 的分布图更清晰地显示了其近似正态的特性，但如上所述，在 50k 美元处有一个明显的峰值，这可能是数据收集时的上限或截断点，处理时需要注意。
    这有助于了解每个变量的分布形态（如是否偏态）。
*   **相关性分析**:
    *   计算了所有变量之间的皮尔逊相关系数，并通过热力图进行可视化：
      ![相关性矩阵热力图](exp1/output/correlation_matrix.png)
      *分析*：热力图直观展示了变量间的线性相关强度。颜色越红表示正相关越强，越蓝表示负相关越强。可以看到 `RAD`（高速公路便利指数）和 `TAX`（税率）之间存在非常强的正相关（接近 0.9），表明存在多重共线性问题，这可能会影响线性模型的系数解释和稳定性。此外，`NOX`（一氧化氮浓度）与 `INDUS`（非商业用地比例）、`AGE`（老房比例）等也呈现较强的正相关。与目标变量 `MEDV` 相关性方面，`RM`（房间数）呈现最强的正相关，而 `LSTAT`（低收入阶层比例）呈现最强的负相关。
      这有助于识别特征之间的多重共线性以及特征与目标变量的关系。
    *   特别绘制了所有特征与目标变量 `MEDV` 的相关性条形图：
      ![特征与目标变量相关性](exp1/output/correlation_with_target.png)
      *分析*：此图更清晰地排序和量化了各个特征与 `MEDV` 的线性相关性。可以看出，`RM` 的正相关性最高，其次是 `ZN`。负相关性最强的是 `LSTAT`，其次是 `PTRATIO`（师生比）、`INDUS`、`TAX`、`NOX`、`CRIM` 和 `AGE`。这为初步的特征选择提供了依据，`RM` 和 `LSTAT` 是预测房价的最重要线性特征。
      分析显示，`RM`（每栋住宅的平均房间数）与房价呈正相关，而 `LSTAT`（低收入人群比例）与房价呈显著负相关，这两个特征对房价的影响最大。
    *   绘制了相关性最高的几个特征（如 `RM`, `LSTAT`）与 `MEDV` 之间的散点图：
      ![高相关性特征与目标变量散点图](exp1/output/features_vs_target.png)
      *分析*：散点图进一步揭示了特征与目标变量的关系形态。
        - `RM` vs `MEDV` 的散点图大致呈现出清晰的线性正相关趋势：房间数量越多，房价中位数越高。但也存在一些离群点，且在高 `RM` 值区域，关系似乎不完全是线性的。
        - `LSTAT` vs `MEDV` 的散点图显示了明显的负相关关系，但这种关系可能不是严格线性的，更像是曲线关系：随着低收入人群比例的增加，房价中位数下降，且下降速度在 `LSTAT` 较低时更快。
      这些图有助于判断线性模型是否足够，或者是否需要考虑非线性模型或特征转换。同时也帮助识别可能的异常数据点。
      这有助于更直观地观察它们之间的线性或非线性关系。

EDA 的结果为后续的特征工程和模型选择提供了重要依据。

## 3. 特征工程与预处理

在模型训练之前，进行了必要的特征工程和预处理：

*   **特征与目标分离**: 将训练数据分为特征矩阵 `X` 和目标向量 `y` (`MEDV`)。
*   **特征缩放**: 由于不同特征的取值范围差异很大（例如，`ZN` 在 0-100 之间，`CHAS` 是 0 或 1），脚本使用了 `sklearn.preprocessing.StandardScaler` 对所有特征进行了标准化（转换为均值为 0，标准差为 1 的分布）。这对许多依赖于距离或梯度的模型（如线性回归、岭回归、Lasso、SVM 等）至关重要，可以防止某些特征因数值范围过大而主导模型训练。测试集的特征也使用在训练集上 `fit` 过的同一个 `scaler` 进行 `transform`，以保证一致性。
*   **特征创建 (可选)**: 脚本中还包含了创建新特征的代码（尽管可能被注释掉或作为可选步骤）：
    *   **交互特征**: 例如，`RM` 和 `LSTAT` 的乘积 (`RM_LSTAT`)，尝试捕捉这些强相关特征之间的交互效应。
    *   **多项式特征**: 例如，`RM` 和 `LSTAT` 的平方项 (`RM_sq`, `LSTAT_sq`)，尝试捕捉可能的非线性关系。

这些处理步骤旨在提高模型的性能和稳定性。

### 3.1 特征工程伪代码解释

以下是特征工程与预处理部分 (`feature_engineering` 函数) 的伪代码解释：

```
FUNCTION feature_engineering(train_data, test_data):
    // 打印开始信息
    PRINT "开始特征工程..."

    // 1. 复制数据框以避免修改原始数据
    train_processed = COPY(train_data)
    test_processed = COPY(test_data)

    // 2. 分离特征和目标变量
    X = train_processed.DROP_COLUMN('MEDV') // 训练集特征
    y = train_processed.GET_COLUMN('MEDV')  // 训练集目标

    // 3. 特征标准化
    // 初始化标准化器
    scaler = INITIALIZE StandardScaler()
    // 使用训练特征 X 拟合标准化器，并转换 X
    X_scaled = scaler.FIT_TRANSFORM(X)
    // 使用 *同一个* 拟合好的标准化器转换测试特征
    test_scaled = scaler.TRANSFORM(test_processed)

    // 4. 将标准化后的 NumPy 数组转换回 Pandas DataFrame，保留列名
    X_scaled_df = CREATE_DATAFRAME(X_scaled, columns=X.columns)
    test_scaled_df = CREATE_DATAFRAME(test_scaled, columns=test_processed.columns)

    // 5. 可选步骤：创建新特征 (示例)
    // 创建交互特征 RM * LSTAT
    X_scaled_df['RM_LSTAT'] = X_scaled_df['RM'] * X_scaled_df['LSTAT'] * -1
    test_scaled_df['RM_LSTAT'] = test_scaled_df['RM'] * test_scaled_df['LSTAT'] * -1

    // 创建多项式特征 RM^2 和 LSTAT^2
    X_scaled_df['RM_sq'] = X_scaled_df['RM'] ** 2
    test_scaled_df['RM_sq'] = test_scaled_df['RM'] ** 2
    X_scaled_df['LSTAT_sq'] = X_scaled_df['LSTAT'] ** 2
    test_scaled_df['LSTAT_sq'] = test_scaled_df['LSTAT'] ** 2

    // 6. 返回处理后的数据
    RETURN X_scaled_df, y, test_scaled_df
```

## 4. 模型训练与评估

脚本采用了系统化的方法来训练和评估多个常见的回归模型：

*   **数据划分**: 使用 `sklearn.model_selection.train_test_split` 将处理后的训练数据划分为训练集和验证集（例如，80% 训练，20% 验证），用于评估模型在未见过的数据上的泛化能力。
*   **模型选择**: 训练了多种回归模型，涵盖了从基础到先进的算法，以便进行全面的比较：
    *   **线性回归 (`LinearRegression`)**
        *   **原理**: 最基础的回归算法，旨在找到一条最佳拟合直线（或超平面）来描述特征 \(X\) 与目标变量 \(y\) 之间的线性关系。它假设目标变量是特征的线性组合加上一个误差项。
        *   **公式**: 模型形式为 \( \hat{y} = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + ... + \beta_p x_p \)，其中 \( \hat{y} \) 是预测值，\( x_1, ..., x_p \) 是特征，\( \beta_0 \) 是截距项，\( \beta_1, ..., \beta_p \) 是特征对应的系数。模型通过最小化残差平方和 (Residual Sum of Squares, RSS) 来估计系数 \( \beta \)：
            \[ \text{RSS} = \sum_{i=1}^{n} (y_i - \hat{y}_i)^2 = \sum_{i=1}^{n} (y_i - (\beta_0 + \sum_{j=1}^{p} \beta_j x_{ij}))^2 \]
    *   **岭回归 (`Ridge`) - L2 正则化**
        *   **原理**: 线性回归的一种正则化形式，主要用于处理特征间存在多重共线性（高度相关）的情况以及防止模型过拟合。它在线性回归的损失函数（RSS）基础上增加了一个 L2 正则化项（系数的平方和）。
        *   **公式**: 岭回归的优化目标是最小化：
            \[ \sum_{i=1}^{n} (y_i - (\beta_0 + \sum_{j=1}^{p} \beta_j x_{ij}))^2 + \lambda \sum_{j=1}^{p} \beta_j^2 \]
            其中 \( \lambda \ge 0 \) 是调整正则化强度的超参数。\( \lambda \) 越大，系数 \( \beta_j \) 被压缩得越接近于 0，但不会变为严格的 0。这有助于降低模型复杂度，提高模型的泛化能力。
    *   **Lasso 回归 (`Lasso`) - L1 正则化**
        *   **原理**: 另一种线性回归的正则化形式，与岭回归类似，但它使用的是 L1 正则化项（系数的绝对值之和）。Lasso 的一个重要特性是它能够将某些特征的系数精确地压缩到 0，从而实现特征选择的效果。
        *   **公式**: Lasso 回归的优化目标是最小化：
            \[ \sum_{i=1}^{n} (y_i - (\beta_0 + \sum_{j=1}^{p} \beta_j x_{ij}))^2 + \lambda \sum_{j=1}^{p} |\beta_j| \]
            同样，\( \lambda \ge 0 \) 是正则化强度的超参数。当 \( \lambda \) 足够大时，一些不重要的特征系数会变成 0，使得模型更稀疏、更易于解释。
    *   **随机森林 (`RandomForestRegressor`) - 集成学习（Bagging）**
        *   **原理**: 一种强大的集成学习算法，属于 Bagging（Bootstrap Aggregating）方法的扩展。它构建多个决策树（回归树），并在预测时将所有树的预测结果进行平均。为了增加树之间的差异性（从而降低整体模型的方差），随机森林在两个层面引入了随机性：1. **样本随机**: 对原始训练数据进行有放回的自助采样（Bootstrap Sampling），为每棵树生成不同的训练子集。2. **特征随机**: 在每个决策树节点进行分裂时，不是考虑所有特征，而是随机选择一部分特征进行考察，从中选出最佳分裂特征。
        *   **优点**: 通常具有很高的预测精度，对过拟合不敏感，能够处理高维数据，并且可以评估特征的重要性。
    *   **梯度提升树 (`GradientBoostingRegressor`) - 集成学习（Boosting）**
        *   **原理**: 另一种强大的集成学习算法，属于 Boosting 方法。与随机森林并行构建树不同，梯度提升是串行地、迭代地构建决策树。每一棵新树都是为了拟合前一棵树（或之前所有树组成的模型）的残差（或梯度）。模型通过逐步减小损失函数（如均方误差）来提升性能。它在函数空间中使用梯度下降的思想来优化模型。
        *   **优点**: 预测精度通常非常高，能够处理各种类型的特征。
        *   **缺点**: 对参数设置较为敏感，训练过程相对较慢（因为是串行的）。
    *   **XGBoost (`xgb.XGBRegressor`) - 高效的梯度提升库**
        *   **原理**: 梯度提升算法的高效、可扩展且带正则化的实现。它在标准梯度提升的基础上做了许多优化，包括：1. **正则化**: 在损失函数中加入了 L1 和 L2 正则化项（针对叶子节点的权重），防止过拟合。2. **优化**: 优化了损失函数（使用二阶泰勒展开），并采用了更智能的树分裂策略（如考虑缺失值的处理、近似分位数算法等）。3. **效率**: 支持并行计算（特征级别并行）、缓存优化等，大大提高了训练速度。
        *   **优点**: 性能卓越，速度快，是许多数据科学竞赛中的首选算法之一。
*   **评估指标**: 主要使用以下两个指标来评估模型性能：
    *   **均方根误差 (RMSE - Root Mean Squared Error)**: 衡量预测值与真实值之间的平均差异，值越小越好。计算公式为：
        \[ \text{RMSE} = \sqrt{\frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2} \]
        其中 \( n \) 是样本数量，\( y_i \) 是第 \( i \) 个样本的真实值，\( \hat{y}_i \) 是预测值。
    *   **决定系数 (R² - Coefficient of Determination)**: 表示模型能够解释的目标变量方差的比例，值越接近 1 越好（在线性回归中通常介于 0 和 1 之间）。计算公式为：
        \[ R^2 = 1 - \frac{\sum_{i=1}^{n}(y_i - \hat{y}_i)^2}{\sum_{i=1}^{n}(y_i - \bar{y})^2} = 1 - \frac{\text{RSS}}{\text{TSS}} \]
        其中 \( \bar{y} \) 是目标变量的平均值，RSS 是残差平方和，TSS (Total Sum of Squares) 是总平方和。
*   **交叉验证**: 为了获得对模型泛化能力更可靠的估计，脚本对每个模型在完整的（处理后的）训练数据集上进行了 5 折交叉验证 (`cross_val_score`)。过程是：将训练数据分成 5 个互斥的子集（折），轮流使用其中 4 折作为训练集，剩下 1 折作为验证集，重复 5 次，最后将 5 次的评估结果（如负均方误差）平均，得到交叉验证得分。这有助于评估模型的稳定性和避免因单次训练/验证集划分带来的偶然性。
*   **模型比较**: 脚本计算了每个模型在验证集上的 RMSE 和 R²，并将这些结果打印到终端输出中。同时，生成了一个条形图用于直观比较各模型在验证集上的 RMSE，便于选出表现最佳的模型：
    ![模型性能比较](exp1/output/model_comparison.png)

## 5. 超参数调优与特征重要性 (可能步骤)

根据 `exp1.py` 的函数定义 (`tune_hyperparameters`, `feature_importance`)，脚本很可能包含以下步骤：

*   **超参数调优**: 对于表现最好的模型（例如 XGBoost 或随机森林），可能会使用 `GridSearchCV` 或类似方法，结合交叉验证来寻找最优的超参数组合（如树的数量、深度、学习率等），以进一步提升模型性能。
*   **特征重要性分析**: 对于最终选定的模型（特别是树模型如随机森林、梯度提升树、XGBoost），脚本会提取并可视化特征的重要性得分：
    ![特征重要性](exp1/output/feature_importance.png)
    这有助于理解哪些特征对房价预测贡献最大，为模型解释和未来可能的特征选择提供依据。线性模型的系数也可以用来分析特征影响。

## 6. 预测与结果生成

*   **最终模型训练**: 使用找到的最优超参数（如果进行了调优）在**全部**处理后的训练数据上重新训练选定的最佳模型。
*   **测试集预测**: 使用训练好的最终模型对处理后的测试数据集 (`test_scaled_df`) 进行预测，得到测试集样本的预测房价。
*   **预测效果可视化**: 为了更直观地评估最终模型的预测性能，可以将预测值与真实值（如果在验证集上评估）进行散点图对比：
    ![预测值 vs 真实值](exp1/output/actualpricevspredictedprice.png)
    *分析*：理想情况下，散点图中的点应紧密围绕在对角线（y=x）周围，表明预测值与真实值高度一致。如果点偏离对角线较远，则表示预测误差较大。观察此图可以判断模型在不同价格区间的预测表现，是否存在系统性的高估或低估。
*   **结果提交**: 将对测试集的预测结果保存为 CSV 文件，路径为 `output/submission.csv`，其格式遵循 `data/exp1/sample.csv` 的要求。

## 7. 结论

本实验通过加载、探索波士顿房价数据，进行特征工程和预处理，训练、评估并比较了多种回归模型（包括线性模型和强大的集成模型如 XGBoost），最终目标是生成对测试集房价的准确预测。

通过 EDA 发现了 `RM` 和 `LSTAT` 等关键特征。特征标准化是必要的预处理步骤。模型比较显示，集成模型（如 XGBoost、随机森林、梯度提升树）通常在此类表格数据回归任务上表现优于简单的线性模型。脚本还包含了进行超参数调优和特征重要性分析的功能，以进一步优化模型并理解其预测依据。最终的预测结果被格式化并保存，可用于提交或进一步分析。

整个流程体现了机器学习项目的一个标准工作流，从数据理解到模型部署（预测）。

## 参考文献

[1] Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., ... & Duchesnay, E. (2011). Scikit-learn: Machine learning in Python. *Journal of Machine Learning Research*, 12(Oct), 2825-2830.

[2] Hastie, T., Tibshirani, R., & Friedman, J. (2009). *The Elements of Statistical Learning: Data Mining, Inference, and Prediction*. Springer.

[3] Breiman, L. (2001). Random Forests. *Machine Learning*, 45(1), 5-32.

[4] Friedman, J. H. (2001). Greedy function approximation: A gradient boosting machine. *Annals of Statistics*, 1189-1232.

[5] Chen, T., & Guestrin, C. (2016). XGBoost: A scalable tree boosting system. In *Proceedings of the 22nd acm sigkdd international conference on knowledge discovery and data mining* (pp. 785-794).

[6] Harrison, D., & Rubinfeld, D. L. (1978). Hedonic housing prices and the demand for clean air. *Journal of Environmental Economics and Management*, 5(1), 81-102.

[7] Harris, C. R., Millman, K. J., van der Walt, S. J., Gommers, R., Virtanen, P., Cournapeau, D., ... & Oliphant, T. E. (2020). Array programming with NumPy. *Nature*, 585(7825), 357-362.

[8] McKinney, W. (2010). Data structures for statistical computing in python. In *Proceedings of the 9th Python in Science Conference* (Vol. 445, pp. 51-56).

## 附录

### 附录 A: 模型训练评估流程图

以下流程图展示了本实验中模型训练与评估的主要步骤：

```mermaid
graph TD
    A[开始] --> B(加载预处理后的数据 X, y);
    B --> C{划分训练/验证集};
    C --> D{遍历模型列表 M};
    D -- 对于每个模型 m ---> E(在完整训练数据 X, y 上进行5折交叉验证);
    E --> F[计算交叉验证平均 RMSE_cv];
    D -- 对于每个模型 m ---> G(在训练集 X_train, y_train 上训练模型 m);
    G --> H(在验证集 X_val 上进行预测);
    H --> I[计算验证集 RMSE_val 和 R2_val];
    I --> J{存储评估结果 (RMSE_cv, RMSE_val, R2_val)};
    J --> D;
    D -- 遍历结束 --> K(比较各模型验证集 RMSE_val);
    K --> L[可视化模型比较结果];
    L --> M[结束];

    subgraph 模型列表 M
        direction LR
        M1[线性回归]
        M2[岭回归]
        M3[Lasso]
        M4[随机森林]
        M5[梯度提升]
        M6[XGBoost]
    end
``` 

### 附录 B: exp1/ 目录 Python 文件概述

本附录概述了 `exp1/` 目录下主要 Python 文件的功能、关键函数、核心依赖库，并提供简短的代码片段示例。

*   **`exp1.py` (旧版主脚本 - 可能)**
    *   **主要功能**: 似乎是一个较早版本的实验流程实现，包含了数据加载、探索、特征工程、多种模型（包括线性、集成）训练与评估、超参数调优、预测和特征重要性分析的完整函数定义。可能作为最初的单一脚本实现，后续功能被模块化到其他文件中。
    *   **关键函数**: `main()`, `load_data()`, `explore_data()`, `feature_engineering()`, `train_evaluate_models()`, `tune_hyperparameters()`, `make_predictions()`, `feature_importance()`。
    *   **核心依赖库**: `numpy`, `pandas`, `matplotlib`, `seaborn`, `sklearn` (包括 `model_selection`, `preprocessing`, `linear_model`, `ensemble`, `metrics`), `xgboost`, `os`, `warnings`。
    *   **代码片段示例 (模型评估循环)**:
        ```python
        # 交叉验证和评估每个模型
        for name, model in models.items():
            print(f"\n评估模型: {name}")

            # 交叉验证
            cv_scores = cross_val_score(model, X, y, cv=5, scoring='neg_mean_squared_error')
            rmse_cv = np.sqrt(-cv_scores.mean())

            # 在训练集上训练
            model.fit(X_train, y_train)

            # 在验证集上评估
            y_pred = model.predict(X_val)
            rmse = np.sqrt(mean_squared_error(y_val, y_pred))
            r2 = r2_score(y_val, y_pred)

            print(f"  RMSE (CV): {rmse_cv:.4f}")
            print(f"  RMSE (Validation): {rmse:.4f}")
            print(f"  R² (Validation): {r2:.4f}")

            results[name] = { # ... 存储结果 ... }
        ```

*   **`train_and_predict.py` (当前主脚本)**
    *   **主要功能**: 作为当前项目的主要执行入口，负责编排整个训练和预测流程。它调用 `utils.py` 中的辅助函数进行数据加载和可视化，调用 `models.py` 中的函数进行模型训练和评估，并处理命令行参数以控制执行模式（如快速模式、仅预测模式）。最终保存最佳模型和预测结果。
    *   **关键函数**: `main()`, `load_data()`, `feature_engineering()`, `train_models()`, `predict()`。
    *   **核心依赖库**: `numpy`, `pandas`, `matplotlib`, `seaborn`, `sklearn` (`model_selection`, `preprocessing`), `joblib` (用于模型保存/加载), `os`, `argparse`, 以及自定义模块 `utils` 和 `models`。
    *   **代码片段示例 (主流程调用)**:
        ```python
        def main():
            # ... 参数解析 (argparse) ...

            # 加载数据
            X_train, y_train, X_test = utils.load_data(train_path, test_path)

            # 特征工程
            X_train_processed, X_test_processed = utils.feature_engineering(X_train, X_test)

            # 训练模型 (调用 models 模块)
            trained_models = models.train_all_models(X_train_processed, y_train, fast_mode=args.fast)

            # 评估模型 (调用 models 模块)
            model_metrics = models.evaluate_models(trained_models, X_train_processed, y_train)
            # ... 选出最佳模型 ...

            # 预测
            if not args.train_only:
                predictions = utils.predict(best_model, X_test_processed)
                utils.prepare_submission(predictions)
        ```

*   **`models.py` (模型定义与训练模块)**
    *   **主要功能**: 封装了各种回归模型的训练逻辑，特别是包含了使用 `GridSearchCV` 或 `RandomizedSearchCV` 进行超参数调优的过程。为每种主要模型（如 Ridge, Lasso, RandomForest, GradientBoosting, XGBoost, SVR, ElasticNet 等）提供了单独的训练函数，并有一个 `train_all_models` 函数来统一训练多个模型，以及 `evaluate_models` 来比较评估结果。
    *   **关键函数**: `train_linear_model()`, `train_ridge_model()`, `train_lasso_model()`, `train_elastic_net_model()`, `train_random_forest_model()`, `train_gradient_boosting_model()`, `train_xgboost_model()`, `train_svr_model()`, `train_all_models()`, `evaluate_models()`, `load_model()`。
    *   **核心依赖库**: `numpy`, `pandas`, `sklearn` (包括 `linear_model`, `ensemble`, `svm`, `model_selection`, `metrics`, `pipeline`, `preprocessing`), `xgboost`, `joblib`, `os`。
    *   **代码片段示例 (岭回归与GridSearchCV)**:
        ```python
        def train_ridge_model(X_train, y_train, ..., cv=5):
            print("\n训练岭回归模型...")
            
            # 定义参数网格
            param_grid = {
                'alpha': [0.01, 0.1, 1.0, 10.0, 100.0],
                'solver': ['auto', 'svd', 'cholesky', 'lsqr']
            }
            
            # 创建基础模型
            base_model = Ridge()
            
            # 使用网格搜索进行超参数调优
            grid_search = GridSearchCV(
                base_model, param_grid, cv=cv, 
                scoring='neg_mean_squared_error', 
                n_jobs=-1, verbose=1
            )
            
            # 训练模型
            grid_search.fit(X_train, y_train)
            
            # 获取最佳模型
            best_model = grid_search.best_estimator_
            # ... 后续评估和保存 ...
            return best_model
        ```

*   **`utils.py` (工具函数模块)**
    *   **主要功能**: 提供了项目中常用的辅助函数，主要集中在数据可视化（如绘制特征分布、相关矩阵、散点图、残差图、预测对比图、特征重要性图、学习曲线等）和结果处理（如准备提交文件、计算评估指标）。
    *   **关键函数**: `plot_feature_distributions()`, `plot_correlation_matrix()`, `plot_target_correlation()`, `plot_scatter_matrix()`, `plot_residuals()`, `plot_prediction_vs_actual()`, `plot_feature_importance()`, `plot_learning_curves()`, `plot_model_comparison()`, `evaluate_model()`, `prepare_submission()`。
    *   **核心依赖库**: `numpy`, `pandas`, `matplotlib`, `seaborn`, `sklearn.metrics`, `os`。
    *   **代码片段示例 (绘制相关性矩阵)**:
        ```python
        def plot_correlation_matrix(data, output_path='output/correlation_matrix.png'):
            """绘制相关系数矩阵"""
            plt.figure(figsize=(12, 10))
            corr = data.corr()
            mask = np.triu(np.ones_like(corr, dtype=bool)) # 创建上三角掩码
            sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', 
                        mask=mask, linewidths=0.5)
            plt.title('Correlation Matrix', fontsize=18)
            plt.tight_layout()
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()
        ```

*注意：上述关键函数和核心依赖库信息主要基于对文件开头部分的读取和对文件功能的推测。代码片段为简化示例。* 