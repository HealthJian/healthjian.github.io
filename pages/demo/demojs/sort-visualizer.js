/* ============================================================
   Sorting Algorithm Visualizer - Engine & UI Controller
   ============================================================ */

(function () {
    'use strict';

    // ===========================
    //  State
    // ===========================
    const state = {
        array: [],
        original: [],
        size: 30,
        speed: 5,
        sorting: false,
        paused: false,
        algorithm: 'merge',
        mode: 'single',
        generator: null,
        raceController: null,
        animationId: null,
        comparisons: 0,
        swaps: 0,
        startTime: 0,
        timerId: null,
        stepBuffer: [],
        stepIndex: 0,
        finished: false,
    };

    // ===========================
    //  DOM refs
    // ===========================
    const $ = (id) => document.getElementById(id);
    const chartArea = $('chart-area');
    const algoSelect = $('algo-select');
    const sizeSlider = $('size-slider');
    const speedSlider = $('speed-slider');
    const sizeValue = $('size-value');
    const speedValue = $('speed-value');

    const btnGenerate = $('btn-generate');
    const btnStart    = $('btn-start');
    const btnPause    = $('btn-pause');
    const btnReset    = $('btn-reset');

    const statComparisons = $('stat-comparisons');
    const statSwaps       = $('stat-swaps');
    const statTime        = $('stat-time');
    const statStatus      = $('stat-status');
    const stepText        = $('step-text');

    // --- New DOM refs for race mode & code modal ---
    const raceAlgos = $('race-algos');
    const raceGrid = $('race-grid');
    const comparisonTable = $('comparison-table');
    const comparisonTableBody = $('comparison-table-body');
    const codeModal = $('code-modal');
    const codeModalClose = $('code-modal-close');
    const codeModalTitle = $('code-modal-title');
    const codeTabs = $('code-tabs');
    const codeContent = $('code-content');
    const btnViewCode = $('btn-view-code');
    const btnModeToggle = $('btn-mode-toggle');
    const singleModeUI = $('single-mode-ui');
    const raceModeUI = $('race-mode-ui');

    // ===========================
    //  Color constants
    // ===========================
    const BAR_STATE = {
        DEFAULT:   'bar-default',
        COMPARING: 'bar-comparing',
        SWAPPING:  'bar-swapping',
        SORTED:    'bar-sorted',
        PIVOT:     'bar-pivot',
    };

    // ===========================
    //  Algorithm Info (for comparison table)
    // ===========================
    const ALGO_INFO = {
        bubble:    { zh: '冒泡排序', en: 'Bubble Sort',    stable: '✓', timeBest: 'O(n)',      timeAvg: 'O(n²)',    timeWorst: 'O(n²)',   space: 'O(1)' },
        selection: { zh: '选择排序', en: 'Selection Sort', stable: '✗', timeBest: 'O(n²)',     timeAvg: 'O(n²)',    timeWorst: 'O(n²)',   space: 'O(1)' },
        insertion: { zh: '插入排序', en: 'Insertion Sort', stable: '✓', timeBest: 'O(n)',      timeAvg: 'O(n²)',    timeWorst: 'O(n²)',   space: 'O(1)' },
        shell:     { zh: '希尔排序', en: 'Shell Sort',     stable: '✗', timeBest: 'O(n log n)', timeAvg: 'O(n log n)', timeWorst: 'O(n²)',   space: 'O(1)' },
        merge:     { zh: '归并排序', en: 'Merge Sort',     stable: '✓', timeBest: 'O(n log n)', timeAvg: 'O(n log n)', timeWorst: 'O(n log n)', space: 'O(n)' },
        quick:     { zh: '快速排序', en: 'Quick Sort',     stable: '✗', timeBest: 'O(n log n)', timeAvg: 'O(n log n)', timeWorst: 'O(n²)',   space: 'O(log n)' },
        heap:      { zh: '堆排序',   en: 'Heap Sort',       stable: '✗', timeBest: 'O(n log n)', timeAvg: 'O(n log n)', timeWorst: 'O(n log n)', space: 'O(1)' },
        radix:     { zh: '基数排序', en: 'Radix Sort',     stable: '✓', timeBest: 'O(nk)',     timeAvg: 'O(nk)',    timeWorst: 'O(nk)',   space: 'O(n+k)' },
    };

    // ===========================
    //  Utility
    // ===========================
    function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    function generateArray(size) {
        const arr = [];
        for (let i = 0; i < size; i++) {
            arr.push(rand(5, 100));
        }
        return arr;
    }

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    function formatTime(seconds) {
        return seconds < 1 ? seconds.toFixed(3) + 's' : seconds.toFixed(2) + 's';
    }

    function getLang() {
        return document.body.classList.contains('en') ? 'en' : 'zh';
    }

    // ===========================
    //  Snapshot types for generators
    // ===========================
    function snapshot(arr, states, desc, comps, swps) {
        return {
            array: [...arr],
            states: states ? [...states] : arr.map(() => BAR_STATE.DEFAULT),
            description: desc || '',
            comparisons: comps || 0,
            swaps: swps || 0,
        };
    }

    // ===========================
    //  Sorting Algorithm Generators
    // ===========================

    // ----- 1. Bubble Sort -----
    function* bubbleSort(arr) {
        const a = [...arr];
        const n = a.length;
        const states = a.map(() => BAR_STATE.DEFAULT);
        let comps = 0, swps = 0;

        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - 1 - i; j++) {
                states[j] = BAR_STATE.COMPARING;
                states[j + 1] = BAR_STATE.COMPARING;
                comps++;
                yield snapshot(a, states, `Compare a[${j}]=${a[j]} and a[${j+1}]=${a[j+1]}`, comps, swps);

                if (a[j] > a[j + 1]) {
                    [a[j], a[j + 1]] = [a[j + 1], a[j]];
                    swps++;
                    states[j] = BAR_STATE.SWAPPING;
                    states[j + 1] = BAR_STATE.SWAPPING;
                    yield snapshot(a, states, `Swap a[${j}] ↔ a[${j+1}]`, comps, swps);
                }
                states[j] = BAR_STATE.DEFAULT;
                states[j + 1] = BAR_STATE.DEFAULT;
            }
            states[n - 1 - i] = BAR_STATE.SORTED;
        }
        states[0] = BAR_STATE.SORTED;
        yield snapshot(a, states, '✓ Bubble sort complete!', comps, swps);
    }

    // ----- 2. Selection Sort -----
    function* selectionSort(arr) {
        const a = [...arr];
        const n = a.length;
        const states = a.map(() => BAR_STATE.DEFAULT);
        let comps = 0, swps = 0;

        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            states[minIdx] = BAR_STATE.PIVOT;
            yield snapshot(a, states, `Set a[${i}] as current minimum`, comps, swps);

            for (let j = i + 1; j < n; j++) {
                states[j] = BAR_STATE.COMPARING;
                comps++;
                yield snapshot(a, states, `Compare a[${j}]=${a[j]} with current min a[${minIdx}]=${a[minIdx]}`, comps, swps);

                if (a[j] < a[minIdx]) {
                    if (minIdx !== i) states[minIdx] = BAR_STATE.DEFAULT;
                    minIdx = j;
                    states[minIdx] = BAR_STATE.PIVOT;
                    yield snapshot(a, states, `New minimum found at index ${j} (value=${a[j]})`, comps, swps);
                }
                if (j !== minIdx) states[j] = BAR_STATE.DEFAULT;
            }

            if (minIdx !== i) {
                [a[i], a[minIdx]] = [a[minIdx], a[i]];
                swps++;
                states[i] = BAR_STATE.SWAPPING;
                states[minIdx] = BAR_STATE.SWAPPING;
                yield snapshot(a, states, `Swap a[${i}] ↔ a[${minIdx}]`, comps, swps);
            }
            states[minIdx] = BAR_STATE.DEFAULT;
            states[i] = BAR_STATE.SORTED;
        }
        states[n - 1] = BAR_STATE.SORTED;
        yield snapshot(a, states, '✓ Selection sort complete!', comps, swps);
    }

    // ----- 3. Insertion Sort -----
    function* insertionSort(arr) {
        const a = [...arr];
        const n = a.length;
        const states = a.map(() => BAR_STATE.DEFAULT);
        let comps = 0, swps = 0;

        states[0] = BAR_STATE.SORTED;
        yield snapshot(a, states, 'Start with first element as sorted', comps, swps);

        for (let i = 1; i < n; i++) {
            const key = a[i];
            let j = i - 1;
            states[i] = BAR_STATE.PIVOT;
            yield snapshot(a, states, `Pick a[${i}]=${key} to insert`, comps, swps);

            while (j >= 0 && a[j] > key) {
                states[j] = BAR_STATE.COMPARING;
                states[j + 1] = BAR_STATE.COMPARING;
                comps++;
                yield snapshot(a, states, `Compare a[${j}]=${a[j]} > ${key}, shift right`, comps, swps);

                a[j + 1] = a[j];
                swps++;
                states[j + 1] = BAR_STATE.SWAPPING;
                yield snapshot(a, states, `Shift a[${j}] → a[${j+1}]`, comps, swps);

                states[j + 1] = BAR_STATE.SORTED;
                states[j] = BAR_STATE.DEFAULT;
                j--;
            }
            a[j + 1] = key;
            states[j + 1] = BAR_STATE.SORTED;
            if (i !== j + 1) {
                yield snapshot(a, states, `Insert ${key} at position ${j+1}`, comps, swps);
            }
        }
        yield snapshot(a, states, '✓ Insertion sort complete!', comps, swps);
    }

    // ----- 4. Shell Sort -----
    function* shellSort(arr) {
        const a = [...arr];
        const n = a.length;
        const states = a.map(() => BAR_STATE.DEFAULT);
        let comps = 0, swps = 0;

        for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
            yield snapshot(a, states, `Gap = ${gap}`, comps, swps);

            for (let i = gap; i < n; i++) {
                const temp = a[i];
                let j = i;
                states[i] = BAR_STATE.PIVOT;
                yield snapshot(a, states, `Shell: pick a[${i}]=${temp} with gap=${gap}`, comps, swps);

                while (j >= gap && a[j - gap] > temp) {
                    states[j - gap] = BAR_STATE.COMPARING;
                    states[j] = BAR_STATE.COMPARING;
                    comps++;
                    yield snapshot(a, states, `Compare a[${j-gap}]=${a[j-gap]} > ${temp}`, comps, swps);

                    a[j] = a[j - gap];
                    swps++;
                    states[j] = BAR_STATE.SWAPPING;
                    yield snapshot(a, states, `Shift a[${j-gap}] → a[${j}]`, comps, swps);

                    states[j] = BAR_STATE.DEFAULT;
                    j -= gap;
                }
                a[j] = temp;
                if (i !== j) {
                    yield snapshot(a, states, `Place ${temp} at position ${j}`, comps, swps);
                }
                for (let k = 0; k < n; k++) states[k] = BAR_STATE.DEFAULT;
            }
        }
        for (let k = 0; k < n; k++) states[k] = BAR_STATE.SORTED;
        yield snapshot(a, states, '✓ Shell sort complete!', comps, swps);
    }

    // ----- 5. Merge Sort -----
    function* mergeSort(arr) {
        const a = [...arr];
        const n = a.length;
        const states = a.map(() => BAR_STATE.DEFAULT);
        let comps = 0, swps = 0;

        function* merge(l, m, r) {
            const left = a.slice(l, m + 1);
            const right = a.slice(m + 1, r + 1);
            let i = 0, j = 0, k = l;

            while (i < left.length && j < right.length) {
                for (let p = l; p <= r; p++) states[p] = BAR_STATE.DEFAULT;
                states[l + i] = BAR_STATE.COMPARING;
                states[m + 1 + j] = BAR_STATE.COMPARING;
                comps++;

                yield snapshot(a, states, `Merge: compare ${left[i]} and ${right[j]}`, comps, swps);

                if (left[i] <= right[j]) {
                    a[k] = left[i];
                    i++;
                } else {
                    a[k] = right[j];
                    j++;
                }
                swps++;
                states[k] = BAR_STATE.SWAPPING;
                yield snapshot(a, states, `Merge: place ${a[k]} at position ${k}`, comps, swps);
                states[k] = BAR_STATE.DEFAULT;
                k++;
            }

            while (i < left.length) {
                a[k] = left[i];
                states[k] = BAR_STATE.SWAPPING;
                yield snapshot(a, states, `Merge: place remaining ${left[i]} at ${k}`, comps, swps);
                states[k] = BAR_STATE.DEFAULT;
                i++; k++;
            }

            while (j < right.length) {
                a[k] = right[j];
                states[k] = BAR_STATE.SWAPPING;
                yield snapshot(a, states, `Merge: place remaining ${right[j]} at ${k}`, comps, swps);
                states[k] = BAR_STATE.DEFAULT;
                j++; k++;
            }

            for (let p = l; p <= r; p++) states[p] = BAR_STATE.SORTED;
        }

        function* divide(l, r) {
            if (l >= r) return;
            const m = Math.floor((l + r) / 2);
            for (let p = l; p <= r; p++) states[p] = BAR_STATE.DEFAULT;
            states[m] = BAR_STATE.PIVOT;
            yield snapshot(a, states, `Divide [${l}..${r}] at midpoint ${m}`, comps, swps);

            yield* divide(l, m);
            yield* divide(m + 1, r);
            yield* merge(l, m, r);
        }

        yield* divide(0, n - 1);
        for (let k = 0; k < n; k++) states[k] = BAR_STATE.SORTED;
        yield snapshot(a, states, '✓ Merge sort complete!', comps, swps);
    }

    // ----- 6. Quick Sort -----
    function* quickSort(arr) {
        const a = [...arr];
        const n = a.length;
        const states = a.map(() => BAR_STATE.DEFAULT);
        let comps = 0, swps = 0;

        function* qs(lo, hi) {
            if (lo >= hi) {
                if (lo >= 0 && lo < n) states[lo] = BAR_STATE.SORTED;
                return;
            }

            const pivot = a[hi];
            states[hi] = BAR_STATE.PIVOT;
            yield snapshot(a, states, `Pivot = a[${hi}]=${pivot}`, comps, swps);

            let i = lo;
            for (let j = lo; j < hi; j++) {
                states[j] = BAR_STATE.COMPARING;
                states[i] = (i === j) ? BAR_STATE.COMPARING : BAR_STATE.DEFAULT;
                comps++;
                yield snapshot(a, states, `Compare a[${j}]=${a[j]} with pivot ${pivot}`, comps, swps);

                if (a[j] <= pivot) {
                    [a[i], a[j]] = [a[j], a[i]];
                    if (i !== j) {
                        swps++;
                        states[i] = BAR_STATE.SWAPPING;
                        states[j] = BAR_STATE.SWAPPING;
                        yield snapshot(a, states, `Swap a[${i}] ↔ a[${j}]`, comps, swps);
                    }
                    i++;
                }
                states[j] = BAR_STATE.DEFAULT;
            }

            [a[i], a[hi]] = [a[hi], a[i]];
            swps++;
            states[i] = BAR_STATE.SWAPPING;
            states[hi] = BAR_STATE.SWAPPING;
            yield snapshot(a, states, `Place pivot at position ${i}`, comps, swps);

            states[hi] = BAR_STATE.DEFAULT;
            states[i] = BAR_STATE.SORTED;

            yield* qs(lo, i - 1);
            yield* qs(i + 1, hi);
        }

        yield* qs(0, n - 1);
        for (let k = 0; k < n; k++) states[k] = BAR_STATE.SORTED;
        yield snapshot(a, states, '✓ Quick sort complete!', comps, swps);
    }

    // ----- 7. Heap Sort -----
    function* heapSort(arr) {
        const a = [...arr];
        const n = a.length;
        const states = a.map(() => BAR_STATE.DEFAULT);
        let comps = 0, swps = 0;

        function* heapify(size, root) {
            let largest = root;
            const left = 2 * root + 1;
            const right = 2 * root + 2;

            if (left < size) {
                states[left] = BAR_STATE.COMPARING;
                states[largest] = BAR_STATE.COMPARING;
                comps++;
                yield snapshot(a, states, `Heapify: compare a[${left}]=${a[left]} with a[${largest}]=${a[largest]}`, comps, swps);
                states[left] = BAR_STATE.DEFAULT;
                if (a[left] > a[largest]) largest = left;
            }
            if (right < size) {
                states[right] = BAR_STATE.COMPARING;
                states[largest] = BAR_STATE.COMPARING;
                comps++;
                yield snapshot(a, states, `Heapify: compare a[${right}]=${a[right]} with a[${largest}]=${a[largest]}`, comps, swps);
                states[right] = BAR_STATE.DEFAULT;
                if (a[right] > a[largest]) largest = right;
            }
            if (largest !== root) {
                [a[root], a[largest]] = [a[largest], a[root]];
                swps++;
                states[root] = BAR_STATE.SWAPPING;
                states[largest] = BAR_STATE.SWAPPING;
                yield snapshot(a, states, `Heapify: swap a[${root}] ↔ a[${largest}]`, comps, swps);
                states[root] = BAR_STATE.DEFAULT;
                states[largest] = BAR_STATE.DEFAULT;
                yield* heapify(size, largest);
            }
        }

        // Build max heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            yield snapshot(a, states, `Build max heap from index ${i}`, comps, swps);
            yield* heapify(n, i);
        }

        // Extract elements
        for (let i = n - 1; i > 0; i--) {
            states[0] = BAR_STATE.PIVOT;
            states[i] = BAR_STATE.PIVOT;
            yield snapshot(a, states, `Swap root a[0]=${a[0]} with a[${i}]=${a[i]}`, comps, swps);

            [a[0], a[i]] = [a[i], a[0]];
            swps++;
            states[0] = BAR_STATE.SWAPPING;
            states[i] = BAR_STATE.SWAPPING;
            yield snapshot(a, states, `Move largest to position ${i}`, comps, swps);

            states[i] = BAR_STATE.SORTED;
            states[0] = BAR_STATE.DEFAULT;
            yield* heapify(i, 0);
        }
        states[0] = BAR_STATE.SORTED;
        yield snapshot(a, states, '✓ Heap sort complete!', comps, swps);
    }

    // ----- 8. Radix Sort (LSD) -----
    function* radixSort(arr) {
        const a = [...arr];
        const n = a.length;
        const states = a.map(() => BAR_STATE.DEFAULT);
        let comps = 0, swps = 0;

        const max = Math.max(...a);
        let exp = 1;

        while (Math.floor(max / exp) > 0) {
            yield snapshot(a, states, `Radix: sorting by digit place ${exp}`, comps, swps);

            const output = new Array(n);
            const count = new Array(10).fill(0);

            for (let i = 0; i < n; i++) {
                states[i] = BAR_STATE.COMPARING;
                const digit = Math.floor(a[i] / exp) % 10;
                count[digit]++;
                comps++;
                yield snapshot(a, states, `Count digit ${digit} for a[${i}]=${a[i]}`, comps, swps);
                states[i] = BAR_STATE.DEFAULT;
            }

            for (let i = 1; i < 10; i++) count[i] += count[i - 1];

            for (let i = n - 1; i >= 0; i--) {
                const digit = Math.floor(a[i] / exp) % 10;
                output[count[digit] - 1] = a[i];
                count[digit]--;
                swps++;
                yield snapshot(a, states, `Place a[${i}]=${a[i]} at position ${count[digit]} (digit=${digit})`, comps, swps);
            }

            for (let i = 0; i < n; i++) {
                a[i] = output[i];
                states[i] = BAR_STATE.SWAPPING;
            }
            yield snapshot(a, states, `After sorting by digit place ${exp}`, comps, swps);

            for (let i = 0; i < n; i++) states[i] = BAR_STATE.DEFAULT;
            exp *= 10;
        }

        for (let i = 0; i < n; i++) states[i] = BAR_STATE.SORTED;
        yield snapshot(a, states, '✓ Radix sort complete!', comps, swps);
    }

    // ===========================
    //  Generator registry
    // ===========================
    const ALGORITHMS = {
        bubble:    { gen: bubbleSort,    name: { zh: '冒泡排序', en: 'Bubble Sort' } },
        selection: { gen: selectionSort, name: { zh: '选择排序', en: 'Selection Sort' } },
        insertion: { gen: insertionSort, name: { zh: '插入排序', en: 'Insertion Sort' } },
        shell:     { gen: shellSort,     name: { zh: '希尔排序', en: 'Shell Sort' } },
        merge:     { gen: mergeSort,     name: { zh: '归并排序', en: 'Merge Sort' } },
        quick:     { gen: quickSort,     name: { zh: '快速排序', en: 'Quick Sort' } },
        heap:      { gen: heapSort,      name: { zh: '堆排序', en: 'Heap Sort' } },
        radix:     { gen: radixSort,     name: { zh: '基数排序', en: 'Radix Sort' } },
    };

    // ===========================
    //  Code Samples (48 snippets across 8 algorithms × 6 languages)
    // ===========================
    const CODE_SAMPLES = {
        bubble: {
            c: `#include <stdio.h>

void bubble_sort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
            cpp: `#include <vector>
#include <algorithm>

template<typename T>
void bubble_sort(std::vector<T>& arr) {
    size_t n = arr.size();
    for (size_t i = 0; i < n - 1; i++) {
        for (size_t j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                std::swap(arr[j], arr[j + 1]);
            }
        }
    }
}`,
            python: `def bubble_sort(arr):
    """Bubble sort with early exit optimization."""
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr`,
            rust: `fn bubble_sort<T: Ord>(arr: &mut [T]) {
    let n = arr.len();
    for i in 0..n {
        for j in 0..n - 1 - i {
            if arr[j] > arr[j + 1] {
                arr.swap(j, j + 1);
            }
        }
    }
}`,
            javascript: `function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}`,
            typescript: `function bubbleSort(arr: number[]): number[] {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}`,
        },
        selection: {
            c: `#include <stdio.h>

