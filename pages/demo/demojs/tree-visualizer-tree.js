/* ============================================================
   Tree Visualizer — Binary Tree Module (BST)
   ============================================================ */
(function () {
    'use strict';

    // ===========================
    //  Node States
    // ===========================
    const TREE_STATE = {
        DEFAULT:  'tree-default',
        VISITING: 'tree-visiting',
        VISITED:  'tree-visited',
    };

    // ===========================
    //  TreeNode
    // ===========================
    class TreeNode {
        constructor(value) {
            this.value = value;
            this.left = null;
            this.right = null;
            // Layout coordinates (set during layout pass)
            this.x = 0;
            this.y = 0;
            this.state = TREE_STATE.DEFAULT;
        }
    }

    // ===========================
    //  BST — Binary Search Tree
    // ===========================
    class BST {
        constructor(values) {
            this.root = null;
            this.nodeCount = 0;
            if (values && values.length > 0) {
                for (const v of values) {
                    this.insert(v);
                }
            }
        }

        insert(value) {
            this.root = this._insert(this.root, value);
            this.nodeCount++;
        }

        _insert(node, value) {
            if (node === null) return new TreeNode(value);
            if (value < node.value) {
                node.left = this._insert(node.left, value);
            } else if (value > node.value) {
                node.right = this._insert(node.right, value);
            } else {
                // Duplicate — decrement since we didn't add
                this.nodeCount--;
                return node;
            }
            return node;
        }

        delete(value) {
            this.root = this._delete(this.root, value);
        }

        _delete(node, value) {
            if (node === null) return null;
            if (value < node.value) {
                node.left = this._delete(node.left, value);
            } else if (value > node.value) {
                node.right = this._delete(node.right, value);
            } else {
                // Found the node
                if (node.left === null) return node.right;
                if (node.right === null) return node.left;
                // Two children: successor
                const succ = this._min(node.right);
                node.value = succ.value;
                node.right = this._delete(node.right, succ.value);
                this.nodeCount--;
            }
            return node;
        }

        _min(node) {
            while (node.left !== null) node = node.left;
            return node;
        }

        search(value) {
            return this._search(this.root, value);
        }

        _search(node, value) {
            if (node === null) return false;
            if (value === node.value) return true;
            return value < node.value
                ? this._search(node.left, value)
                : this._search(node.right, value);
        }

        /** Find a node by value */
        find(value) {
            return this._find(this.root, value);
        }

        _find(node, value) {
            if (node === null) return null;
            if (value === node.value) return node;
            return value < node.value
                ? this._find(node.left, value)
                : this._find(node.right, value);
        }

        /**
         * Explicitly insert as left child of a given parent value.
         * Returns true on success, false if parent not found or left child already exists.
         */
        insertLeft(parentValue, childValue) {
            const parent = this.find(parentValue);
            if (!parent) return false;
            if (parent.left !== null) return false;
            parent.left = new TreeNode(childValue);
            this.nodeCount++;
            return true;
        }

        /**
         * Explicitly insert as right child of a given parent value.
         * Returns true on success, false if parent not found or right child already exists.
         */
        insertRight(parentValue, childValue) {
            const parent = this.find(parentValue);
            if (!parent) return false;
            if (parent.right !== null) return false;
            parent.right = new TreeNode(childValue);
            this.nodeCount++;
            return true;
        }
    }

    // ===========================
    //  Tree Layout — compute (x,y) for each node
    // ===========================
    function layoutTree(root, canvasWidth, canvasHeight) {
        if (!root) return;

        // First pass: assign x-offset via inorder, compute subtree widths
        let index = 0;
        function inorderAssign(node, depth) {
            if (!node) return;
            inorderAssign(node.left, depth + 1);
            node.x = index++;
            node.y = depth;
            inorderAssign(node.right, depth + 1);
        }
        inorderAssign(root, 0);

        // Compute max depth
        function maxDepth(node) {
            if (!node) return 0;
            return 1 + Math.max(maxDepth(node.left), maxDepth(node.right));
        }
        const depth = Math.max(maxDepth(root), 1);
        const nodeCount = index;

        // Map to pixel coordinates
        const padding = 40;
        const drawWidth = canvasWidth - padding * 2;
        const drawHeight = canvasHeight - padding * 2;
        const xSpacing = Math.min(drawWidth / (nodeCount + 1), 80);
        const ySpacing = drawHeight / (depth + 1);

        function mapCoords(node) {
            if (!node) return;
            mapCoords(node.left);
            node.x = padding + (node.x + 1) * xSpacing;
            node.y = padding + (node.y + 1) * ySpacing;
            mapCoords(node.right);
        }
        mapCoords(root);
    }

    // ===========================
    //  Snapshot helpers
    // ===========================
    function cloneTreeStates(root) {
        const states = [];
        function walk(node, parentValue, isLeft) {
            if (!node) return;
            states.push({
                value: node.value,
                state: node.state,
                x: node.x,
                y: node.y,
                parent: parentValue,
                isLeft: !!isLeft,
            });
            walk(node.left, node.value, true);
            walk(node.right, node.value, false);
        }
        walk(root, null, false);
        return states;
    }

    function treeSnapshot(tree, nodeStates, description) {
        return {
            type: 'tree',
            tree,
            nodeStates: nodeStates || [],
            description: description || '',
        };
    }

    // ===========================
    //  Algorithm Generators
    // ===========================

    // ----- BFS (Level-order) -----
    function* bfsGenerator(root) {
        if (!root) return;
        const queue = [root];
        root.state = TREE_STATE.VISITING;
        yield treeSnapshot(null, cloneTreeStates(root), 'Start BFS from root');

        while (queue.length > 0) {
            const node = queue.shift();
            node.state = TREE_STATE.DEFAULT;

            if (node.left) {
                node.left.state = TREE_STATE.VISITING;
                queue.push(node.left);
                yield treeSnapshot(null, cloneTreeStates(root), `Enqueue left child: ${node.left.value}`);
            }
            if (node.right) {
                node.right.state = TREE_STATE.VISITING;
                queue.push(node.right);
                yield treeSnapshot(null, cloneTreeStates(root), `Enqueue right child: ${node.right.value}`);
            }
            node.state = TREE_STATE.VISITED;
            yield treeSnapshot(null, cloneTreeStates(root), `Visit node: ${node.value}`);
        }
        yield treeSnapshot(null, cloneTreeStates(root), '✓ BFS complete!');
    }

    // ----- DFS Inorder (Left-Root-Right) -----
    function* inorderGenerator(root) {
        const states = [];
        function* walk(node) {
            if (!node) return;
            node.state = TREE_STATE.VISITING;
            yield treeSnapshot(null, cloneTreeStates(root), `Traverse left subtree of ${node.value}`);
            yield* walk(node.left);

            node.state = TREE_STATE.VISITED;
            states.push(node.value);
            yield treeSnapshot(null, cloneTreeStates(root), `Visit: ${node.value} (Inorder)`);

            yield treeSnapshot(null, cloneTreeStates(root), `Traverse right subtree of ${node.value}`);
            yield* walk(node.right);

            if (!node.left && !node.right) {
                node.state = TREE_STATE.DEFAULT;
            }
        }
        yield* walk(root);
        yield treeSnapshot(null, cloneTreeStates(root), `✓ Inorder traversal complete! [${states.join(', ')}]`);
    }

    // ----- DFS Preorder (Root-Left-Right) -----
    function* preorderGenerator(root) {
        const states = [];
        function* walk(node) {
            if (!node) return;
            node.state = TREE_STATE.VISITING;
            yield treeSnapshot(null, cloneTreeStates(root), `Visit: ${node.value} (Preorder)`);
            node.state = TREE_STATE.VISITED;
            states.push(node.value);
            yield treeSnapshot(null, cloneTreeStates(root), `Mark ${node.value} visited`);

            yield* walk(node.left);
            yield* walk(node.right);
        }
        yield* walk(root);
        yield treeSnapshot(null, cloneTreeStates(root), `✓ Preorder traversal complete! [${states.join(', ')}]`);
    }

    // ----- DFS Postorder (Left-Right-Root) -----
    function* postorderGenerator(root) {
        const states = [];
        function* walk(node) {
            if (!node) return;
            node.state = TREE_STATE.VISITING;
            yield treeSnapshot(null, cloneTreeStates(root), `Traverse children of ${node.value}`);
            yield* walk(node.left);
            yield* walk(node.right);

            node.state = TREE_STATE.VISITED;
            states.push(node.value);
            yield treeSnapshot(null, cloneTreeStates(root), `Visit: ${node.value} (Postorder)`);
        }
        yield* walk(root);
        yield treeSnapshot(null, cloneTreeStates(root), `✓ Postorder traversal complete! [${states.join(', ')}]`);
    }

    // ===========================
    //  Heap Tree (Array-backed, visualized as tree)
    // ===========================
    class HeapTree {
        constructor(values, isMaxHeap = true) {
            this.heap = [];
            this.nodeCount = 0;
            this.isMaxHeap = isMaxHeap;
            this.root = null;
            if (values && values.length > 0) {
                for (const v of values) {
                    this.insert(v);
                }
            }
        }

        _compare(a, b) {
            return this.isMaxHeap ? a > b : a < b;
        }

        insert(value) {
            this.heap.push(value);
            this.nodeCount++;
            this._siftUp(this.heap.length - 1);
            this._rebuildTree();
        }

        _siftUp(idx) {
            while (idx > 0) {
                const parent = Math.floor((idx - 1) / 2);
                if (this._compare(this.heap[idx], this.heap[parent])) {
                    [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
                    idx = parent;
                } else {
                    break;
                }
            }
        }

        extractRoot() {
            if (this.heap.length === 0) return null;
            const rootVal = this.heap[0];
            const last = this.heap.pop();
            this.nodeCount--;
            if (this.heap.length > 0) {
                this.heap[0] = last;
                this._siftDown(0);
            }
            this._rebuildTree();
            return rootVal;
        }

        _siftDown(idx) {
            const n = this.heap.length;
            while (true) {
                let largest = idx;
                const left = 2 * idx + 1;
                const right = 2 * idx + 2;
                if (left < n && this._compare(this.heap[left], this.heap[largest])) largest = left;
                if (right < n && this._compare(this.heap[right], this.heap[largest])) largest = right;
                if (largest === idx) break;
                [this.heap[idx], this.heap[largest]] = [this.heap[largest], this.heap[idx]];
                idx = largest;
            }
        }

        _rebuildTree() {
            if (this.heap.length === 0) {
                this.root = null;
                return;
            }
            const nodes = this.heap.map(v => new TreeNode(v));
            for (let i = 0; i < nodes.length; i++) {
                const leftIdx = 2 * i + 1;
                const rightIdx = 2 * i + 2;
                if (leftIdx < nodes.length) nodes[i].left = nodes[leftIdx];
                if (rightIdx < nodes.length) nodes[i].right = nodes[rightIdx];
            }
            this.root = nodes[0];
        }

        getHeapArray() {
            return [...this.heap];
        }
    }

    // ===========================
    //  Additional Tree Algorithm Generators
    // ===========================

    // ----- Generic DFS (wraps inorder as default DFS) -----
    function* dfsGenerator(root) {
        yield* inorderGenerator(root);
    }

    // ----- BST Mode verification -----
    function* bstModeGenerator(root) {
        const states = [];
        function* walk(node) {
            if (!node) return;
            node.state = TREE_STATE.VISITING;
            yield treeSnapshot(null, cloneTreeStates(root), `Checking left subtree of ${node.value}`);
            yield* walk(node.left);
            node.state = TREE_STATE.VISITED;
            states.push(node.value);
            yield treeSnapshot(null, cloneTreeStates(root), `Verify BST: ${node.value}`);
            yield treeSnapshot(null, cloneTreeStates(root), `Checking right subtree of ${node.value}`);
            yield* walk(node.right);
            node.state = TREE_STATE.DEFAULT;
        }
        yield* walk(root);
        const valid = states.every((v, i) => i === 0 || v > states[i-1]);
        yield treeSnapshot(null, cloneTreeStates(root), valid ? '✓ BST property satisfied' : '✗ BST property violated');
    }

    // ----- Max-Heap verification -----
    function* maxHeapGenerator(root) {
        if (!root) return;
        const queue = [root];
        root.state = TREE_STATE.VISITING;
        yield treeSnapshot(null, cloneTreeStates(root), 'Start Max-Heap verification');
        let valid = true;
        while (queue.length > 0) {
            const node = queue.shift();
            node.state = TREE_STATE.DEFAULT;
            if (node.left) {
                if (node.left.value > node.value) valid = false;
                node.left.state = TREE_STATE.VISITING;
                queue.push(node.left);
                yield treeSnapshot(null, cloneTreeStates(root), `Check: ${node.left.value} ≤ ${node.value}? ${node.left.value <= node.value ? '✓' : '✗'}`);
            }
            if (node.right) {
                if (node.right.value > node.value) valid = false;
                node.right.state = TREE_STATE.VISITING;
                queue.push(node.right);
                yield treeSnapshot(null, cloneTreeStates(root), `Check: ${node.right.value} ≤ ${node.value}? ${node.right.value <= node.value ? '✓' : '✗'}`);
            }
            node.state = TREE_STATE.VISITED;
            yield treeSnapshot(null, cloneTreeStates(root), `Visit: ${node.value}`);
        }
        yield treeSnapshot(null, cloneTreeStates(root), valid ? '✓ Max-Heap property satisfied!' : '✗ Max-Heap property violated');
    }

    // ----- Min-Heap verification -----
    function* minHeapGenerator(root) {
        if (!root) return;
        const queue = [root];
        root.state = TREE_STATE.VISITING;
        yield treeSnapshot(null, cloneTreeStates(root), 'Start Min-Heap verification');
        let valid = true;
        while (queue.length > 0) {
            const node = queue.shift();
            node.state = TREE_STATE.DEFAULT;
            if (node.left) {
                if (node.left.value < node.value) valid = false;
                node.left.state = TREE_STATE.VISITING;
                queue.push(node.left);
                yield treeSnapshot(null, cloneTreeStates(root), `Check: ${node.left.value} ≥ ${node.value}? ${node.left.value >= node.value ? '✓' : '✗'}`);
            }
            if (node.right) {
                if (node.right.value < node.value) valid = false;
                node.right.state = TREE_STATE.VISITING;
                queue.push(node.right);
                yield treeSnapshot(null, cloneTreeStates(root), `Check: ${node.right.value} ≥ ${node.value}? ${node.right.value >= node.value ? '✓' : '✗'}`);
            }
            node.state = TREE_STATE.VISITED;
            yield treeSnapshot(null, cloneTreeStates(root), `Visit: ${node.value}`);
        }
        yield treeSnapshot(null, cloneTreeStates(root), valid ? '✓ Min-Heap property satisfied!' : '✗ Min-Heap property violated');
    }

    // ===========================
    //  Algorithm Registry
    // ===========================
    const TREE_ALGORITHMS = {
        bfs:       { gen: bfsGenerator,       name: { zh: '广度优先(BFS)', en: 'BFS (Level-order)' } },
        inorder:   { gen: inorderGenerator,   name: { zh: '中序遍历',       en: 'Inorder DFS' } },
        preorder:  { gen: preorderGenerator,  name: { zh: '前序遍历',       en: 'Preorder DFS' } },
        postorder: { gen: postorderGenerator, name: { zh: '后序遍历',       en: 'Postorder DFS' } },
        dfs:       { gen: dfsGenerator,       name: { zh: '深度优先(DFS)', en: 'DFS' } },
        bstverify: { gen: bstModeGenerator,   name: { zh: 'BST验证',       en: 'BST Verify' } },
        maxheap:   { gen: maxHeapGenerator,   name: { zh: '大根堆验证',    en: 'Max-Heap' } },
        minheap:   { gen: minHeapGenerator,   name: { zh: '小根堆验证',    en: 'Min-Heap' } },
    };

    // ===========================
    //  Export
    // ===========================
    window.TreeModule = {
        BST,
        TreeNode,
        HeapTree,
        TREE_STATE,
        TREE_ALGORITHMS,
        layoutTree,
        cloneTreeStates,
        treeSnapshot,
    };

})();
