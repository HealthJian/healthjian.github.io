/* ============================================================
   Tree Visualizer — Undirected Graph Module
   ============================================================ */
(function () {
    'use strict';

    // ===========================
    //  Vertex States
    // ===========================
    const GRAPH_STATE = {
        UNVISITED:  'graph-unvisited',
        DISCOVERED: 'graph-discovered',
        PROCESSED:  'graph-processed',
        PATH:       'graph-path',
    };

    // ===========================
    //  Graph (Undirected, Adjacency List)
    // ===========================
    class Graph {
        constructor() {
            this.adj = new Map();  // vertex -> Set of neighbors
            this.vertexCount = 0;
            this.edgeCount = 0;
            // Layout coordinates (set during layout)
            this.positions = new Map(); // vertex -> {x, y}
            this.vertexStates = new Map(); // vertex -> state
            this.edgeStates = new Map();   // "u-v" -> state
        }

        addVertex(v) {
            if (this.adj.has(v)) return false;
            this.adj.set(v, new Set());
            this.vertexCount++;
            this.vertexStates.set(v, GRAPH_STATE.UNVISITED);
            return true;
        }

        removeVertex(v) {
            if (!this.adj.has(v)) return false;
            // Remove all edges to this vertex
            for (const neighbor of this.adj.get(v)) {
                this.adj.get(neighbor).delete(v);
                this.edgeCount--;
                this.edgeStates.delete(this._edgeKey(v, neighbor));
            }
            this.adj.delete(v);
            this.vertexCount--;
            this.vertexStates.delete(v);
            this.positions.delete(v);
            return true;
        }

        addEdge(u, v) {
            if (!this.adj.has(u) || !this.adj.has(v)) return false;
            if (u === v) return false;
            if (this.adj.get(u).has(v)) return false;
            this.adj.get(u).add(v);
            this.adj.get(v).add(u);
            this.edgeCount++;
            this.edgeStates.set(this._edgeKey(u, v), 'default');
            return true;
        }

        removeEdge(u, v) {
            if (!this.adj.has(u) || !this.adj.has(v)) return false;
            if (!this.adj.get(u).has(v)) return false;
            this.adj.get(u).delete(v);
            this.adj.get(v).delete(u);
            this.edgeCount--;
            this.edgeStates.delete(this._edgeKey(u, v));
            return true;
        }

        getNeighbors(v) {
            return this.adj.has(v) ? [...this.adj.get(v)] : [];
        }

        getVertices() {
            return [...this.adj.keys()];
        }

        hasVertex(v) {
            return this.adj.has(v);
        }

        hasEdge(u, v) {
            return this.adj.has(u) && this.adj.get(u).has(v);
        }

        _edgeKey(u, v) {
            return u < v ? `${u}-${v}` : `${v}-${u}`;
        }

        clearAll() {
            this.adj.clear();
            this.positions.clear();
            this.vertexStates.clear();
            this.edgeStates.clear();
            this.vertexCount = 0;
            this.edgeCount = 0;
        }

        // Create from array of edges [[u,v], ...]
        static fromEdges(vertices, edges) {
            const g = new Graph();
            for (const v of vertices) g.addVertex(v);
            for (const [u, v] of edges) g.addEdge(u, v);
            return g;
        }
    }

    // ===========================
    //  Directed Graph (extends Graph)
    // ===========================
    class DirectedGraph extends Graph {
        constructor() {
            super();
            this.isDirected = true;
        }

        addEdge(u, v) {
            if (!this.adj.has(u) || !this.adj.has(v)) return false;
            if (u === v) return false;
            if (this.adj.get(u).has(v)) return false;
            this.adj.get(u).add(v);  // Only one direction
            this.edgeCount++;
            this.edgeStates.set(`${u}->${v}`, 'default');
            return true;
        }

        removeEdge(u, v) {
            if (!this.adj.has(u) || !this.adj.has(v)) return false;
            if (!this.adj.get(u).has(v)) return false;
            this.adj.get(u).delete(v);
            this.edgeCount--;
            this.edgeStates.delete(`${u}->${v}`);
            return true;
        }

        hasEdge(u, v) {
            return this.adj.has(u) && this.adj.get(u).has(v);
        }

        _edgeKey(u, v) {
            return `${u}->${v}`;  // Direction-sensitive key
        }

        reverseGraph() {
            const rg = new DirectedGraph();
            for (const v of this.getVertices()) rg.addVertex(v);
            for (const [u, neighbors] of this.adj) {
                for (const v of neighbors) {
                    rg.addEdge(v, u);  // reverse direction
                }
            }
            return rg;
        }
    }

    // ===========================
    //  Graph Layout — force-directed (simple spring)
    // ===========================
    function layoutGraph(graph, canvasWidth, canvasHeight) {
        const vertices = graph.getVertices();
        const n = vertices.length;
        if (n === 0) return;

        const padding = 50;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const radius = Math.min(canvasWidth, canvasHeight) / 2 - padding;

        // Initialize positions in a circle
        for (let i = 0; i < n; i++) {
            const angle = (2 * Math.PI * i) / n - Math.PI / 2;
            const v = vertices[i];
            if (!graph.positions.has(v)) {
                graph.positions.set(v, {
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle),
                });
            }
        }

        // Simple force-directed refinement
        const iterations = 50;
        const repulsion = 5000;
        const attraction = 0.01;

        for (let iter = 0; iter < iterations; iter++) {
            const forces = new Map();
            for (const v of vertices) {
                forces.set(v, { fx: 0, fy: 0 });
            }
            const pos = graph.positions;

            // Repulsion between all pairs
            for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                    const a = vertices[i], b = vertices[j];
                    const pa = pos.get(a), pb = pos.get(b);
                    let dx = pb.x - pa.x;
                    let dy = pb.y - pa.y;
                    const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
                    const force = repulsion / (dist * dist);
                    dx /= dist; dy /= dist;
                    forces.get(a).fx -= dx * force;
                    forces.get(a).fy -= dy * force;
                    forces.get(b).fx += dx * force;
                    forces.get(b).fy += dy * force;
                }
            }

            // Attraction along edges
            for (const [u, neighbors] of graph.adj) {
                for (const v of neighbors) {
                    const pu = pos.get(u), pv = pos.get(v);
                    let dx = pv.x - pu.x;
                    let dy = pv.y - pu.y;
                    const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
                    const force = attraction * dist;
                    dx /= dist; dy /= dist;
                    forces.get(u).fx += dx * force;
                    forces.get(u).fy += dy * force;
                    forces.get(v).fx -= dx * force;
                    forces.get(v).fy -= dy * force;
                }
            }

            // Apply forces with damping
            const damping = 0.5;
            for (const v of vertices) {
                const p = pos.get(v);
                const f = forces.get(v);
                p.x += f.fx * damping;
                p.y += f.fy * damping;
                // Keep within bounds
                p.x = Math.max(padding, Math.min(canvasWidth - padding, p.x));
                p.y = Math.max(padding, Math.min(canvasHeight - padding, p.y));
            }
        }
    }

    // ===========================
    //  Snapshot helpers
    // ===========================
    function cloneGraphStates(graph) {
        const vertexStates = new Map();
        for (const [v, state] of graph.vertexStates) {
            vertexStates.set(v, state);
        }
        const edgeStates = new Map();
        for (const [key, state] of graph.edgeStates) {
            edgeStates.set(key, state);
        }
        return { vertexStates, edgeStates };
    }

    /**
     * Capture a full snapshot of graph state: positions, vertex states, edge states.
     * This deep-clones the state so previous snapshots aren't mutated.
     */
    function captureGraphSnapshot(graph, positions, description) {
        const vStates = new Map();
        for (const [v, s] of graph.vertexStates) vStates.set(v, s);
        const eStates = new Map();
        for (const [k, s] of graph.edgeStates) eStates.set(k, s);
        const posSnapshot = new Map();
        for (const [v, p] of positions) posSnapshot.set(v, { x: p.x, y: p.y });
        // Capture adjacency list so the renderer can draw edges from snapshots
        const adjSnapshot = new Map();
        for (const [v, neighbors] of graph.adj) {
            adjSnapshot.set(v, new Set(neighbors));
        }
        return {
            type: 'graph',
            vertexStates: vStates,
            edgeStates: eStates,
            positions: posSnapshot,
            adjList: adjSnapshot,
            isDirected: graph.isDirected || false,
            description: description || '',
        };
    }

    function graphSnapshot(graph, description) {
        return captureGraphSnapshot(graph, graph.positions, description);
    }

    // ===========================
    //  Algorithm Generators
    // ===========================

    // ----- BFS -----
    function* graphBFSGenerator(graph, startVertex) {
        if (!graph.hasVertex(startVertex)) return;

        const vertices = graph.getVertices();
        const adj = graph.adj;

        // Reset states on the graph
        for (const v of vertices) {
            graph.vertexStates.set(v, GRAPH_STATE.UNVISITED);
        }
        const edgeSt = graph.edgeStates;
        for (const key of edgeSt.keys()) edgeSt.set(key, 'default');

        const queue = [startVertex];
        graph.vertexStates.set(startVertex, GRAPH_STATE.DISCOVERED);
        yield graphSnapshot(graph, `Discover starting vertex: ${startVertex}`);

        while (queue.length > 0) {
            const u = queue.shift();
            graph.vertexStates.set(u, GRAPH_STATE.PROCESSED);
            yield graphSnapshot(graph, `Process vertex: ${u}`);

            for (const v of graph.getNeighbors(u)) {
                if (graph.vertexStates.get(v) === GRAPH_STATE.UNVISITED) {
                    graph.vertexStates.set(v, GRAPH_STATE.DISCOVERED);
                    const key = graph._edgeKey(u, v);
                    edgeSt.set(key, GRAPH_STATE.DISCOVERED);
                    queue.push(v);
                    yield graphSnapshot(graph, `Discover vertex: ${v} (from ${u})`);
                }
            }
        }
        yield graphSnapshot(graph, `✓ BFS complete!`);
    }

    // ----- DFS (iterative) -----
    function* graphDFSGenerator(graph, startVertex) {
        if (!graph.hasVertex(startVertex)) return;

        const vertices = graph.getVertices();

        for (const v of vertices) graph.vertexStates.set(v, GRAPH_STATE.UNVISITED);
        const edgeSt = graph.edgeStates;
        for (const key of edgeSt.keys()) edgeSt.set(key, 'default');

        const stack = [startVertex];
        graph.vertexStates.set(startVertex, GRAPH_STATE.DISCOVERED);
        yield graphSnapshot(graph, `Discover starting vertex: ${startVertex}`);

        while (stack.length > 0) {
            const u = stack.pop();

            if (graph.vertexStates.get(u) !== GRAPH_STATE.PROCESSED) {
                graph.vertexStates.set(u, GRAPH_STATE.PROCESSED);
                yield graphSnapshot(graph, `Process vertex: ${u}`);

                for (const v of graph.getNeighbors(u)) {
                    if (graph.vertexStates.get(v) === GRAPH_STATE.UNVISITED) {
                        graph.vertexStates.set(v, GRAPH_STATE.DISCOVERED);
                        const key = graph._edgeKey(u, v);
                        edgeSt.set(key, GRAPH_STATE.DISCOVERED);
                        stack.push(v);
                        yield graphSnapshot(graph, `Discover vertex: ${v} (from ${u})`);
                    }
                }
            }
        }
        yield graphSnapshot(graph, `✓ DFS complete!`);
    }

    // ----- Dijkstra (shortest path) -----
    function* graphDijkstraGenerator(graph, startVertex) {
        if (!graph.hasVertex(startVertex)) return;

        const vertices = graph.getVertices();

        for (const v of vertices) graph.vertexStates.set(v, GRAPH_STATE.UNVISITED);
        const edgeSt = graph.edgeStates;
        for (const key of edgeSt.keys()) edgeSt.set(key, 'default');

        const INF = Infinity;
        const dist = new Map();
        const prev = new Map();
        const unvisited = new Set(vertices);

        for (const v of vertices) {
            dist.set(v, INF);
            prev.set(v, null);
        }
        dist.set(startVertex, 0);

        yield graphSnapshot(graph, `Initialize Dijkstra from ${startVertex}, distance=0`);

        while (unvisited.size > 0) {
            let minV = null;
            let minD = INF;
            for (const v of unvisited) {
                if (dist.get(v) < minD) {
                    minD = dist.get(v);
                    minV = v;
                }
            }
            if (minV === null || minD === INF) break;

            unvisited.delete(minV);
            graph.vertexStates.set(minV, GRAPH_STATE.PROCESSED);
            yield graphSnapshot(graph, `Process ${minV} (distance=${minD})`);

            for (const neighbor of graph.getNeighbors(minV)) {
                if (!unvisited.has(neighbor)) continue;

                const edgeWeight = 1;
                const alt = minD + edgeWeight;
                if (alt < dist.get(neighbor)) {
                    dist.set(neighbor, alt);
                    prev.set(neighbor, minV);
                    graph.vertexStates.set(neighbor, GRAPH_STATE.DISCOVERED);
                    yield graphSnapshot(graph, `Update ${neighbor}: distance=${alt} via ${minV}`);
                }
            }
        }

        // Highlight shortest path to each reachable vertex
        // Collect path edges first, then apply to graph edgeStates
        const pathEdges = new Set();
        const reachable = vertices.filter(v => prev.get(v) !== null || v === startVertex);
        for (const v of reachable) {
            let cur = v;
            while (prev.get(cur) !== null) {
                const p = prev.get(cur);
                const key = graph._edgeKey(cur, p);
                pathEdges.add(key);
                cur = p;
            }
        }
        // Apply path highlighting
        for (const key of pathEdges) {
            edgeSt.set(key, GRAPH_STATE.PATH);
        }
        yield graphSnapshot(graph, `✓ Dijkstra complete! Shortest paths highlighted.`);
    }

    // ----- Topological Sort (for directed graphs) -----
    function* topologicalSortGenerator(graph, startVertex) {
        if (!graph.isDirected) {
            yield graphSnapshot(graph, 'Topological sort requires a directed graph');
            return;
        }
        const vertices = graph.getVertices();
        for (const v of vertices) graph.vertexStates.set(v, GRAPH_STATE.UNVISITED);
        const edgeSt = graph.edgeStates;
        for (const key of edgeSt.keys()) edgeSt.set(key, 'default');

        const visited = new Set();
        const order = [];

        function* dfs(v) {
            visited.add(v);
            graph.vertexStates.set(v, GRAPH_STATE.DISCOVERED);
            yield graphSnapshot(graph, `Discover vertex: ${v}`);

            for (const neighbor of graph.getNeighbors(v)) {
                if (!visited.has(neighbor)) {
                    yield* dfs(neighbor);
                }
            }

            graph.vertexStates.set(v, GRAPH_STATE.PROCESSED);
            order.unshift(v);
            yield graphSnapshot(graph, `Process vertex: ${v} (add to topological order)`);
        }

        // Use startVertex first if provided
        if (startVertex && graph.hasVertex(startVertex)) {
            yield* dfs(startVertex);
        }

        // Then process remaining unvisited vertices
        for (const v of vertices) {
            if (!visited.has(v)) {
                yield* dfs(v);
            }
        }

        yield graphSnapshot(graph, `✓ Topological sort complete! Order: ${order.join(' → ')}`);
    }

    // ===========================
    //  Algorithm Registry
    // ===========================
    const GRAPH_ALGORITHMS = {
        bfs:       { gen: graphBFSGenerator,       name: { zh: '广度优先(BFS)',          en: 'BFS' } },
        dfs:       { gen: graphDFSGenerator,       name: { zh: '深度优先(DFS)',          en: 'DFS' } },
        dijkstra:  { gen: graphDijkstraGenerator,  name: { zh: '最短路径(Dijkstra)',      en: 'Dijkstra' } },
        topsort:   { gen: topologicalSortGenerator, name: { zh: '拓扑排序',               en: 'Topological Sort' } },
    };

    // ===========================
    //  Export
    // ===========================
    window.GraphModule = {
        Graph,
        DirectedGraph,
        GRAPH_STATE,
        GRAPH_ALGORITHMS,
        layoutGraph,
        graphSnapshot,
        captureGraphSnapshot,
    };

})();