void selection_sort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[min_idx]) {
                min_idx = j;
            }
        }
        if (min_idx != i) {
            int temp = arr[i];
            arr[i] = arr[min_idx];
            arr[min_idx] = temp;
        }
    }
}`,
            cpp: `#include <vector>
#include <algorithm>

template<typename T>
void selection_sort(std::vector<T>& arr) {
    size_t n = arr.size();
    for (size_t i = 0; i < n - 1; i++) {
        size_t min_idx = i;
        for (size_t j = i + 1; j < n; j++) {
            if (arr[j] < arr[min_idx]) {
                min_idx = j;
            }
        }
        if (min_idx != i) {
            std::swap(arr[i], arr[min_idx]);
        }
    }
}`,
            python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
            rust: `fn selection_sort<T: Ord>(arr: &mut [T]) {
    let n = arr.len();
    for i in 0..n - 1 {
        let mut min_idx = i;
        for j in i + 1..n {
            if arr[j] < arr[min_idx] {
                min_idx = j;
            }
        }
        if min_idx != i {
            arr.swap(i, min_idx);
        }
    }
}`,
            javascript: `function selectionSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        }
    }
    return arr;
}`,
            typescript: `function selectionSort(arr: number[]): number[] {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        }
    }
    return arr;
}`,
        },
        insertion: {
            c: `#include <stdio.h>

