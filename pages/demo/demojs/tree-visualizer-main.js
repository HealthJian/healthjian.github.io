/* ============================================================
   Tree & Graph Visualizer — Main Controller
   ============================================================ */
(function () {
    'use strict';

    // ===========================
    //  DOM refs
    // ===========================
    const canvas = document.getElementById('viz-canvas');
    const ctx = canvas.getContext('2d');
    const placeholder = document.getElementById('viz-placeholder');

    const modeTabs = document.querySelectorAll('.mode-tab');
    const algoSelect = document.getElementById('algo-select');
    const sizeSlider = document.getElementById('size-slider');
    const sizeValue = document.getElementById('size-value');
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    const nodeInput = document.getElementById('node-input');
    const btnApply = document.getElementById('btn-apply-input');
    const btnRandom = document.getElementById('btn-random');
    const btnClear = document.getElementById('btn-clear');
    const btnStart = document.getElementById('btn-start');
    const btnPause = document.getElementById('btn-pause');
    const btnStep = document.getElementById('btn-step');
    const btnReset = document.getElementById('btn-reset');

    const statNodes = document.getElementById('stat-nodes');
    const statSteps = document.getElementById('stat-steps');
    const statTime = document.getElementById('stat-time');
    const statStatus = document.getElementById('stat-status');
    const stepText = document.getElementById('step-text');
    const legendPanel = document.getElementById('legend-panel');

    // Conditional controls
    const treeInsertCtrls = document.getElementById('tree-insert-controls');
    const graphStartCtrls = document.getElementById('graph-start-controls');
    const insertParentInput = document.getElementById('insert-parent-input');
    const insertValueInput = document.getElementById('insert-value-input');
    const btnInsertLeft = document.getElementById('btn-insert-left');
    const btnInsertRight = document.getElementById('btn-insert-right');
    const graphStartSelect = document.getElementById('graph-start-select');
    const btnSetStart = document.getElementById('btn-set-start');

    // New controls
    const treeTypeSelect = document.getElementById('tree-type-select');
    const graphTypeSelect = document.getElementById('graph-type-select');
    const treeTypeGroup = document.getElementById('tree-type-group');
    const graphTypeGroup = document.getElementById('graph-type-group');
    const outputBody = document.getElementById('output-body');
    const btnOutputClear = document.getElementById('btn-output-clear');

    // ===========================
    //  State
    // ===========================
    const state = {
        mode: 'tree',           // 'tree' | 'graph'
        treeType: 'bst',        // 'bst' | 'maxheap' | 'minheap'
        graphType: 'undirected', // 'undirected' | 'directed'
        algorithm: 'bfs',
        size: 8,
        speed: 5,
        sorting: false,
        paused: false,
        finished: false,
        startTime: null,
        timerId: null,
        animationId: null,

        // Snapshots buffer (for step mode)
        snapshots: [],
        snapshotIndex: 0,

        // Output lines
        outputLines: [],

        // Current data
        tree: null,
        graph: null,
        generator: null,
    };

    // ===========================
    //  Algorithm descriptions
    // ===========================
    const ALGO_DESCRIPTIONS = {
        tree: {
            bfs:       { zh: '广度优先遍历 - 从根节点开始逐层访问', en: 'BFS — visit nodes level by level' },
            inorder:   { zh: '中序遍历 — 左 → 根 → 右', en: 'Inorder — Left → Root → Right' },
            preorder:  { zh: '前序遍历 — 根 → 左 → 右', en: 'Preorder — Root → Left → Right' },
            postorder: { zh: '后序遍历 — 左 → 右 → 根', en: 'Postorder — Left → Right → Root' },
            dfs:       { zh: '深度优先遍历 (DFS)', en: 'DFS — Depth-first search' },
            bstverify: { zh: '验证二叉排序树性质', en: 'BST property verification' },
            maxheap:   { zh: '大根堆性质验证', en: 'Max-Heap verification' },
            minheap:   { zh: '小根堆性质验证', en: 'Min-Heap verification' },
        },
        graph: {
            bfs:      { zh: '广度优先搜索 — 从起点逐层探索', en: 'BFS — explore level by level' },
            dfs:      { zh: '深度优先搜索 — 沿路径深入探索', en: 'DFS — explore deep along each path' },
            dijkstra: { zh: 'Dijkstra最短路径 — 计算到所有顶点的最短距离', en: 'Dijkstra — shortest paths' },
            topsort:  { zh: '拓扑排序 — 有向无环图的线性排序', en: 'Topological Sort — DAG linear order' },
        },
    };

    // ===========================
    //  Canvas sizing
    // ===========================
    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const w = rect.width;
        const h = canvas.getAttribute('height') ? parseInt(canvas.getAttribute('height')) : 460;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);
        return { width: w, height: h };
    }

    let CANVAS_W = 800;
    let CANVAS_H = 460;

    // ===========================
    //  Data generation
    // ===========================
    function generateTreeValues(count) {
        const values = [];
        const existing = new Set();
        while (values.length < count) {
            const v = Math.floor(Math.random() * 99) + 1;
            if (!existing.has(v)) {
                existing.add(v);
                values.push(v);
            }
        }
        // Random order → complex BST with both left and right branches
        // Fisher-Yates shuffle
        for (let i = values.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [values[i], values[j]] = [values[j], values[i]];
        }
        return values;
    }

    function parseInputValues(str) {
        return str.split(/[,，\s]+/)
            .map(s => parseInt(s.trim(), 10))
            .filter(n => !isNaN(n) && n > 0);
    }

    function generateGraph(vertexCount) {
        const g = new GraphModule.Graph();
        // Create vertices labeled with letters
        const labels = [];
        for (let i = 0; i < vertexCount; i++) {
            labels.push(String.fromCharCode(65 + i));
            g.addVertex(String.fromCharCode(65 + i));
        }
        // Add random edges (ensure connectivity)
        for (let i = 1; i < vertexCount; i++) {
            const from = labels[i];
            const to = labels[Math.floor(Math.random() * i)];
            g.addEdge(from, to);
        }
        // Add some extra random edges
        const extra = Math.min(vertexCount, Math.floor(vertexCount * 0.5));
        for (let e = 0; e < extra; e++) {
            const u = labels[Math.floor(Math.random() * vertexCount)];
            const v = labels[Math.floor(Math.random() * vertexCount)];
            if (u !== v && !g.hasEdge(u, v)) {
                g.addEdge(u, v);
            }
        }
        return g;
    }

    // ===========================
    //  Initialize data
    // ===========================
    function initTree() {
        const values = generateTreeValues(state.size);
        if (state.treeType === 'maxheap') {
            state.tree = new TreeModule.HeapTree(values, true);
        } else if (state.treeType === 'minheap') {
            state.tree = new TreeModule.HeapTree(values, false);
        } else {
            state.tree = new TreeModule.BST(values);
        }
        if (state.tree && state.tree.root) {
            TreeModule.layoutTree(state.tree.root, CANVAS_W, CANVAS_H);
        }
        return state.tree;
    }

    function initGraph() {
        if (state.graphType === 'directed') {
            state.graph = generateDirectedGraph(state.size);
        } else {
            state.graph = generateGraph(state.size);
        }
        GraphModule.layoutGraph(state.graph, CANVAS_W, CANVAS_H);
        return state.graph;
    }

    function generateDirectedGraph(vertexCount) {
        const g = new GraphModule.DirectedGraph();
        const labels = [];
        for (let i = 0; i < vertexCount; i++) {
            labels.push(String.fromCharCode(65 + i));
            g.addVertex(String.fromCharCode(65 + i));
        }
        // Add random directed edges (ensure connectivity)
        for (let i = 1; i < vertexCount; i++) {
            const from = labels[i];
            const to = labels[Math.floor(Math.random() * i)];
            g.addEdge(from, to);
        }
        // Add some extra random edges
        const extra = Math.min(vertexCount, Math.floor(vertexCount * 0.5));
        for (let e = 0; e < extra; e++) {
            const u = labels[Math.floor(Math.random() * vertexCount)];
            const v = labels[Math.floor(Math.random() * vertexCount)];
            if (u !== v && !g.hasEdge(u, v)) {
                // 50% chance one direction, 50% chance both (for directed)
                if (Math.random() < 0.5) {
                    g.addEdge(u, v);
                } else {
                    g.addEdge(v, u);
                }
            }
        }
        return g;
    }

    // ===========================
    //  Rendering
    // ===========================
    function render() {
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        placeholder.classList.add('hidden');

        if (state.snapshots.length === 0) {
            // Render initial state
            if (state.mode === 'tree' && state.tree) {
                renderTree(state.tree.root);
            } else if (state.mode === 'graph' && state.graph) {
                renderGraph(state.graph);
            } else {
                placeholder.classList.remove('hidden');
            }
            return;
        }

        const snap = state.snapshots[state.snapshotIndex] || state.snapshots[0];
        if (state.mode === 'tree') {
            renderTreeFromSnapshot(snap);
        } else {
            renderGraphFromSnapshot(snap);
        }
    }

    // ===========================
    //  Tree rendering
    // ===========================
    const NODE_RADIUS = 22;
    const SPRING_REST_LEN = 60;

    function renderTreeFromSnapshot(snap) {
        if (!snap.nodeStates || snap.nodeStates.length === 0) return;
        const states = snap.nodeStates;

        // Build position map from snapshot (all coordinates frozen in time)
        const posMap = new Map();
        for (const s of states) {
            posMap.set(s.value, { x: s.x, y: s.y, state: s.state, parent: s.parent, isLeft: s.isLeft });
        }

        // Draw edges using snapshot parent/child relationships
        for (const s of states) {
            if (s.parent == null) continue;
            const parentPos = posMap.get(s.parent);
            if (!parentPos) continue;
            ctx.beginPath();
            ctx.moveTo(parentPos.x, parentPos.y);
            ctx.lineTo(s.x, s.y);
            ctx.strokeStyle = 'rgba(148,163,184,0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw L/R label midpoint of edge
            const mx = (parentPos.x + s.x) / 2;
            const my = (parentPos.y + s.y) / 2;
            const label = s.isLeft ? 'L' : 'R';
            ctx.fillStyle = 'rgba(100,116,139,0.9)';
            ctx.font = 'bold 10px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.beginPath();
            ctx.arc(mx, my, 8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.fill();
            ctx.fillStyle = 'rgba(71,85,105,0.9)';
            ctx.fillText(label, mx, my);
        }

        // Draw nodes
        for (const s of states) {
            drawTreeNode(s.x, s.y, s.value, s.state);
        }
    }

    function drawEdgesFromPositions(states) {
        // We can't recreate edges from flat state array. Use the tree root if available.
        if (state.tree && state.tree.root) {
            drawEdgesRecursive(state.tree.root);
        }
    }

    function drawEdgesRecursive(node) {
        if (!node) return;
        if (node.left) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(node.left.x, node.left.y);
            ctx.strokeStyle = 'rgba(148,163,184,0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
            drawEdgesRecursive(node.left);
        }
        if (node.right) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(node.right.x, node.right.y);
            ctx.strokeStyle = 'rgba(148,163,184,0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
            drawEdgesRecursive(node.right);
        }
    }

    function drawTreeNode(x, y, value, state_cls) {
        const colors = {
            'tree-default': { bg: '#94a3b8', text: '#fff' },
            'tree-visiting': { bg: '#f59e0b', text: '#fff' },
            'tree-visited': { bg: '#10b981', text: '#fff' },
        };
        const c = colors[state_cls] || colors['tree-default'];

        // Shadow
        ctx.beginPath();
        ctx.arc(x, y + 2, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fill();

        // Circle
        ctx.beginPath();
        ctx.arc(x, y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = c.bg;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glow for visiting
        if (state_cls === 'tree-visiting') {
            ctx.beginPath();
            ctx.arc(x, y, NODE_RADIUS + 4, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(245,158,11,0.3)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Text
        ctx.fillStyle = c.text;
        ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(value, x, y);
    }

    function renderTree(root) {
        if (!root) {
            placeholder.classList.remove('hidden');
            return;
        }
        drawEdgesRecursive(root);
        function drawAll(node) {
            if (!node) return;
            drawTreeNode(node.x, node.y, node.value, TreeModule.TREE_STATE.DEFAULT);
            drawAll(node.left);
            drawAll(node.right);
        }
        drawAll(root);
    }

    // ===========================
    //  Graph rendering
    // ===========================
    function renderGraphFromSnapshot(snap) {
        const positions = snap.positions;
        const vertexStates = snap.vertexStates;
        const edgeStates = snap.edgeStates;
        const isDirected = snap.isDirected || false;
        if (!positions) return;

        // Draw edges FIRST (below nodes)
        const adjList = snap.adjList;
        if (adjList) {
            for (const [u, neighbors] of adjList) {
                const pu = positions.get(u);
                if (!pu) continue;
                for (const v of neighbors) {
                    const pv = positions.get(v);
                    if (!pv) continue;
                    const key = isDirected ? `${u}->${v}` : (u < v ? `${u}-${v}` : `${v}-${u}`);
                    const edgeState = edgeStates ? (edgeStates.get(key) || 'default') : 'default';

                    ctx.beginPath();
                    ctx.moveTo(pu.x, pu.y);
                    ctx.lineTo(pv.x, pv.y);
                    ctx.lineWidth = edgeState === 'graph-path' ? 3 : 2;
                    ctx.strokeStyle = edgeState === 'graph-discovered' ? '#f59e0b' :
                                      edgeState === 'graph-path' ? '#007AFF' : 'rgba(148,163,184,0.5)';
                    ctx.stroke();

                    // Draw arrowhead for directed graphs
                    if (isDirected) {
                        drawArrowhead(pu.x, pu.y, pv.x, pv.y, ctx.strokeStyle);
                    }
                }
            }
        }

        // Draw vertices SECOND (on top of edges)
        if (vertexStates) {
            for (const [v, pos] of positions) {
                const vs = vertexStates.get(v) || 'graph-unvisited';
                drawGraphVertex(pos.x, pos.y, v, vs);
            }
        }
    }

    function drawArrowhead(fromX, fromY, toX, toY, color) {
        const headLen = 10;
        const headAngle = Math.PI / 7;
        const angle = Math.atan2(toY - fromY, toX - fromX);
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLen * Math.cos(angle - headAngle), toY - headLen * Math.sin(angle - headAngle));
        ctx.lineTo(toX - headLen * Math.cos(angle + headAngle), toY - headLen * Math.sin(angle + headAngle));
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }

    function drawGraphVertex(x, y, label, state_cls) {
        const colors = {
            'graph-unvisited':  { bg: '#94a3b8', text: '#fff' },
            'graph-discovered': { bg: '#f59e0b', text: '#fff' },
            'graph-processed':  { bg: '#10b981', text: '#fff' },
            'graph-path':       { bg: '#007AFF', text: '#fff' },
        };
        const c = colors[state_cls] || colors['graph-unvisited'];
        const r = NODE_RADIUS;

        // Shadow
        ctx.beginPath();
        ctx.arc(x, y + 2, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fill();

        // Circle
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = c.bg;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glow
        if (state_cls === 'graph-discovered' || state_cls === 'graph-path') {
            ctx.beginPath();
            ctx.arc(x, y, r + 4, 0, Math.PI * 2);
            ctx.strokeStyle = state_cls === 'graph-discovered' ? 'rgba(245,158,11,0.3)' : 'rgba(0,122,255,0.3)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Label
        ctx.fillStyle = c.text;
        ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x, y);
    }

    function renderGraph(g) {
        if (!g || g.vertexCount === 0) {
            placeholder.classList.remove('hidden');
            return;
        }
        const positions = g.positions;
        const isDirected = g.isDirected || false;
        // Draw edges FIRST
        for (const [u, neighbors] of g.adj) {
            const pu = positions.get(u);
            if (!pu) continue;
            for (const v of neighbors) {
                const pv = positions.get(v);
                if (!pv) continue;
                ctx.beginPath();
                ctx.moveTo(pu.x, pu.y);
                ctx.lineTo(pv.x, pv.y);
                ctx.strokeStyle = 'rgba(148,163,184,0.5)';
                ctx.lineWidth = 2;
                ctx.stroke();
                if (isDirected) {
                    drawArrowhead(pu.x, pu.y, pv.x, pv.y, 'rgba(148,163,184,0.5)');
                }
            }
        }
        // Draw vertices SECOND
        for (const v of g.getVertices()) {
            const pos = positions.get(v);
            if (pos) drawGraphVertex(pos.x, pos.y, v, 'graph-unvisited');
        }
    }

    // ===========================
    //  Speed delay calculation
    // ===========================
    function getDelayForSpeed(speed) {
        const base = 300;
        const min = 10;
        const factor = (speed - 1) / 9;
        return Math.round(base - (base - min) * factor);
    }

    // ===========================
    //  Update legend
    // ===========================
    function updateLegend() {
        let html = '';
        if (state.mode === 'tree') {
            html = `
                <span class="legend-item"><span class="legend-color legend-tree-default"></span> <span data-en="Unvisited" data-zh="未访问">未访问</span></span>
                <span class="legend-item"><span class="legend-color legend-tree-visiting"></span> <span data-en="Visiting" data-zh="正在访问">正在访问</span></span>
                <span class="legend-item"><span class="legend-color legend-tree-visited"></span> <span data-en="Visited" data-zh="已访问">已访问</span></span>
            `;
        } else {
            html = `
                <span class="legend-item"><span class="legend-color legend-graph-unvisited"></span> <span data-en="Unvisited" data-zh="未访问">未访问</span></span>
                <span class="legend-item"><span class="legend-color legend-graph-discovered"></span> <span data-en="Discovered" data-zh="已发现">已发现</span></span>
                <span class="legend-item"><span class="legend-color legend-graph-processed"></span> <span data-en="Processed" data-zh="已处理">已处理</span></span>
                <span class="legend-item"><span class="legend-color legend-graph-path"></span> <span data-en="Path" data-zh="路径">路径</span></span>
            `;
        }
        legendPanel.innerHTML = html;
    }

    // ===========================
    //  Status & Step text
    // ===========================
    function setStatus(key) {
        const msgs = {
            ready:     { zh: '就绪', en: 'Ready' },
            running:   { zh: '运行中...', en: 'Running...' },
            paused:    { zh: '已暂停', en: 'Paused' },
            completed: { zh: '已完成 ✓', en: 'Completed ✓' },
        };
        const lang = getLang();
        const msg = msgs[key] || msgs.ready;
        statStatus.textContent = msg[lang] || msg.zh;
        statStatus.className = 'stat-value status-' + key;
    }

    function updateStats() {
        const snap = state.snapshots[state.snapshotIndex];
        if (!snap) return;
        if (state.mode === 'tree') {
            statNodes.textContent = state.tree ? state.tree.nodeCount : 0;
        } else {
            statNodes.textContent = state.graph ? state.graph.vertexCount : 0;
        }
        statSteps.textContent = state.snapshotIndex;
    }

    function updateStepText(text) {
        stepText.textContent = text;
    }

    // ===========================
    //  Output Panel
    // ===========================
    function addOutputLine(step, message) {
        state.outputLines.push({ step, message });
        renderOutput();
    }

    function clearOutput() {
        state.outputLines = [];
        renderOutput();
    }

    function renderOutput() {
        if (!outputBody) return;
        if (state.outputLines.length === 0) {
            outputBody.innerHTML = '<div class="output-placeholder" data-en="Algorithm output will appear here..." data-zh="算法输出将显示在此处...">算法输出将显示在此处...</div>';
            return;
        }
        const lang = getLang();
        let html = '';
        // Show last 30 lines max
        const lines = state.outputLines.slice(-30);
        for (const line of lines) {
            const highlight = line.message.startsWith('✓') || line.message.startsWith('✗');
            html += `<div class="output-line${highlight ? ' output-highlight' : ''}"><span class="output-step">#${line.step}</span><span class="output-msg">${line.message}</span></div>`;
        }
        outputBody.innerHTML = html;
        outputBody.scrollTop = outputBody.scrollHeight;
    }

    // ===========================
    //  Animation engine
    // ===========================
    function startAnimation() {
        updateLegend();

        // Clear output
        clearOutput();

        // Build generator
        let gen;
        if (state.mode === 'tree') {
            const algo = TreeModule.TREE_ALGORITHMS[state.algorithm];
            if (!algo || !state.tree || !state.tree.root) return;
            gen = algo.gen(state.tree.root);
        } else {
            const algo = GraphModule.GRAPH_ALGORITHMS[state.algorithm];
            if (!algo || !state.graph || state.graph.vertexCount === 0) return;
            const startV = graphStartSelect && graphStartSelect.value ? graphStartSelect.value : state.graph.getVertices()[0];
            gen = algo.gen(state.graph, startV);
        }

        // Collect all snapshots
        state.snapshots = [];
        state.snapshotIndex = 0;
        for (const snap of gen) {
            state.snapshots.push(snap);
        }

        if (state.snapshots.length === 0) return;

        state.sorting = true;
        state.paused = false;
        state.finished = false;
        state.startTime = performance.now();

        setStatus('running');
        btnStart.style.display = 'none';
        btnPause.style.display = 'inline-flex';
        btnPause.innerHTML = '<i class="fas fa-pause"></i> <span>' + (getLang() === 'en' ? 'Pause' : '暂停') + '</span>';
        btnStep.disabled = true;
        sizeSlider.disabled = true;
        nodeInput.disabled = true;
        btnApply.disabled = true;
        btnRandom.disabled = true;
        btnClear.disabled = true;
        algoSelect.disabled = true;
        modeTabs.forEach(t => t.style.pointerEvents = 'none');
        if (treeTypeSelect) treeTypeSelect.disabled = true;
        if (graphTypeSelect) graphTypeSelect.disabled = true;

        renderSnapshot(0);
        startTimer();

        state.animationId = requestAnimationFrame(playLoop);
    }

    function playLoop() {
        const delay = getDelayForSpeed(state.speed);

        if (!state.paused && state.snapshotIndex < state.snapshots.length - 1) {
            state.snapshotIndex++;
            renderSnapshot(state.snapshotIndex);
        }

        if (state.snapshotIndex >= state.snapshots.length - 1) {
            finishAnimation();
            return;
        }

        state.animationId = setTimeout(() => {
            requestAnimationFrame(playLoop);
        }, delay);
    }

    function renderSnapshot(index) {
        const snap = state.snapshots[index];
        if (!snap) return;
        state.snapshotIndex = index;

        if (state.mode === 'tree') {
            renderTreeFromSnapshot(snap);
        } else {
            renderGraphFromSnapshot(snap);
        }

        updateStats();

        if (snap.description) {
            updateStepText(snap.description);
            addOutputLine(index, snap.description);
        }
    }

    function finishAnimation() {
        state.sorting = false;
        state.finished = true;
        state.paused = false;
        stopTimer();

        setStatus('completed');

        btnStart.style.display = 'inline-flex';
        btnStart.innerHTML = '<i class="fas fa-check"></i> <span>' + (getLang() === 'en' ? 'Completed' : '已完成') + '</span>';
        btnStart.disabled = true;
        btnPause.style.display = 'none';
        btnStep.disabled = false;
        sizeSlider.disabled = false;
        nodeInput.disabled = false;
        btnApply.disabled = false;
        btnRandom.disabled = false;
        btnClear.disabled = false;
        algoSelect.disabled = false;
        modeTabs.forEach(t => t.style.pointerEvents = 'auto');
        if (treeTypeSelect) treeTypeSelect.disabled = false;
        if (graphTypeSelect) graphTypeSelect.disabled = false;
    }

    function pauseAnimation() {
        state.paused = true;
        btnPause.innerHTML = '<i class="fas fa-play"></i> <span>' + (getLang() === 'en' ? 'Resume' : '继续') + '</span>';
        setStatus('paused');
    }

    function resumeAnimation() {
        state.paused = false;
        btnPause.innerHTML = '<i class="fas fa-pause"></i> <span>' + (getLang() === 'en' ? 'Pause' : '暂停') + '</span>';
        setStatus('running');
    }

    function stopAnimation() {
        if (state.animationId) {
            clearTimeout(state.animationId);
            state.animationId = null;
        }
        state.sorting = false;
        state.paused = false;
        stopTimer();
    }

    function stepForward() {
        if (state.sorting) return;
        if (state.snapshots.length === 0) {
            startAnimation();
            // Auto-pause after precomputing
            state.paused = true;
            btnPause.innerHTML = '<i class="fas fa-play"></i> <span>' + (getLang() === 'en' ? 'Resume' : '继续') + '</span>';
            setStatus('paused');
            stopAnimation();
            return;
        }
        if (state.snapshotIndex < state.snapshots.length - 1) {
            state.snapshotIndex++;
            renderSnapshot(state.snapshotIndex);
        }
    }

    // ===========================
    //  Timer
    // ===========================
    function startTimer() {
        if (state.timerId) clearInterval(state.timerId);
        state.timerId = setInterval(() => {
            if (state.paused) return;
            const elapsed = (performance.now() - state.startTime) / 1000;
            statTime.textContent = formatTime(elapsed);
        }, 100);
    }

    function stopTimer() {
        if (state.timerId) {
            clearInterval(state.timerId);
            state.timerId = null;
        }
        if (state.startTime) {
            const elapsed = (performance.now() - state.startTime) / 1000;
            statTime.textContent = formatTime(elapsed);
        }
    }

    function formatTime(sec) {
        if (sec < 60) return sec.toFixed(3) + 's';
        const min = Math.floor(sec / 60);
        sec = sec % 60;
        return min + 'm ' + sec.toFixed(1) + 's';
    }

    // ===========================
    //  Reset
    // ===========================
    function resetAll(regenerate = true) {
        stopAnimation();
        state.snapshots = [];
        state.snapshotIndex = 0;
        state.finished = false;
        state.outputLines = [];

        if (regenerate) {
            if (state.mode === 'tree') {
                initTree();
            } else {
                initGraph();
                GraphModule.layoutGraph(state.graph, CANVAS_W, CANVAS_H);
                populateGraphStartSelect();
            }
        }

        statTime.textContent = '0.000s';
        statSteps.textContent = '0';
        setStatus('ready');
        updateStepText(getLang() === 'en' ? 'Adjust parameters and click Start to begin' : '调整参数后点击「开始」查看算法运行');
        renderOutput();

        btnStart.style.display = 'inline-flex';
        btnStart.innerHTML = '<i class="fas fa-play"></i> <span>' + (getLang() === 'en' ? 'Start' : '开始') + '</span>';
        btnStart.disabled = false;
        btnPause.style.display = 'none';
        btnStep.disabled = false;
        sizeSlider.disabled = false;
        nodeInput.disabled = false;
        btnApply.disabled = false;
        btnRandom.disabled = false;
        btnClear.disabled = false;
        algoSelect.disabled = false;
        modeTabs.forEach(t => t.style.pointerEvents = 'auto');
        if (treeTypeSelect) treeTypeSelect.disabled = false;
        if (graphTypeSelect) graphTypeSelect.disabled = false;

        render();
    }

    // ===========================
    //  Mode switching
    // ===========================
    function switchMode(mode) {
        if (state.sorting) return;
        state.mode = mode;

        // Update tabs
        modeTabs.forEach(t => {
            t.classList.toggle('active', t.dataset.mode === mode);
        });

        // Show/hide mode-specific controls
        const isTree = mode === 'tree';
        const isHeap = state.treeType === 'maxheap' || state.treeType === 'minheap';
        if (treeInsertCtrls) treeInsertCtrls.classList.toggle('hidden', !isTree || isHeap);
        if (graphStartCtrls) graphStartCtrls.classList.toggle('hidden', isTree);
        if (treeTypeGroup) treeTypeGroup.classList.toggle('hidden', !isTree);
        if (graphTypeGroup) graphTypeGroup.classList.toggle('hidden', isTree);

        // Update algorithm options
        updateAlgoOptions();

        // Reset
        resetAll(true);
    }

    function updateAlgoOptions() {
        let algos;
        if (state.mode === 'tree') {
            algos = TreeModule.TREE_ALGORITHMS;
            // Filter heap algorithms if in BST mode, and vice versa
            const isHeap = state.treeType === 'maxheap' || state.treeType === 'minheap';
            if (!isHeap) {
                // BST mode: hide heap verifiers
                const filtered = {};
                for (const [key, val] of Object.entries(algos)) {
                    if (key !== 'maxheap' && key !== 'minheap') filtered[key] = val;
                }
                algos = filtered;
            } else {
                // Heap mode: only show heap verifiers + DFS/BFS
                const filtered = {};
                for (const [key, val] of Object.entries(algos)) {
                    if (key === 'maxheap' || key === 'minheap' || key === 'bfs' || key === 'dfs') filtered[key] = val;
                }
                algos = filtered;
            }
        } else {
            algos = GraphModule.GRAPH_ALGORITHMS;
            // Filter topological sort for directed graphs only
            const isDirected = state.graphType === 'directed';
            if (!isDirected) {
                const filtered = {};
                for (const [key, val] of Object.entries(algos)) {
                    if (key !== 'topsort') filtered[key] = val;
                }
                algos = filtered;
            }
        }
        algoSelect.innerHTML = '';
        for (const [key, algo] of Object.entries(algos)) {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = getLang() === 'en' ? algo.name.en : algo.name.zh;
            algoSelect.appendChild(opt);
        }
        state.algorithm = algoSelect.options.length > 0 ? algoSelect.options[0].value : Object.keys(algos)[0];
        algoSelect.value = state.algorithm;
        updateAlgorithmDescription();
    }

    function updateAlgorithmDescription() {
        const descs = ALGO_DESCRIPTIONS[state.mode];
        if (!descs) return;
        const desc = descs[state.algorithm];
        if (desc) {
            stepText.textContent = getLang() === 'en' ? desc.en : desc.zh;
        }
    }

    // ===========================
    //  Apply custom input
    // ===========================
    function applyInput() {
        const raw = nodeInput.value.trim();
        if (!raw) return;
        const values = parseInputValues(raw);
        if (values.length < 2) {
            updateStepText(getLang() === 'en' ? 'Need at least 2 values' : '至少需要2个值');
            return;
        }
        state.size = values.length;
        sizeSlider.value = state.size;
        sizeValue.textContent = state.size;
        // Apply custom values directly based on tree type
        if (state.mode === 'tree') {
            if (state.treeType === 'maxheap') {
                state.tree = new TreeModule.HeapTree(values, true);
                TreeModule.layoutTree(state.tree.root, CANVAS_W, CANVAS_H);
            } else if (state.treeType === 'minheap') {
                state.tree = new TreeModule.HeapTree(values, false);
                TreeModule.layoutTree(state.tree.root, CANVAS_W, CANVAS_H);
            } else {
                state.tree = new TreeModule.BST(values);
                TreeModule.layoutTree(state.tree.root, CANVAS_W, CANVAS_H);
            }
            resetAll(false);
        } else {
            resetAll(true);
        }
    }

    function randomGenerate() {
        nodeInput.value = '';
        resetAll(true);
        // Graph: re-populate start vertex select with new vertices
        if (state.mode === 'graph') populateGraphStartSelect();
    }

    function populateGraphStartSelect() {
        if (!graphStartSelect || !state.graph) return;
        graphStartSelect.innerHTML = '';
        const vertices = state.graph.getVertices();
        if (vertices.length === 0) return;
        vertices.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v;
            opt.textContent = v;
            graphStartSelect.appendChild(opt);
        });
        // Default to the smallest vertex (alphabetically / numerically)
        graphStartSelect.value = vertices[0];
    }

    function clearAll() {
        nodeInput.value = '';
        if (state.mode === 'tree') {
            if (state.treeType === 'maxheap' || state.treeType === 'minheap') {
                state.tree = new TreeModule.HeapTree([]);
            } else {
                state.tree = new TreeModule.BST([]);
            }
        } else {
            if (state.graphType === 'directed') {
                state.graph = new GraphModule.DirectedGraph();
            } else {
                state.graph = new GraphModule.Graph();
            }
        }
        resetAll(false);
    }

    // ===========================
    //  Tree insert (left/right child)
    // ===========================
    function applyTreeInsert(side) {
        if (state.sorting || !state.tree || !state.tree.root) return;
        const parentVal = parseInt(insertParentInput.value.trim(), 10);
        const childVal = parseInt(insertValueInput.value.trim(), 10);
        if (isNaN(parentVal) || isNaN(childVal)) {
            stepText.textContent = getLang() === 'en' ? 'Enter valid parent and child values' : '请输入有效的父节点和新节点值';
            return;
        }
        if (parentVal === childVal) {
            stepText.textContent = getLang() === 'en' ? 'Child value must differ from parent' : '新节点值不能与父节点相同';
            return;
        }
        // Check parent exists
        const parentNode = state.tree.find(parentVal);
        if (!parentNode) {
            stepText.textContent = getLang() === 'en' ? `Parent value ${parentVal} not found` : `未找到父节点 ${parentVal}`;
            return;
        }
        // Check child doesn't already exist
        if (state.tree.find(childVal)) {
            stepText.textContent = getLang() === 'en' ? `Value ${childVal} already exists` : `节点值 ${childVal} 已存在`;
            return;
        }
        // Insert
        let success = false;
        if (side === 'left') {
            success = state.tree.insertLeft(parentVal, childVal);
        } else {
            success = state.tree.insertRight(parentVal, childVal);
        }
        if (!success) {
            stepText.textContent = getLang() === 'en' ? `Cannot insert ${side} child — slot occupied` : `无法插入${side === 'left' ? '左' : '右'}孩子 — 位置已占用`;
            return;
        }
        TreeModule.layoutTree(state.tree.root, CANVAS_W, CANVAS_H);
        // Clear inputs
        insertParentInput.value = '';
        insertValueInput.value = '';
        stepText.textContent = getLang() === 'en' ? `Inserted ${childVal} as ${side} child of ${parentVal}` : `已插入 ${childVal} 为 ${parentVal} 的${side === 'left' ? '左' : '右'}孩子`;
        render();
    }

    function setGraphStartVertex() {
        if (state.sorting || !graphStartSelect) return;
        const v = graphStartSelect.value;
        if (!v) return;
        stepText.textContent = getLang() === 'en' ? `Start vertex set to ${v}` : `起始顶点设为 ${v}`;
        // Re-render graph with highlight on the selected start vertex
        if (state.graph && !state.sorting) {
            // Reset all vertex states
            const verts = state.graph.getVertices();
            verts.forEach(u => state.graph.vertexStates.set(u, 'graph-unvisited'));
            // Highlight the selected start vertex
            state.graph.vertexStates.set(v, 'graph-discovered');
            render();
        }
    }

    // ===========================
    //  Event bindings
    // ===========================
    function init() {
        // Canvas resize
        const dims = resizeCanvas();
        CANVAS_W = dims.width;
        CANVAS_H = dims.height;

        // Mode tabs
        modeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                switchMode(tab.dataset.mode);
            });
        });

        // Algorithm select
        algoSelect.addEventListener('change', () => {
            if (state.sorting) return;
            state.algorithm = algoSelect.value;
            updateAlgorithmDescription();
            resetAll(false);
        });

        // Size slider
        sizeSlider.addEventListener('input', () => {
            state.size = parseInt(sizeSlider.value, 10);
            sizeValue.textContent = state.size;
        });
        sizeSlider.addEventListener('change', () => {
            if (!state.sorting) resetAll(true);
        });

        // Speed slider
        speedSlider.addEventListener('input', () => {
            state.speed = parseInt(speedSlider.value, 10);
            speedValue.textContent = state.speed;
        });

        // Input
        btnApply.addEventListener('click', applyInput);
        nodeInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') applyInput();
        });
        btnRandom.addEventListener('click', randomGenerate);
        btnClear.addEventListener('click', clearAll);

        // Buttons
        btnStart.addEventListener('click', startAnimation);
        btnPause.addEventListener('click', () => {
            if (state.paused) {
                resumeAnimation();
            } else {
                pauseAnimation();
            }
        });
        btnStep.addEventListener('click', stepForward);
        btnReset.addEventListener('click', () => resetAll(true));

        // Tree insert controls
        btnInsertLeft.addEventListener('click', () => applyTreeInsert('left'));
        btnInsertRight.addEventListener('click', () => applyTreeInsert('right'));
        insertParentInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') insertValueInput.focus();
        });
        insertValueInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') applyTreeInsert('left');
        });

        // Graph start vertex
        btnSetStart.addEventListener('click', setGraphStartVertex);

        // Tree type select
        if (treeTypeSelect) {
            treeTypeSelect.addEventListener('change', () => {
                if (state.sorting) return;
                state.treeType = treeTypeSelect.value;
                const isHeap = state.treeType === 'maxheap' || state.treeType === 'minheap';
                if (treeInsertCtrls) treeInsertCtrls.classList.toggle('hidden', isHeap || state.mode !== 'tree');
                if (state.mode === 'tree') {
                    updateAlgoOptions();
                    resetAll(true);
                }
            });
        }

        // Graph type select
        if (graphTypeSelect) {
            graphTypeSelect.addEventListener('change', () => {
                if (state.sorting) return;
                state.graphType = graphTypeSelect.value;
                if (state.mode === 'graph') {
                    updateAlgoOptions();
                    resetAll(true);
                }
            });
        }

        // Output clear
        if (btnOutputClear) {
            btnOutputClear.addEventListener('click', clearOutput);
        }

        // Window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const dims = resizeCanvas();
                CANVAS_W = dims.width;
                CANVAS_H = dims.height;
                if (!state.sorting) resetAll(false);
            }, 200);
        });

        // Init
        updateAlgoOptions();
        updateLegend();

        // Initial mode-specific control visibility
        if (treeInsertCtrls) treeInsertCtrls.classList.remove('hidden');
        if (graphStartCtrls) graphStartCtrls.classList.add('hidden');
        if (treeTypeGroup) treeTypeGroup.classList.remove('hidden');
        if (graphTypeGroup) graphTypeGroup.classList.add('hidden');

        // Set initial type select values
        if (treeTypeSelect) treeTypeSelect.value = state.treeType;
        if (graphTypeSelect) graphTypeSelect.value = state.graphType;

        resetAll(true);
    }

    // ===========================
    //  i18n helper (from language.js)
    // ===========================
    function getLang() {
        return window.__lang || document.documentElement.lang || 'zh';
    }

    // ===========================
    //  Start
    // ===========================
    document.addEventListener('DOMContentLoaded', init);

})();