void insertion_sort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
            cpp: `#include <vector>

template<typename T>
void insertion_sort(std::vector<T>& arr) {
    size_t n = arr.size();
    for (size_t i = 1; i < n; i++) {
        T key = arr[i];
        int j = static_cast<int>(i) - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
            python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
            rust: `fn insertion_sort<T: Ord>(arr: &mut [T]) {
    for i in 1..arr.len() {
        let mut j = i;
        while j > 0 && arr[j - 1] > arr[j] {
            arr.swap(j - 1, j);
            j -= 1;
        }
    }
}`,
            javascript: `function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}`,
            typescript: `function insertionSort(arr: number[]): number[] {
    for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}`,
        },
        shell: {
            c: `#include <stdio.h>

void shell_sort(int arr[], int n) {
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {
            int temp = arr[i];
            int j;
            for (j = i; j >= gap && arr[j - gap] > temp; j -= gap) {
                arr[j] = arr[j - gap];
            }
            arr[j] = temp;
        }
    }
}`,
            cpp: `#include <vector>

template<typename T>
void shell_sort(std::vector<T>& arr) {
    size_t n = arr.size();
    for (size_t gap = n / 2; gap > 0; gap /= 2) {
        for (size_t i = gap; i < n; i++) {
            T temp = arr[i];
            size_t j = i;
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = temp;
        }
    }
}`,
            python: `def shell_sort(arr):
    n = len(arr)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = temp
        gap //= 2
    return arr`,
            rust: `fn shell_sort<T: Ord>(arr: &mut [T]) {
    let n = arr.len();
    let mut gap = n / 2;
    while gap > 0 {
        for i in gap..n {
            let mut j = i;
            while j >= gap && arr[j - gap] > arr[j] {
                arr.swap(j - gap, j);
                j -= gap;
            }
        }
        gap /= 2;
    }
}`,
            javascript: `function shellSort(arr) {
    const n = arr.length;
    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        for (let i = gap; i < n; i++) {
            const temp = arr[i];
            let j = i;
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = temp;
        }
    }
    return arr;
}`,
            typescript: `function shellSort(arr: number[]): number[] {
    const n = arr.length;
    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        for (let i = gap; i < n; i++) {
            const temp = arr[i];
            let j = i;
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = temp;
        }
    }
    return arr;
}`,
        },
        merge: {
            c: `#include <stdio.h>
#include <stdlib.h>

void merge(int arr[], int l, int m, int r) {
    int n1 = m - l + 1;
    int n2 = r - m;
    int L[n1], R[n2];
    for (int i = 0; i < n1; i++) L[i] = arr[l + i];
    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) { arr[k] = L[i]; i++; }
        else               { arr[k] = R[j]; j++; }
        k++;
    }
    while (i < n1) { arr[k] = L[i]; i++; k++; }
    while (j < n2) { arr[k] = R[j]; j++; k++; }
}

void merge_sort(int arr[], int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        merge_sort(arr, l, m);
        merge_sort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}`,
            cpp: `#include <vector>

template<typename T>
void merge(std::vector<T>& arr, int l, int m, int r) {
    std::vector<T> L(arr.begin() + l, arr.begin() + m + 1);
    std::vector<T> R(arr.begin() + m + 1, arr.begin() + r + 1);
    int i = 0, j = 0, k = l;
    while (i < (int)L.size() && j < (int)R.size()) {
        if (L[i] <= R[j]) { arr[k] = L[i]; i++; }
        else              { arr[k] = R[j]; j++; }
        k++;
    }
    while (i < (int)L.size()) { arr[k] = L[i]; i++; k++; }
    while (j < (int)R.size()) { arr[k] = R[j]; j++; k++; }
}

template<typename T>
void merge_sort(std::vector<T>& arr, int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        merge_sort(arr, l, m);
        merge_sort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}`,
            python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    i = j = 0
    merged = []
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged`,
            rust: `fn merge_sort<T: Ord + Clone>(arr: &[T]) -> Vec<T> {
    if arr.len() <= 1 {
        return arr.to_vec();
    }
    let mid = arr.len() / 2;
    let left = merge_sort(&arr[..mid]);
    let right = merge_sort(&arr[mid..]);
    let mut merged = Vec::with_capacity(arr.len());
    let (mut i, mut j) = (0, 0);
    while i < left.len() && j < right.len() {
        if left[i] <= right[j] {
            merged.push(left[i].clone());
            i += 1;
        } else {
            merged.push(right[j].clone());
            j += 1;
        }
    }
    merged.extend_from_slice(&left[i..]);
    merged.extend_from_slice(&right[j..]);
    merged
}`,
            javascript: `function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    const merged = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            merged.push(left[i]);
            i++;
        } else {
            merged.push(right[j]);
            j++;
        }
    }
    return merged.concat(left.slice(i)).concat(right.slice(j));
}`,
            typescript: `function mergeSort(arr: number[]): number[] {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    const merged: number[] = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            merged.push(left[i]);
            i++;
        } else {
            merged.push(right[j]);
            j++;
        }
    }
    return merged.concat(left.slice(i)).concat(right.slice(j));
}`,
        },
        quick: {
            c: `#include <stdio.h>

int partition(int arr[], int lo, int hi) {
    int pivot = arr[hi];
    int i = lo;
    for (int j = lo; j < hi; j++) {
        if (arr[j] <= pivot) {
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
            i++;
        }
    }
    int temp = arr[i];
    arr[i] = arr[hi];
    arr[hi] = temp;
    return i;
}

void quick_sort(int arr[], int lo, int hi) {
    if (lo < hi) {
        int p = partition(arr, lo, hi);
        quick_sort(arr, lo, p - 1);
        quick_sort(arr, p + 1, hi);
    }
}`,
            cpp: `#include <vector>
#include <algorithm>

template<typename T>
int partition(std::vector<T>& arr, int lo, int hi) {
    T pivot = arr[hi];
    int i = lo;
    for (int j = lo; j < hi; j++) {
        if (arr[j] <= pivot) {
            std::swap(arr[i], arr[j]);
            i++;
        }
    }
    std::swap(arr[i], arr[hi]);
    return i;
}

template<typename T>
void quick_sort(std::vector<T>& arr, int lo, int hi) {
    if (lo < hi) {
        int p = partition(arr, lo, hi);
        quick_sort(arr, lo, p - 1);
        quick_sort(arr, p + 1, hi);
    }
}`,
            python: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[-1]
    left = [x for x in arr[:-1] if x <= pivot]
    right = [x for x in arr[:-1] if x > pivot]
    return quick_sort(left) + [pivot] + quick_sort(right)`,
            rust: `fn quick_sort<T: Ord>(arr: &mut [T]) {
    if arr.len() <= 1 {
        return;
    }
    let pivot_idx = partition(arr);
    quick_sort(&mut arr[..pivot_idx]);
    quick_sort(&mut arr[pivot_idx + 1..]);
}

fn partition<T: Ord>(arr: &mut [T]) -> usize {
    let pivot_idx = arr.len() - 1;
    let mut i = 0;
    for j in 0..pivot_idx {
        if arr[j] <= arr[pivot_idx] {
            arr.swap(i, j);
            i += 1;
        }
    }
    arr.swap(i, pivot_idx);
    i
}`,
            javascript: `function quickSort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[arr.length - 1];
    const left = [];
    const right = [];
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] <= pivot) left.push(arr[i]);
        else right.push(arr[i]);
    }
    return [...quickSort(left), pivot, ...quickSort(right)];
}`,
            typescript: `function quickSort(arr: number[]): number[] {
    if (arr.length <= 1) return arr;
    const pivot = arr[arr.length - 1];
    const left: number[] = [];
    const right: number[] = [];
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] <= pivot) left.push(arr[i]);
        else right.push(arr[i]);
    }
    return [...quickSort(left), pivot, ...quickSort(right)];
}`,
        },
        heap: {
            c: `#include <stdio.h>

void heapify(int arr[], int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) {
        int temp = arr[i];
        arr[i] = arr[largest];
        arr[largest] = temp;
        heapify(arr, n, largest);
    }
}

void heap_sort(int arr[], int n) {
    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        heapify(arr, i, 0);
    }
}`,
            cpp: `#include <vector>
#include <algorithm>

template<typename T>
void heapify(std::vector<T>& arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) {
        std::swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}

template<typename T>
void heap_sort(std::vector<T>& arr) {
    int n = (int)arr.size();
    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        std::swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}`,
            python: `def heapify(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    if left < n and arr[left] > arr[largest]:
        largest = left
    if right < n and arr[right] > arr[largest]:
        largest = right
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

def heap_sort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    return arr`,
            rust: `fn heapify<T: Ord>(arr: &mut [T], n: usize, i: usize) {
    let mut largest = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;
    if left < n && arr[left] > arr[largest] { largest = left; }
    if right < n && arr[right] > arr[largest] { largest = right; }
    if largest != i {
        arr.swap(i, largest);
        heapify(arr, n, largest);
    }
}

fn heap_sort<T: Ord>(arr: &mut [T]) {
    let n = arr.len();
    for i in (0..n / 2).rev() { heapify(arr, n, i); }
    for i in (1..n).rev() {
        arr.swap(0, i);
        heapify(arr, i, 0);
    }
}`,
            javascript: `function heapSort(arr) {
    const n = arr.length;
    function heapify(n, i) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (left < n && arr[left] > arr[largest]) largest = left;
        if (right < n && arr[right] > arr[largest]) largest = right;
        if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            heapify(n, largest);
        }
    }
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        heapify(i, 0);
    }
    return arr;
}`,
            typescript: `function heapSort(arr: number[]): number[] {
    const n = arr.length;
    function heapify(n: number, i: number): void {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (left < n && arr[left] > arr[largest]) largest = left;
        if (right < n && arr[right] > arr[largest]) largest = right;
        if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            heapify(n, largest);
        }
    }
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        heapify(i, 0);
    }
    return arr;
}`,
        },
        radix: {
            c: `#include <stdio.h>
#include <stdlib.h>

int get_max(int arr[], int n) {
    int mx = arr[0];
    for (int i = 1; i < n; i++)
        if (arr[i] > mx) mx = arr[i];
    return mx;
}

void counting_sort(int arr[], int n, int exp) {
    int output[n];
    int count[10] = {0};
    for (int i = 0; i < n; i++) count[(arr[i] / exp) % 10]++;
    for (int i = 1; i < 10; i++) count[i] += count[i - 1];
    for (int i = n - 1; i >= 0; i--) {
        int digit = (arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;
    }
    for (int i = 0; i < n; i++) arr[i] = output[i];
}

void radix_sort(int arr[], int n) {
    int m = get_max(arr, n);
    for (int exp = 1; m / exp > 0; exp *= 10)
        counting_sort(arr, n, exp);
}`,
            cpp: `#include <vector>
#include <algorithm>

template<typename T>
void counting_sort(std::vector<T>& arr, int exp) {
    int n = arr.size();
    std::vector<T> output(n);
    int count[10] = {0};
    for (int i = 0; i < n; i++) count[(arr[i] / exp) % 10]++;
    for (int i = 1; i < 10; i++) count[i] += count[i - 1];
    for (int i = n - 1; i >= 0; i--) {
        int digit = (arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;
    }
    for (int i = 0; i < n; i++) arr[i] = output[i];
}

template<typename T>
void radix_sort(std::vector<T>& arr) {
    int m = *std::max_element(arr.begin(), arr.end());
    for (int exp = 1; m / exp > 0; exp *= 10)
        counting_sort(arr, exp);
}`,
            python: `def radix_sort(arr):
    max_val = max(arr)
    exp = 1
    while max_val // exp > 0:
        n = len(arr)
        output = [0] * n
        count = [0] * 10
        for i in range(n):
            digit = (arr[i] // exp) % 10
            count[digit] += 1
        for i in range(1, 10):
            count[i] += count[i - 1]
        for i in range(n - 1, -1, -1):
            digit = (arr[i] // exp) % 10
            output[count[digit] - 1] = arr[i]
            count[digit] -= 1
        for i in range(n):
            arr[i] = output[i]
        exp *= 10
    return arr`,
            rust: `fn radix_sort(arr: &mut [u32]) {
    let max = *arr.iter().max().unwrap_or(&0);
    let mut exp = 1;
    while max / exp > 0 {
        let n = arr.len();
        let mut output = vec![0u32; n];
        let mut count = [0usize; 10];
        for &x in arr.iter() { count[(x / exp) as usize % 10] += 1; }
        for i in 1..10 { count[i] += count[i - 1]; }
        for &x in arr.iter().rev() {
            let digit = (x / exp) as usize % 10;
            output[count[digit] - 1] = x;
            count[digit] -= 1;
        }
        arr.copy_from_slice(&output);
        exp *= 10;
    }
}`,
            javascript: `function radixSort(arr) {
    const max = Math.max(...arr);
    let exp = 1;
    while (Math.floor(max / exp) > 0) {
        const n = arr.length;
        const output = new Array(n);
        const count = new Array(10).fill(0);
        for (let i = 0; i < n; i++) {
            count[Math.floor(arr[i] / exp) % 10]++;
        }
        for (let i = 1; i < 10; i++) count[i] += count[i - 1];
        for (let i = n - 1; i >= 0; i--) {
            const digit = Math.floor(arr[i] / exp) % 10;
            output[count[digit] - 1] = arr[i];
            count[digit]--;
        }
        for (let i = 0; i < n; i++) arr[i] = output[i];
        exp *= 10;
    }
    return arr;
}`,
            typescript: `function radixSort(arr: number[]): number[] {
    const max = Math.max(...arr);
    let exp = 1;
    while (Math.floor(max / exp) > 0) {
        const n = arr.length;
        const output = new Array<number>(n);
        const count = new Array<number>(10).fill(0);
        for (let i = 0; i < n; i++) {
            count[Math.floor(arr[i] / exp) % 10]++;
        }
        for (let i = 1; i < 10; i++) count[i] += count[i - 1];
        for (let i = n - 1; i >= 0; i--) {
            const digit = Math.floor(arr[i] / exp) % 10;
            output[count[digit] - 1] = arr[i];
            count[digit]--;
        }
        for (let i = 0; i < n; i++) arr[i] = output[i];
        exp *= 10;
    }
    return arr;
}`,
        },
    };

    // ===========================
    //  AlgorithmRunner & RaceController
    // ===========================

    class AlgorithmRunner {
        constructor(algoKey, array, info) {
            this.algoKey = algoKey;
            this.info = info;
            this.array = [...array];
            this.gen = ALGORITHMS[algoKey].gen.call(null, this.array);
            this.done = false;
            this.snapshots = [];
            this.comparisons = 0;
            this.swaps = 0;
            this.startTime = 0;
            this.elapsedMs = 0;
            this.lastSnapshot = null;
            this.maxVal = Math.max(...array, 1);
        }

        step() {
            if (this.done) return false;
            const result = this.gen.next();
            if (result.done) {
                this.done = true;
                this.elapsedMs = performance.now() - this.startTime;
                return false;
            }
            const snap = result.value;
            this.lastSnapshot = snap;
            this.comparisons = snap.comparisons || 0;
            this.swaps = snap.swaps || 0;
            this.snapshots.push(snap);
            return true;
        }

        render(container, maxVal) {
            if (!this.lastSnapshot) return;
            const arr = this.lastSnapshot.array;
            const states = this.lastSnapshot.states;
            const mVal = maxVal || Math.max(...arr, 1);
            const height = container.clientHeight || 200;

            while (container.children.length < arr.length) {
                const bar = document.createElement('div');
                bar.className = 'bar bar-default race-bar';
                container.appendChild(bar);
            }
            while (container.children.length > arr.length) {
                container.removeChild(container.lastChild);
            }

            for (let i = 0; i < arr.length; i++) {
                const bar = container.children[i];
                const pct = (arr[i] / mVal) * 100;
                bar.style.height = Math.max(2, (pct / 100) * height) + 'px';
                bar.className = 'bar ' + (states[i] || BAR_STATE.DEFAULT) + ' race-bar';
            }

            const col = container.closest('.race-chart-column');
            if (col) {
                const comparisonsEl = col.querySelector('.race-comparisons');
                const swapsEl = col.querySelector('.race-swaps');
                if (comparisonsEl) comparisonsEl.textContent = this.comparisons;
                if (swapsEl) swapsEl.textContent = this.swaps;
                const statusEl = col.querySelector('.race-status');
                if (statusEl) {
                    if (this.done) {
                        statusEl.textContent = getLang() === 'en' ? '✓ Done' : '✓ 完成';
                        statusEl.className = 'race-status race-done';
                    } else {
                        statusEl.textContent = getLang() === 'en' ? 'Sorting...' : '排序中...';
                        statusEl.className = 'race-status race-sorting';
                    }
                }
            }
        }

        getResult() {
            return {
                algoKey: this.algoKey,
                name: this.info[getLang()] || this.info.en,
                comparisons: this.comparisons,
                swaps: this.swaps,
                timeMs: this.elapsedMs || (performance.now() - this.startTime),
                info: this.info,
            };
        }
    }

    class RaceController {
        constructor() {
            this.runners = [];
            this.running = false;
            this.finished = false;
            this.startTime = 0;
        }

        addRunner(runner) {
            this.runners.push(runner);
        }

        start() {
            this.running = true;
            this.finished = false;
            this.startTime = performance.now();
            this.runners.forEach(r => r.startTime = this.startTime);
        }

        stepAll() {
            if (!this.running) return false;
            let anyAlive = false;
            for (const runner of this.runners) {
                const alive = runner.step();
                if (alive) anyAlive = true;
            }
            if (!anyAlive) {
                this.running = false;
                this.finished = true;
            }
            return anyAlive;
        }

        renderAll() {
            const maxVal = Math.max(...this.runners[0]?.array || [0], 1);
            for (const runner of this.runners) {
                const col = document.querySelector('.race-chart-column[data-algo="' + runner.algoKey + '"]');
                if (!col) continue;
                const chart = col.querySelector('.race-chart');
                runner.render(chart, maxVal);
            }
        }

        getAllResults() {
            return this.runners.map(r => r.getResult());
        }

        stop() {
            this.running = false;
        }
    }

    // ===========================
    //  Comparison Table
    // ===========================

    function renderComparisonTable(results) {
        const tbody = comparisonTableBody;
        const lang = getLang();
        tbody.innerHTML = '';

        const sorted = [...results].sort((a, b) => a.timeMs - b.timeMs);

        for (const r of sorted) {
            const tr = document.createElement('tr');
            const rank = sorted.indexOf(r) + 1;
            tr.innerHTML =
                '<td><span class="rank-badge">' + rank + '</span> ' + r.name + '</td>' +
                '<td>' + r.comparisons + '</td>' +
                '<td>' + r.swaps + '</td>' +
                '<td>' + (r.timeMs / 1000).toFixed(3) + 's</td>' +
                '<td>' + r.info.stable + '</td>' +
                '<td>' + r.info.timeBest + '</td>' +
                '<td>' + r.info.timeAvg + '</td>' +
                '<td>' + r.info.timeWorst + '</td>' +
                '<td>' + r.info.space + '</td>';
            if (rank === 1) tr.className = 'winner-row';
            tbody.appendChild(tr);
        }

        comparisonTable.style.display = 'block';
        setTimeout(function () { comparisonTable.classList.add('visible'); }, 10);
    }

    // ===========================
    //  Code Modal
    // ===========================

    let currentAlgoForCode = 'merge';

    function openCodeModal(algoKey) {
        currentAlgoForCode = algoKey;
        const lang = getLang();
        const info = ALGO_INFO[algoKey];
        codeModalTitle.textContent = info[lang] + ' - ' + (lang === 'en' ? 'Source Code' : '源代码');

        const tabContainer = codeTabs;
        const contentContainer = codeContent;
        tabContainer.innerHTML = '';
        contentContainer.innerHTML = '';

        const languages = [
            { key: 'c', label: 'C' },
            { key: 'cpp', label: 'C++' },
            { key: 'python', label: 'Python' },
            { key: 'rust', label: 'Rust' },
            { key: 'javascript', label: 'JavaScript' },
            { key: 'typescript', label: 'TypeScript' },
        ];

        let first = true;
        for (const langItem of languages) {
            const code = CODE_SAMPLES[algoKey]?.[langItem.key];
            if (!code) continue;

            const tab = document.createElement('button');
            tab.className = 'code-tab' + (first ? ' active' : '');
            tab.textContent = langItem.label;
            tab.dataset.lang = langItem.key;
            tab.addEventListener('click', function () { switchCodeTab(langItem.key); });
            tabContainer.appendChild(tab);

            const pre = document.createElement('pre');
            pre.className = 'code-block' + (first ? ' active' : '');
            pre.dataset.lang = langItem.key;
            const codeEl = document.createElement('code');
            codeEl.textContent = code;
            pre.appendChild(codeEl);
            contentContainer.appendChild(pre);

            first = false;
        }

        codeModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function switchCodeTab(lang) {
        codeTabs.querySelectorAll('.code-tab').forEach(function (t) { t.classList.remove('active'); });
        codeContent.querySelectorAll('.code-block').forEach(function (b) { b.classList.remove('active'); });
        const tab = codeTabs.querySelector('.code-tab[data-lang="' + lang + '"]');
        const block = codeContent.querySelector('.code-block[data-lang="' + lang + '"]');
        if (tab) tab.classList.add('active');
        if (block) block.classList.add('active');
    }

    function closeCodeModal() {
        codeModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    function copyCodeContent() {
        const activeBlock = codeContent.querySelector('.code-block.active code');
        if (!activeBlock) return;
        const text = activeBlock.textContent;
        navigator.clipboard.writeText(text).then(function () {
            const btn = $('btn-copy-code');
            const orig = btn.innerHTML;
            btn.innerHTML = getLang() === 'en' ? '✓ Copied!' : '✓ 已复制!';
            setTimeout(function () { btn.innerHTML = orig; }, 2000);
        }).catch(function () {});
    }

    // ===========================
    //  Mode Toggle (Single ↔ Race)
    // ===========================
    function toggleMode() {
        if (state.sorting) return;
        const isRace = state.mode === 'race';
        state.mode = isRace ? 'single' : 'race';
        const lang = getLang();
        btnModeToggle.innerHTML = '<i class="fas fa-exchange-alt"></i> <span>' +
            (state.mode === 'race'
                ? (lang === 'en' ? 'Single Mode' : '单机模式')
                : (lang === 'en' ? 'Race Mode' : '竞技模式')) +
            '</span>';
        if (state.mode === 'race') {
            singleModeUI.style.display = 'none';
            raceModeUI.style.display = 'block';
            document.getElementById('comparison-table-section').style.display = 'none';
            raceGrid.innerHTML = '';
            stopAnimation();
            resetAll(false);
        } else {
            singleModeUI.style.display = 'block';
            raceModeUI.style.display = 'none';
            document.getElementById('comparison-table-section').style.display = 'none';
            stopAnimation();
            resetAll(false);
        }
    }

    // ===========================
    //  Race Start
    // ===========================
    function startRace() {
        if (state.sorting) return;
        const checkboxes = raceAlgos.querySelectorAll('input[type="checkbox"]:checked');
        const algoKeys = Array.from(checkboxes).map(cb => cb.value);
        if (algoKeys.length < 2) {
            alert(getLang() === 'en'
                ? 'Please select at least 2 algorithms for the race!'
                : '请至少选择2个算法参加竞赛！');
            return;
        }
        document.getElementById('comparison-table-section').style.display = 'none';
        const size = state.size;
        const arr = generateArray(size);
        stopAnimation();
        resetAll(false);
        raceGrid.innerHTML = '';
        state.raceController = new RaceController();
        state.sorting = true;
        state.finished = false;
        const lang = getLang();
        for (const key of algoKeys) {
            if (!ALGORITHMS[key]) continue;
            const info = ALGORITHMS[key];
            const name = info.name[lang] || key;
            const col = document.createElement('div');
            col.className = 'race-chart-column';
            col.dataset.algo = key;
            const header = document.createElement('div');
            header.className = 'race-chart-header';
            header.innerHTML =
                '<span class="race-algo-name">' + name + '</span>' +
                '<button class="btn-action btn-secondary btn-sm" title="View Code">' +
                '  <i class="fas fa-code"></i>' +
                '</button>';
            header.querySelector('button').addEventListener('click', function () { openCodeModal(key); });
            col.appendChild(header);
            const infoBar = document.createElement('div');
            infoBar.className = 'race-chart-info';
            infoBar.innerHTML =
                '<span class="race-stat"><span class="race-stat-label">' + (lang === 'en' ? 'Comp:' : '比较:') + '</span> <span class="race-stat-val" id="race-comp-' + key + '">0</span></span>' +
                '<span class="race-stat"><span class="race-stat-label">' + (lang === 'en' ? 'Swap:' : '交换:') + '</span> <span class="race-stat-val" id="race-swap-' + key + '">0</span></span>' +
                '<span class="race-stat"><span class="race-stat-label">' + (lang === 'en' ? 'Time:' : '用时:') + '</span> <span class="race-stat-val" id="race-time-' + key + '">0.000s</span></span>';
            col.appendChild(infoBar);
            const chart = document.createElement('div');
            chart.className = 'race-chart';
            col.appendChild(chart);
            raceGrid.appendChild(col);
            const runner = new AlgorithmRunner(key, [...arr], ALGO_INFO[key]);
            state.raceController.addRunner(runner);
        }
        state.raceController.start();
        function raceLoop() {
            if (!state.sorting || !state.raceController || state.raceController.finished) {
                if (state.raceController && state.raceController.finished) {
                    onRaceFinished();
                }
                state.sorting = false;
                return;
            }
            const alive = state.raceController.stepAll();
            state.raceController.renderAll();
            for (const runner of state.raceController.runners) {
                const result = runner.getResult();
                const compEl = document.getElementById('race-comp-' + runner.algoKey);
                const swapEl = document.getElementById('race-swap-' + runner.algoKey);
                const timeEl = document.getElementById('race-time-' + runner.algoKey);
                if (compEl) compEl.textContent = result.comparisons;
                if (swapEl) swapEl.textContent = result.swaps;
                if (timeEl) timeEl.textContent = (result.timeMs / 1000).toFixed(3) + 's';
            }
            if (alive) {
                requestAnimationFrame(raceLoop);
            } else {
                if (state.raceController && state.raceController.finished) {
                    onRaceFinished();
                }
                state.sorting = false;
            }
        }
        requestAnimationFrame(raceLoop);
    }

    function onRaceFinished() {
        if (!state.raceController) return;
        const results = state.raceController.getAllResults();
        renderComparisonTable(results);
        const section = document.getElementById('comparison-table-section');
        section.style.display = 'block';
    }

    // ===========================
    function wrappedSnapshots(gen, arr) {
        const g = gen(arr);
        let last = { comps: 0, swps: 0 };

        return {
            next() {
                const result = g.next();
                if (result.done) return { done: true };

                const snap = result.value;
                // The generators yield additional fields after the standard 4
                if (snap.comparisons !== undefined) {
                    last = { comps: snap.comparisons, swps: snap.swaps };
                }
                return {
                    value: {
                        array: snap.array,
                        states: snap.states,
                        description: snap.description,
                        comparisons: last.comps,
                        swaps: last.swps,
                    },
                    done: false,
                };
            },
        };
    }

    // ===========================
    //  Render
    // ===========================
    function renderBars(snap) {
        const arr = snap.array;
        const barStates = snap.states;
        const maxVal = Math.max(...arr, 1);
        const containerHeight = chartArea.clientHeight || 300;

        // Ensure correct number of bar elements
        while (chartArea.children.length < arr.length) {
            const bar = document.createElement('div');
            bar.className = 'bar bar-default';
            chartArea.appendChild(bar);
        }
        while (chartArea.children.length > arr.length) {
            chartArea.removeChild(chartArea.lastChild);
        }

        for (let i = 0; i < arr.length; i++) {
            const bar = chartArea.children[i];
            const heightPct = (arr[i] / maxVal) * 100;
            bar.style.height = Math.max(2, (heightPct / 100) * containerHeight) + 'px';
            bar.className = 'bar ' + (barStates[i] || BAR_STATE.DEFAULT);
        }

        // Update stats
        statComparisons.textContent = snap.comparisons || 0;
        statSwaps.textContent = snap.swaps || 0;

        // Update step description
        if (snap.description) {
            updateStepText(snap.description);
        }
    }

    function updateStepText(text) {
        stepText.textContent = text;
    }

    // ===========================
    //  Animation engine
    // ===========================
    function getDelayForSpeed(speed) {
        // speed 1-10 maps to 200ms down to 5ms
        const base = 200;
        const min = 5;
        const factor = (speed - 1) / 9; // 0..1
        return Math.round(base - (base - min) * factor);
    }

    function startAnimation() {
        const genObj = wrappedSnapshots(ALGORITHMS[state.algorithm].gen, state.original);

        state.generator = genObj;
        state.sorting = true;
        state.paused = false;
        state.finished = false;
        state.comparisons = 0;
        state.swaps = 0;
        state.stepBuffer = [];
        state.stepIndex = 0;
        state.startTime = performance.now();

        statComparisons.textContent = '0';
        statSwaps.textContent = '0';
        setStatus('sorting');
        startTimer();

        btnStart.style.display = 'none';
        btnPause.style.display = 'inline-flex';
        btnPause.innerHTML = '<i class="fas fa-pause"></i> <span>' + (getLang() === 'en' ? 'Pause' : '暂停') + '</span>';
        btnGenerate.disabled = true;
        algoSelect.disabled = true;
        sizeSlider.disabled = true;

        state.animationId = requestAnimationFrame(function play() {
            const delay = getDelayForSpeed(state.speed);

            if (!state.paused) {
                const result = state.generator.next();
                if (result.done) {
                    finishAnimation();
                    return;
                }
                renderBars(result.value);
                state.comparisons = result.value.comparisons || 0;
                state.swaps = result.value.swaps || 0;
            }

            state.animationId = setTimeout(() => {
                requestAnimationFrame(play);
            }, delay);
        });
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
        btnGenerate.disabled = false;
        algoSelect.disabled = false;
        sizeSlider.disabled = false;
    }

    function pauseAnimation() {
        state.paused = true;
        btnPause.innerHTML = '<i class="fas fa-play"></i> <span>' + (getLang() === 'en' ? 'Resume' : '继续') + '</span>';
        setStatus('paused');
    }

    function resumeAnimation() {
        state.paused = false;
        btnPause.innerHTML = '<i class="fas fa-pause"></i> <span>' + (getLang() === 'en' ? 'Pause' : '暂停') + '</span>';
        setStatus('sorting');
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

    // ===========================
    //  Reset
    // ===========================
    function resetAll(generate = true) {
        stopAnimation();

        if (generate) {
            state.array = generateArray(state.size);
            state.original = [...state.array];
        }

        const maxVal = Math.max(...state.array, 1);
        const states = state.array.map(() => BAR_STATE.DEFAULT);
        renderBars({ array: state.array, states, description: '', comparisons: 0, swaps: 0 });

        statComparisons.textContent = '0';
        statSwaps.textContent = '0';
        statTime.textContent = '0.000s';
        setStatus('ready');
        updateStepTextByLang('ready');

        btnStart.style.display = 'inline-flex';
        btnStart.innerHTML = '<i class="fas fa-play"></i> <span>' + (getLang() === 'en' ? 'Start' : '开始排序') + '</span>';
        btnStart.disabled = false;
        btnPause.style.display = 'none';
        btnGenerate.disabled = false;
        algoSelect.disabled = false;
        sizeSlider.disabled = false;
        state.finished = false;
    }

    // ===========================
    //  Timer
    // ===========================
    function startTimer() {
        state.startTime = performance.now();
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
        // Final time update
        if (state.startTime) {
            const elapsed = (performance.now() - state.startTime) / 1000;
            statTime.textContent = formatTime(elapsed);
        }
    }

    // ===========================
    //  Status
    // ===========================
    function setStatus(key) {
        const msgs = {
            ready:     { zh: '就绪', en: 'Ready' },
            sorting:   { zh: '排序中...', en: 'Sorting...' },
            paused:    { zh: '已暂停', en: 'Paused' },
            completed: { zh: '已完成 ✓', en: 'Completed ✓' },
        };
        const lang = getLang();
        const msg = msgs[key] || msgs.ready;
        statStatus.textContent = msg[lang] || msg.zh;
        statStatus.className = 'stat-value status-' + key;
    }

    function updateStepTextByLang(key) {
        const msgs = {
            ready: { zh: '选择算法并点击「开始排序」查看可视化过程', en: 'Select an algorithm and click Start to visualize' },
        };
        const lang = getLang();
        const msg = msgs[key];
        if (msg) stepText.textContent = msg[lang] || msg.zh;
    }

    // ===========================
    //  Event Handlers
    // ===========================
    function onAlgoChange() {
        if (state.sorting) return;
        state.algorithm = algoSelect.value;
        resetAll(true);
    }

    function onSizeChange() {
        if (state.sorting) return;
        state.size = parseInt(sizeSlider.value);
        sizeValue.textContent = state.size;
        resetAll(true);
    }

    function onSpeedChange() {
        state.speed = parseInt(speedSlider.value);
        speedValue.textContent = state.speed + 'x';
    }

    function onGenerate() {
        if (state.sorting) return;
        resetAll(true);
    }

    function onStart() {
        if (state.sorting) return;
        resetAll(false);
        state.original = [...state.array];
        startAnimation();
    }

    function onPauseToggle() {
        if (!state.sorting) return;
        if (state.paused) {
            resumeAnimation();
        } else {
            pauseAnimation();
        }
    }

    function onReset() {
        stopAnimation();
        resetAll(false);
    }

    // ===========================
    //  I18n update (responds to sitewide language change)
    // ===========================
    function onLanguageChange() {
        // The global language.js handles data-zh/data-en attributes.
        // We need to update dynamic text that isn't in data attributes.

        if (!state.sorting) {
            if (state.finished) {
                btnStart.innerHTML = '<i class="fas fa-check"></i> <span>' + (getLang() === 'en' ? 'Completed' : '已完成') + '</span>';
            } else {
                btnStart.innerHTML = '<i class="fas fa-play"></i> <span>' + (getLang() === 'en' ? 'Start' : '开始排序') + '</span>';
            }
        }

        if (state.paused) {
            btnPause.innerHTML = '<i class="fas fa-play"></i> <span>' + (getLang() === 'en' ? 'Resume' : '继续') + '</span>';
        } else if (state.sorting) {
            btnPause.innerHTML = '<i class="fas fa-pause"></i> <span>' + (getLang() === 'en' ? 'Pause' : '暂停') + '</span>';
        }

        // Update step description if in ready state
        if (!state.sorting && !state.finished) {
            updateStepTextByLang('ready');
        }
    }

    // ===========================
    //  Init
    // ===========================
    function init() {
        // Load i18n for algorithm options
        const lang = getLang();
        const options = algoSelect.querySelectorAll('option');
        options.forEach(opt => {
            const val = opt.value;
            if (ALGORITHMS[val]) {
                opt.textContent = ALGORITHMS[val].name[lang] || opt.textContent;
            }
        });

        // Initial array
        state.size = parseInt(sizeSlider.value);
        state.algorithm = algoSelect.value;
        state.speed = parseInt(speedSlider.value);
        sizeValue.textContent = state.size;
        speedValue.textContent = state.speed + 'x';

        state.array = generateArray(state.size);
        state.original = [...state.array];
        resetAll(false);

        // Bind events
        algoSelect.addEventListener('change', onAlgoChange);
        sizeSlider.addEventListener('input', onSizeChange);
        speedSlider.addEventListener('input', onSpeedChange);
        btnGenerate.addEventListener('click', onGenerate);
        btnStart.addEventListener('click', onStart);
        btnPause.addEventListener('click', onPauseToggle);
        btnReset.addEventListener('click', onReset);
        btnViewCode.addEventListener('click', function () { openCodeModal(state.algorithm); });
        btnModeToggle.addEventListener('click', toggleMode);
        codeModalClose.addEventListener('click', closeCodeModal);
        $('btn-copy-code').addEventListener('click', copyCodeContent);
        $('btn-race-start').addEventListener('click', startRace);
        // Close modal on overlay click
        codeModal.addEventListener('click', function (e) { if (e.target === codeModal) closeCodeModal(); });
        // Keyboard: ESC to close modal
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCodeModal(); });

        // Listen for language changes from the sitewide system
        window.addEventListener('sitewide-language-change', onLanguageChange);

        // Also re-bind on body class change (fallback)
        const observer = new MutationObserver(() => {
            onLanguageChange();
            // Update algorithm select labels
            const langNow = getLang();
            const opts = algoSelect.querySelectorAll('option');
            opts.forEach(opt => {
                const val = opt.value;
                if (ALGORITHMS[val]) {
                    opt.textContent = ALGORITHMS[val].name[langNow] || opt.textContent;
                }
            });
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        // Handle window resize for bar height recalculation
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (!state.sorting && state.array.length > 0) {
                    const states = state.array.map(() => BAR_STATE.DEFAULT);
                    renderBars({ array: state.array, states, description: '', comparisons: 0, swaps: 0 });
                }
            }, 200);
        });

        console.log('Sort Visualizer initialized');
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
