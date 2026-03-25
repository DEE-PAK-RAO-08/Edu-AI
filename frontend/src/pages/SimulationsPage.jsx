import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// PROJECTILE MOTION SIMULATOR
// ============================================
function ProjectileSimulator() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [velocity, setVelocity] = useState(30);
  const [angle, setAngle] = useState(45);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({ maxHeight: 0, range: 0, time: 0 });

  const simulate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const g = 9.8;
    const rad = (angle * Math.PI) / 180;
    const vx = velocity * Math.cos(rad);
    const vy = velocity * Math.sin(rad);
    const totalTime = (2 * vy) / g;
    const maxH = (vy * vy) / (2 * g);
    const range = vx * totalTime;

    setStats({ maxHeight: maxH.toFixed(1), range: range.toFixed(1), time: totalTime.toFixed(2) });

    const scale = Math.min(canvas.width / (range * 1.2 || 1), canvas.height / (maxH * 1.4 || 1), 5);
    let t = 0;
    const dt = 0.02;
    const trail = [];

    const draw = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Ground
      ctx.strokeStyle = 'rgba(46, 204, 113, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 30);
      ctx.lineTo(canvas.width, canvas.height - 30);
      ctx.stroke();

      // Trail
      ctx.strokeStyle = 'rgba(108, 92, 231, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      trail.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Ball
      const x = vx * t;
      const y = vy * t - 0.5 * g * t * t;
      const px = 40 + x * scale;
      const py = canvas.height - 30 - y * scale;

      trail.push({ x: px, y: py });

      // Rocket Emoji / Particle
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.save();
      ctx.translate(px, py);
      // Rotate based on trajectory tangent
      const currTangent = Math.atan2(-(vy - g * t), vx);
      ctx.rotate(currTangent);
      ctx.fillText('🚀', 0, 0);
      ctx.restore();

      t += dt;
      if (y >= 0 && t <= totalTime + 0.1) {
        animRef.current = requestAnimationFrame(draw);
      } else {
        setRunning(false);
      }
    };

    draw();
  }, [velocity, angle]);

  const handleLaunch = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setRunning(true);
    simulate();
  };

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  // Initial draw empty state
  useEffect(() => {
    if(!running && stats.time === 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(46, 204, 113, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 30);
      ctx.lineTo(canvas.width, canvas.height - 30);
      ctx.stroke();
      ctx.font = '24px Arial';
      ctx.fillText('🚀', 40, canvas.height - 30);
    }
  }, [running, stats.time]);

  return (
    <div>
      <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🚀 Projectile Motion Simulator</h3>
      <div className="sim-controls">
        <div className="sim-slider-group">
          <label>Velocity: {velocity} m/s</label>
          <input type="range" className="sim-slider" min="5" max="80" value={velocity} onChange={e => setVelocity(+e.target.value)} disabled={running} />
        </div>
        <div className="sim-slider-group">
          <label>Angle: {angle}°</label>
          <input type="range" className="sim-slider" min="5" max="85" value={angle} onChange={e => setAngle(+e.target.value)} disabled={running} />
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleLaunch} disabled={running}>
          {running ? '⏳ Flying...' : '🚀 Launch Rocket'}
        </button>
      </div>
      <div className="sim-canvas-wrapper" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
        <canvas ref={canvasRef} width={800} height={400} />
        <div className="sim-info-overlay" style={{ top: 16, left: 16, right: 'auto', bottom: 'auto', textAlign: 'left', background: 'rgba(15,23,42,0.8)', padding: '16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)' }}>
          <div style={{ marginBottom: 4, color: '#a8b8c8' }}>Max Height <strong style={{ color: '#fff', marginLeft: 8 }}>{stats.maxHeight}m</strong></div>
          <div style={{ marginBottom: 4, color: '#a8b8c8' }}>Range <strong style={{ color: '#fff', marginLeft: 8 }}>{stats.range}m</strong></div>
          <div style={{ color: '#a8b8c8' }}>Air Time <strong style={{ color: '#fff', marginLeft: 8 }}>{stats.time}s</strong></div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SORTING ALGORITHM VISUALIZER
// ============================================

const ALGO_INFO = {
  bubble: {
    name: 'Bubble Sort',
    emoji: '🫧',
    timeAvg: 'O(n²)',
    timeBest: 'O(n)',
    timeWorst: 'O(n²)',
    space: 'O(1)',
    stable: true,
    description: 'Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted. Largest elements "bubble" to the end.',
    bestCase: 'Already sorted array — only one pass needed with no swaps.',
    worstCase: 'Reverse sorted array — every element must bubble all the way across.'
  },
  selection: {
    name: 'Selection Sort',
    emoji: '👆',
    timeAvg: 'O(n²)',
    timeBest: 'O(n²)',
    timeWorst: 'O(n²)',
    space: 'O(1)',
    stable: false,
    description: 'Divides the list into a sorted and unsorted region. Repeatedly finds the minimum element from the unsorted region and moves it to the end of the sorted region. Simple but inefficient on large lists.',
    bestCase: 'Performance is the same regardless — always scans the entire unsorted portion.',
    worstCase: 'Same O(n²) comparisons in all cases, but more swaps when reverse sorted.'
  },
  insertion: {
    name: 'Insertion Sort',
    emoji: '📥',
    timeAvg: 'O(n²)',
    timeBest: 'O(n)',
    timeWorst: 'O(n²)',
    space: 'O(1)',
    stable: true,
    description: 'Builds the sorted array one element at a time by picking each element and inserting it into its correct position among the previously sorted elements. Very efficient for small or nearly sorted datasets.',
    bestCase: 'Nearly sorted array — each element needs minimal shifting.',
    worstCase: 'Reverse sorted array — each element must shift past all previous elements.'
  },
  quick: {
    name: 'Quick Sort',
    emoji: '⚡',
    timeAvg: 'O(n log n)',
    timeBest: 'O(n log n)',
    timeWorst: 'O(n²)',
    space: 'O(log n)',
    stable: false,
    description: 'A divide-and-conquer algorithm that selects a "pivot" element, partitions the array around the pivot (elements less than pivot go left, greater go right), then recursively sorts the sub-arrays. One of the fastest general-purpose sorting algorithms.',
    bestCase: 'Pivot consistently divides the array into two equal halves.',
    worstCase: 'Pivot is always the smallest or largest element (already sorted array with first element as pivot).'
  },
  merge: {
    name: 'Merge Sort',
    emoji: '🔀',
    timeAvg: 'O(n log n)',
    timeBest: 'O(n log n)',
    timeWorst: 'O(n log n)',
    space: 'O(n)',
    stable: true,
    description: 'Divides the array into halves recursively until each sub-array has one element, then merges them back together in sorted order. Guarantees O(n log n) performance but requires extra memory for merging.',
    bestCase: 'Performance is consistent — always O(n log n) regardless of input.',
    worstCase: 'Same time complexity but uses O(n) additional space for temporary arrays.'
  },
  cocktail: {
    name: 'Cocktail Shaker Sort',
    emoji: '🍸',
    timeAvg: 'O(n²)',
    timeBest: 'O(n)',
    timeWorst: 'O(n²)',
    space: 'O(1)',
    stable: true,
    description: 'A variation of Bubble Sort that sorts in both directions — first left to right, then right to left — in each pass. This bidirectional approach helps move elements to their correct position faster, especially "turtles" (small elements near the end).',
    bestCase: 'Already sorted array — detects no swaps in first pass and stops early.',
    worstCase: 'Reverse sorted array — but still slightly faster than Bubble Sort in practice.'
  }
};

function SortingVisualizer() {
  const [array, setArray] = useState([]);
  const [sorting, setSorting] = useState(false);
  const [algo, setAlgo] = useState('bubble');
  const [highlights, setHighlights] = useState([]);
  const [pivotIdx, setPivotIdx] = useState(null); // For Quick Sort pivot highlight
  const [sorted, setSorted] = useState([]);
  const stopRef = useRef(false);

  const generateArray = useCallback(() => {
    const arr = Array.from({ length: 12 }, () => Math.floor(Math.random() * 89) + 10);
    setArray(arr);
    setHighlights([]);
    setSorted([]);
    setPivotIdx(null);
    stopRef.current = false;
  }, []);

  useEffect(() => { generateArray(); }, [generateArray]);

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // ---- BUBBLE SORT ----
  const bubbleSort = async () => {
    const arr = [...array];
    for (let i = 0; i < arr.length && !stopRef.current; i++) {
      for (let j = 0; j < arr.length - i - 1 && !stopRef.current; j++) {
        setHighlights([j, j + 1]);
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
        }
        await sleep(200);
      }
      setSorted(p => [...p, arr.length - i - 1]);
    }
    setSorted(arr.map((_, i) => i));
  };

  // ---- SELECTION SORT ----
  const selectionSort = async () => {
    const arr = [...array];
    for (let i = 0; i < arr.length && !stopRef.current; i++) {
      let min = i;
      for (let j = i + 1; j < arr.length && !stopRef.current; j++) {
        setHighlights([min, j]);
        if (arr[j] < arr[min]) min = j;
        await sleep(180);
      }
      [arr[i], arr[min]] = [arr[min], arr[i]];
      setArray([...arr]);
      setSorted(p => [...p, i]);
    }
    setSorted(arr.map((_, i) => i));
  };

  // ---- INSERTION SORT ----
  const insertionSort = async () => {
    const arr = [...array];
    setSorted(p => [...p, 0]); // first element is "sorted"
    for (let i = 1; i < arr.length && !stopRef.current; i++) {
      let key = arr[i];
      let j = i - 1;
      setHighlights([i]);
      await sleep(250);
      while (j >= 0 && arr[j] > key && !stopRef.current) {
        setHighlights([j, j + 1]);
        arr[j + 1] = arr[j];
        setArray([...arr]);
        await sleep(200);
        j--;
      }
      arr[j + 1] = key;
      setArray([...arr]);
      setSorted(p => [...new Set([...p, ...Array.from({ length: i + 1 }, (_, k) => k)])]);
      await sleep(150);
    }
    setSorted(arr.map((_, i) => i));
  };

  // ---- QUICK SORT ----
  const quickSort = async () => {
    const arr = [...array];
    const partition = async (low, high) => {
      if (stopRef.current) return low;
      const pivot = arr[high];
      setPivotIdx(high);
      let i = low - 1;
      for (let j = low; j < high && !stopRef.current; j++) {
        setHighlights([j, high]);
        await sleep(250);
        if (arr[j] < pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          setArray([...arr]);
          await sleep(150);
        }
      }
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      setArray([...arr]);
      setSorted(p => [...new Set([...p, i + 1])]);
      setPivotIdx(null);
      return i + 1;
    };

    const sort = async (low, high) => {
      if (low < high && !stopRef.current) {
        const pi = await partition(low, high);
        await sort(low, pi - 1);
        await sort(pi + 1, high);
      }
      if (low === high) setSorted(p => [...new Set([...p, low])]);
    };

    await sort(0, arr.length - 1);
    setSorted(arr.map((_, i) => i));
  };

  // ---- MERGE SORT ----
  const mergeSort = async () => {
    const arr = [...array];

    const merge = async (l, m, r) => {
      if (stopRef.current) return;
      const left = arr.slice(l, m + 1);
      const right = arr.slice(m + 1, r + 1);
      let i = 0, j = 0, k = l;

      while (i < left.length && j < right.length && !stopRef.current) {
        setHighlights([k, l + i, m + 1 + j]);
        await sleep(250);
        if (left[i] <= right[j]) {
          arr[k] = left[i]; i++;
        } else {
          arr[k] = right[j]; j++;
        }
        setArray([...arr]);
        k++;
      }
      while (i < left.length && !stopRef.current) {
        arr[k] = left[i]; i++; k++;
        setArray([...arr]);
        await sleep(100);
      }
      while (j < right.length && !stopRef.current) {
        arr[k] = right[j]; j++; k++;
        setArray([...arr]);
        await sleep(100);
      }
      // Mark merged section
      const mergedIndices = Array.from({ length: r - l + 1 }, (_, idx) => l + idx);
      setHighlights(mergedIndices);
      await sleep(200);
    };

    const sort = async (l, r) => {
      if (l < r && !stopRef.current) {
        const m = Math.floor((l + r) / 2);
        await sort(l, m);
        await sort(m + 1, r);
        await merge(l, m, r);
      }
    };

    await sort(0, arr.length - 1);
    setSorted(arr.map((_, i) => i));
  };

  // ---- COCKTAIL SHAKER SORT ----
  const cocktailSort = async () => {
    const arr = [...array];
    let start = 0, end = arr.length - 1, swapped = true;

    while (swapped && !stopRef.current) {
      swapped = false;
      // Forward pass
      for (let i = start; i < end && !stopRef.current; i++) {
        setHighlights([i, i + 1]);
        if (arr[i] > arr[i + 1]) {
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
          setArray([...arr]);
          swapped = true;
        }
        await sleep(180);
      }
      setSorted(p => [...new Set([...p, end])]);
      end--;

      if (!swapped) break;
      swapped = false;

      // Backward pass
      for (let i = end; i > start && !stopRef.current; i--) {
        setHighlights([i, i - 1]);
        if (arr[i] < arr[i - 1]) {
          [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
          setArray([...arr]);
          swapped = true;
        }
        await sleep(180);
      }
      setSorted(p => [...new Set([...p, start])]);
      start++;
    }
    setSorted(arr.map((_, i) => i));
  };

  const startSort = async () => {
    setSorting(true);
    stopRef.current = false;
    setPivotIdx(null);
    switch (algo) {
      case 'bubble': await bubbleSort(); break;
      case 'selection': await selectionSort(); break;
      case 'insertion': await insertionSort(); break;
      case 'quick': await quickSort(); break;
      case 'merge': await mergeSort(); break;
      case 'cocktail': await cocktailSort(); break;
      default: await bubbleSort();
    }
    setSorting(false);
    setHighlights([]);
    setPivotIdx(null);
  };

  const stopSort = () => {
    stopRef.current = true;
    setSorting(false);
    setPivotIdx(null);
  };

  const info = ALGO_INFO[algo];

  return (
    <div>
      <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📊 Algorithm Visualizer</h3>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="form-input" style={{ width: 'auto' }} value={algo} onChange={e => { setAlgo(e.target.value); if (!sorting) { generateArray(); } }} disabled={sorting}>
          <option value="bubble">🫧 Bubble Sort</option>
          <option value="selection">👆 Selection Sort</option>
          <option value="insertion">📥 Insertion Sort</option>
          <option value="quick">⚡ Quick Sort</option>
          <option value="merge">🔀 Merge Sort</option>
          <option value="cocktail">🍸 Cocktail Shaker Sort</option>
        </select>
        <button className="btn btn-primary btn-sm" onClick={startSort} disabled={sorting}>
          {sorting ? '⏳ Sorting...' : '▶️ Start'}
        </button>
        <button className="btn btn-danger btn-sm" onClick={stopSort} disabled={!sorting}>⏹ Stop</button>
        <button className="btn btn-secondary btn-sm" onClick={generateArray} disabled={sorting}>🔄 New Array</button>
      </div>

      {/* Visualization Area */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 180, padding: '24px 16px', background: '#0f172a', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 20, flexWrap: 'wrap' }}>
        {array.map((val, i) => {
          let bg = 'rgba(52, 152, 219, 0.2)';
          let border = '2px solid #3498db';
          let textColor = '#3498db';
          let scale = 1;
          let label = '';

          if (sorted.includes(i)) {
            bg = 'rgba(46, 204, 113, 0.2)';
            border = '2px solid #2ecc71';
            textColor = '#2ecc71';
          } else if (pivotIdx === i) {
            bg = 'rgba(155, 89, 182, 0.3)';
            border = '2px solid #9b59b6';
            textColor = '#9b59b6';
            scale = 1.1;
            label = 'PIVOT';
          } else if (highlights.includes(i)) {
            bg = 'rgba(231, 76, 60, 0.2)';
            border = '2px solid #e74c3c';
            textColor = '#e74c3c';
            scale = 1.15;
          }

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              {label && <span style={{ fontSize: 9, color: '#9b59b6', fontWeight: 700, letterSpacing: 1 }}>{label}</span>}
              <div
                style={{
                  width: 50,
                  height: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: bg,
                  border: border,
                  borderRadius: '12px',
                  color: textColor,
                  fontSize: 20,
                  fontWeight: 700,
                  transform: `scale(${scale}) translateY(${highlights.includes(i) ? '-8px' : '0'})`,
                  transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  boxShadow: highlights.includes(i) ? '0 10px 20px rgba(231, 76, 60, 0.3)' : pivotIdx === i ? '0 8px 20px rgba(155, 89, 182, 0.3)' : '0 4px 10px rgba(0,0,0,0.2)'
                }}
              >
                {val}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
          <div style={{ width: 14, height: 14, borderRadius: 4, border: '2px solid #e74c3c', background: 'rgba(231,76,60,0.2)' }} />
          Comparing
        </div>
        {algo === 'quick' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, border: '2px solid #9b59b6', background: 'rgba(155,89,182,0.3)' }} />
            Pivot
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
          <div style={{ width: 14, height: 14, borderRadius: 4, border: '2px solid #2ecc71', background: 'rgba(46,204,113,0.2)' }} />
          Sorted
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
          <div style={{ width: 14, height: 14, borderRadius: 4, border: '2px solid #3498db', background: 'rgba(52,152,219,0.2)' }} />
          Unsorted
        </div>
      </div>

      {/* Algorithm Explanation Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.08), rgba(52, 152, 219, 0.08))',
        border: '1px solid rgba(108, 92, 231, 0.2)',
        borderRadius: 16,
        padding: '20px 24px',
        animation: 'fadeIn 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 28 }}>{info.emoji}</span>
          <div>
            <h4 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#fff' }}>{info.name}</h4>
            <span style={{ fontSize: 12, color: info.stable ? '#2ecc71' : '#e67e22', fontWeight: 600 }}>
              {info.stable ? '✅ Stable' : '⚠️ Not Stable'}
            </span>
          </div>
        </div>

        <p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
          {info.description}
        </p>

        {/* Complexity Badges */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ background: 'rgba(46, 204, 113, 0.12)', border: '1px solid rgba(46, 204, 113, 0.25)', borderRadius: 10, padding: '8px 14px', flex: '1', minWidth: 120 }}>
            <div style={{ fontSize: 10, color: '#2ecc71', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Best Case</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{info.timeBest}</div>
          </div>
          <div style={{ background: 'rgba(241, 196, 15, 0.12)', border: '1px solid rgba(241, 196, 15, 0.25)', borderRadius: 10, padding: '8px 14px', flex: '1', minWidth: 120 }}>
            <div style={{ fontSize: 10, color: '#f1c40f', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Average</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{info.timeAvg}</div>
          </div>
          <div style={{ background: 'rgba(231, 76, 60, 0.12)', border: '1px solid rgba(231, 76, 60, 0.25)', borderRadius: 10, padding: '8px 14px', flex: '1', minWidth: 120 }}>
            <div style={{ fontSize: 10, color: '#e74c3c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Worst Case</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{info.timeWorst}</div>
          </div>
          <div style={{ background: 'rgba(52, 152, 219, 0.12)', border: '1px solid rgba(52, 152, 219, 0.25)', borderRadius: 10, padding: '8px 14px', flex: '1', minWidth: 120 }}>
            <div style={{ fontSize: 10, color: '#3498db', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Space</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{info.space}</div>
          </div>
        </div>

        {/* When to use section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: 'rgba(46, 204, 113, 0.06)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(46,204,113,0.12)' }}>
            <div style={{ fontSize: 11, color: '#2ecc71', fontWeight: 700, marginBottom: 4 }}>✅ Best Case Scenario</div>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>{info.bestCase}</p>
          </div>
          <div style={{ background: 'rgba(231, 76, 60, 0.06)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(231,76,60,0.12)' }}>
            <div style={{ fontSize: 11, color: '#e74c3c', fontWeight: 700, marginBottom: 4 }}>⚠️ Worst Case Scenario</div>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>{info.worstCase}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SOLAR SYSTEM SIMULATOR (NEW)
// ============================================
function SolarSystemSimulator() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [running, setRunning] = useState(true);
  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  const starsRef = useRef([]);

  // Generate static star field
  useEffect(() => {
    starsRef.current = Array.from({ length: 200 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.5 + 0.5,
      brightness: Math.random() * 0.5 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005
    }));
  }, []);

  // Planet facts for tooltip
  const planetFacts = {
    Sun: 'The Sun is a G-type main-sequence star, containing 99.86% of the solar system mass.',
    Mercury: 'Smallest planet. Orbits the Sun in just 88 Earth days.',
    Venus: 'Hottest planet at ~465°C. Rotates backwards (retrograde).',
    Earth: 'The only known planet to harbor life. Has 1 natural satellite.',
    Mars: 'The Red Planet. Home to Olympus Mons, the tallest volcano.',
    Jupiter: 'Largest planet. Has 95 known moons including Ganymede.',
    Saturn: 'Famous for its icy rings. Least dense planet — it could float on water!',
    Uranus: 'An ice giant tilted 98°. Rotates on its side.',
    Neptune: 'Farthest planet. Winds reach 2,100 km/h — fastest in the solar system.'
  };

  // Initial celestial bodies — all 8 planets + Sun
  const bodiesRef = useRef([
    { name: 'Sun', r: 0, size: 28, color: '#f1c40f', speed: 0, angle: 0, glow: '#f39c12' },
    { name: 'Mercury', r: 48, size: 4, color: '#bdc3c7', speed: 0.04, angle: Math.random() * Math.PI * 2 },
    { name: 'Venus', r: 72, size: 7, color: '#e67e22', speed: 0.015, angle: Math.random() * Math.PI * 2 },
    { name: 'Earth', r: 100, size: 8, color: '#3498db', speed: 0.01, angle: Math.random() * Math.PI * 2, moonAngle: 0 },
    { name: 'Mars', r: 135, size: 5, color: '#e74c3c', speed: 0.008, angle: Math.random() * Math.PI * 2 },
    { name: 'Jupiter', r: 190, size: 16, color: '#d35400', speed: 0.004, angle: Math.random() * Math.PI * 2 },
    { name: 'Saturn', r: 245, size: 13, color: '#f0c040', speed: 0.003, angle: Math.random() * Math.PI * 2, hasRings: true },
    { name: 'Uranus', r: 300, size: 10, color: '#5dade2', speed: 0.002, angle: Math.random() * Math.PI * 2 },
    { name: 'Neptune', r: 350, size: 9, color: '#2e4482', speed: 0.001, angle: Math.random() * Math.PI * 2 }
  ]);

  // Handle mouse hover for planet tooltips
  const handleCanvasMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    let found = null;
    bodiesRef.current.forEach(p => {
      const x = cx + p.r * Math.cos(p.angle);
      const y = cy + p.r * Math.sin(p.angle);
      const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
      if (dist < p.size + 8) found = p.name;
    });
    setHoveredPlanet(found);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const time = Date.now() * 0.001;

    // Deep space background — full clear for clean look
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw twinkling stars
    starsRef.current.forEach(star => {
      const twinkle = Math.sin(time * star.twinkleSpeed * 60) * 0.3 + star.brightness;
      ctx.beginPath();
      ctx.arc(star.x * canvas.width, star.y * canvas.height, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, twinkle)})`;
      ctx.fill();
    });

    const bodies = bodiesRef.current;

    bodies.forEach((p) => {
      // update position
      if (running) {
        p.angle += p.speed * speedMultiplier;
      }
      
      const x = cx + p.r * Math.cos(p.angle);
      const y = cy + p.r * Math.sin(p.angle);

      // Draw orbit path
      if(p.r > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Sun glow (multi-layer)
      if(p.r === 0) {
        // Outer glow
        const grd2 = ctx.createRadialGradient(cx, cy, 15, cx, cy, 80);
        grd2.addColorStop(0, 'rgba(243, 156, 18, 0.3)');
        grd2.addColorStop(0.5, 'rgba(241, 196, 15, 0.1)');
        grd2.addColorStop(1, 'transparent');
        ctx.fillStyle = grd2;
        ctx.beginPath();
        ctx.arc(cx, cy, 80, 0, Math.PI * 2);
        ctx.fill();

        // Inner glow
        const grd = ctx.createRadialGradient(cx, cy, 5, cx, cy, 40);
        grd.addColorStop(0, 'rgba(255, 230, 80, 0.8)');
        grd.addColorStop(0.6, 'rgba(241, 196, 15, 0.4)');
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, cy, 40, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Saturn's rings BEFORE the planet body
      if(p.hasRings) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(0.4); // slight tilt
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size + 10, 4, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(210, 180, 120, 0.6)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size + 15, 5.5, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(200, 170, 100, 0.35)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // Draw Planet body
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      // Add a subtle gradient for 3D look
      const pGrd = ctx.createRadialGradient(x - p.size * 0.3, y - p.size * 0.3, p.size * 0.1, x, y, p.size);
      pGrd.addColorStop(0, lightenColor(p.color, 40));
      pGrd.addColorStop(1, p.color);
      ctx.fillStyle = pGrd;
      ctx.fill();

      // Draw Moon for Earth
      if(p.name === 'Earth') {
        if(running) p.moonAngle += 0.05 * speedMultiplier;
        const mx = x + 16 * Math.cos(p.moonAngle);
        const my = y + 16 * Math.sin(p.moonAngle);
        ctx.beginPath();
        ctx.arc(mx, my, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ecf0f1';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI*2);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'left';
      if(p.r === 0) {
        // Sun label — centered below
        ctx.textAlign = 'center';
        ctx.fillText('☀ Sun', cx, cy + p.size + 14);
      } else {
        ctx.fillText(p.name, x + p.size + 5, y + 4);
      }
      ctx.textAlign = 'left';
    });

    animRef.current = requestAnimationFrame(draw);
  }, [speedMultiplier, running]);

  // Utility to lighten a hex color
  function lightenColor(hex, amt) {
    let col = hex.replace('#', '');
    if (col.length === 3) col = col[0]+col[0]+col[1]+col[1]+col[2]+col[2];
    let num = parseInt(col, 16);
    let r = Math.min(255, (num >> 16) + amt);
    let g = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    let b = Math.min(255, (num & 0x0000FF) + amt);
    return `rgb(${r},${g},${b})`;
  }

  useEffect(() => {
    // Fill deep dark background initially
    if(canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(0,0, canvasRef.current.width, canvasRef.current.height);
    }
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <div>
      <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🪐 Solar System Dynamics</h3>
      <div className="sim-controls">
        <button className="btn btn-primary btn-sm" onClick={() => setRunning(!running)}>
          {running ? '⏸ Pause Orbit' : '▶️ Resume Orbit'}
        </button>
        <div className="sim-slider-group">
          <label>Time Speed: {speedMultiplier.toFixed(1)}x</label>
          <input type="range" className="sim-slider" min="0.1" max="5" step="0.1" value={speedMultiplier} onChange={e => setSpeedMultiplier(+e.target.value)} />
        </div>
      </div>
      <div className="sim-canvas-wrapper" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
        <canvas ref={canvasRef} width={800} height={750} onMouseMove={handleCanvasMouseMove} onMouseLeave={() => setHoveredPlanet(null)} style={{ cursor: hoveredPlanet ? 'pointer' : 'default' }} />
        {hoveredPlanet && (
          <div style={{
            position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12,
            padding: '10px 18px', color: '#e2e8f0', fontSize: 13,
            maxWidth: 400, textAlign: 'center', pointerEvents: 'none',
            animation: 'fadeIn 0.2s ease'
          }}>
            <strong style={{ color: '#f1c40f', marginRight: 6 }}>{hoveredPlanet}:</strong>
            {planetFacts[hoveredPlanet]}
          </div>
        )}
      </div>
      <p style={{ marginTop: 12, color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>
        Hover over any planet to learn a fun fact! All 8 planets + the Sun are shown with proportional orbit speeds.
      </p>
    </div>
  );
}

// ============================================
// PENDULUM WAVE & CHAOS (NEW)
// ============================================
function PendulumSimulator() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [gravity, setGravity] = useState(9.8);
  const [damping, setDamping] = useState(0.995);

  const pendulums = useRef(
    Array.from({ length: 15 }, (_, i) => ({
      length: 100 + i * 20,
      angle: Math.PI / 3, // Initial 60 degree swing
      angularV: 0,
      color: `hsl(${i * 24}, 80%, 65%)`
    }))
  );

  const simulate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = 20;

    // Blur effect
    ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 300, cy);
    ctx.lineTo(cx + 300, cy);
    ctx.stroke();

    pendulums.current.forEach(p => {
      // Angular acceleration = -(g/L) * sin(theta)
      // Scale gravity locally to make it look smooth
      const acc = -(gravity * 0.1 / p.length) * Math.sin(p.angle);
      p.angularV += acc;
      p.angularV *= damping; // air resistance
      p.angle += p.angularV;

      const px = cx + p.length * Math.sin(p.angle);
      const py = cy + p.length * Math.cos(p.angle);

      // Draw string
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.stroke();

      // Draw bob
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });

    animRef.current = requestAnimationFrame(simulate);
  }, [gravity, damping]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animRef.current);
  }, [simulate]);

  const resetPendulums = () => {
    pendulums.current.forEach(p => {
      p.angle = Math.PI / 3;
      p.angularV = 0;
    });
  };

  return (
    <div>
      <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🌀 Pendulum Waves</h3>
      <div className="sim-controls">
        <button className="btn btn-secondary btn-sm" onClick={resetPendulums}>🔄 Reset Swing</button>
        <div className="sim-slider-group">
          <label>Gravity: {gravity.toFixed(1)}</label>
          <input type="range" className="sim-slider" min="1" max="25" step="0.1" value={gravity} onChange={e => setGravity(+e.target.value)} />
        </div>
        <div className="sim-slider-group">
          <label>Air Friction (Damping)</label>
          <input type="range" className="sim-slider" min="0.990" max="1" step="0.001" value={damping} onChange={e => setDamping(+e.target.value)} />
        </div>
      </div>
      <div className="sim-canvas-wrapper" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
        <canvas ref={canvasRef} width={800} height={450} />
      </div>
      <p style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>
        Different length pendulums have different orbital periods, creating mesmerizing wave patterns before chaos ensues.
      </p>
    </div>
  );
}

// ============================================
// OPTICS: PRISM REFRACTION (NEW)
// ============================================
function OpticsSimulator() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [angle, setAngle] = useState(0);
  const [wavelength, setWavelength] = useState(500); // 400nm - 700nm

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Prism (Triangle)
    const prismSize = 150;
    ctx.beginPath();
    ctx.moveTo(cx, cy - prismSize);
    ctx.lineTo(cx - prismSize, cy + prismSize);
    ctx.lineTo(cx + prismSize, cy + prismSize);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fill();

    // Incident Beam
    const incidentAngle = (angle * Math.PI) / 180;
    const beamStartX = 50;
    const beamStartY = cy + 50;
    
    // Intersection with left side of prism
    // Prism left edge line: y = mx + b
    // Simple enough for simulation purposes, we'll draw to a fixed point on the prism
    const hitX = cx - 75;
    const hitY = cy + 50;

    ctx.beginPath();
    ctx.moveTo(beamStartX, beamStartY);
    ctx.lineTo(hitX, hitY);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Dispersion (Rainbow)
    const colors = [
      { nm: 400, color: '#9b59b6', offset: 0 },   // Violet
      { nm: 450, color: '#3498db', offset: 5 },   // Blue
      { nm: 500, color: '#2ecc71', offset: 10 },  // Green
      { nm: 580, color: '#f1c40f', offset: 15 },  // Yellow
      { nm: 620, color: '#e67e22', offset: 20 },  // Orange
      { nm: 700, color: '#e74c3c', offset: 25 },  // Red
    ];

    colors.forEach(c => {
      ctx.beginPath();
      ctx.moveTo(hitX, hitY);
      const exitX = cx + 75;
      const exitY = cy + 50 + c.offset;
      ctx.lineTo(exitX, exitY);
      ctx.lineTo(canvas.width - 50, exitY + (exitY - hitY));
      ctx.strokeStyle = c.color;
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 4;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    animRef.current = requestAnimationFrame(draw);
  }, [angle]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <div>
      <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🌈 Light Refraction (Prism)</h3>
      <div className="sim-controls">
        <label>Light Angle: {angle}°</label>
        <input type="range" className="sim-slider" min="-30" max="30" value={angle} onChange={e => setAngle(+e.target.value)} />
      </div>
      <div className="sim-canvas-wrapper" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
        <canvas ref={canvasRef} width={800} height={400} />
      </div>
      <p style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>
        Observe how white light splits into its component colors when passing through a triangular prism due to dispersion.
      </p>
    </div>
  );
}

// ============================================
// WAVE INTERFERENCE SIMULATOR (NEW)
// ============================================
function WaveInterference() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [freq, setFreq] = useState(0.05);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const time = Date.now() * 0.005;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    const s1 = { x: width * 0.3, y: height * 0.5 };
    const s2 = { x: width * 0.7, y: height * 0.5 };

    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const d1 = Math.sqrt((x - s1.x)**2 + (y - s1.y)**2);
        const d2 = Math.sqrt((x - s2.x)**2 + (y - s2.y)**2);
        
        const v1 = Math.sin(d1 * freq - time);
        const v2 = Math.sin(d2 * freq - time);
        const amp = (v1 + v2) / 2;
        
        const brightness = (amp + 1) * 127;
        const baseIdx = (y * width + x) * 4;
        
        // Draw 2x2 blocks for performance
        for(let i=0; i<2; i++) {
          for(let j=0; j<2; j++) {
            const idx = ((y+i) * width + (x+j)) * 4;
            data[idx] = brightness * 0.5;   // R
            data[idx+1] = brightness * 0.8; // G
            data[idx+2] = brightness;       // B
            data[idx+3] = 255;              // A
          }
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Sources
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(s1.x, s1.y, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(s2.x, s2.y, 4, 0, Math.PI*2); ctx.fill();

    animRef.current = requestAnimationFrame(draw);
  }, [freq]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <div>
      <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🌊 Wave Interference</h3>
      <div className="sim-controls">
        <label>Frequency: {freq.toFixed(3)}</label>
        <input type="range" className="sim-slider" min="0.02" max="0.15" step="0.005" value={freq} onChange={e => setFreq(+e.target.value)} />
      </div>
      <div className="sim-canvas-wrapper" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
        <canvas ref={canvasRef} width={800} height={400} />
      </div>
      <p style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>
        Observe constructive and destructive interference patterns between two point sources.
      </p>
    </div>
  );
}

// ============================================
// GRAVITY WELL SIMULATOR (NEW)
// ============================================
function GravityWell() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [mass, setMass] = useState(50);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    // Grid Warp
    ctx.strokeStyle = 'rgba(108, 92, 231, 0.2)';
    ctx.lineWidth = 1;
    const gridSize = 40;

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      for (let y = 0; y <= height; y += 5) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = (mass * 1000) / (dist + 50);
        const angle = Math.atan2(dy, dx);
        
        const px = x - Math.cos(angle) * force;
        const py = y - Math.sin(angle) * force;
        
        if (y === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      for (let x = 0; x <= width; x += 5) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = (mass * 1000) / (dist + 50);
        const angle = Math.atan2(dy, dx);
        
        const px = x - Math.cos(angle) * force;
        const py = y - Math.sin(angle) * force;
        
        if (x === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Singularity / Star
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, mass);
    grd.addColorStop(0, '#fff');
    grd.addColorStop(0.2, '#6c5ce7');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, mass, 0, Math.PI * 2);
    ctx.fill();

    animRef.current = requestAnimationFrame(draw);
  }, [mass]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <div>
      <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🕳️ Spacetime Curvature (Gravity Well)</h3>
      <div className="sim-controls">
        <label>Mass: {mass}</label>
        <input type="range" className="sim-slider" min="10" max="100" value={mass} onChange={e => setMass(+e.target.value)} />
      </div>
      <div className="sim-canvas-wrapper" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
        <canvas ref={canvasRef} width={800} height={500} />
      </div>
      <p style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>
        Visualize how mass warps the fabric of spacetime, creating what we perceive as gravity.
      </p>
    </div>
  );
}

// ============================================
// ELECTRIC FIELD SIMULATOR (NEW)
// ============================================
function ElectricFieldSimulator() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [chargeType, setChargeType] = useState('dipole'); // dipole, same, single

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const charges = [];
    if (chargeType === 'dipole') {
      charges.push({ x: width * 0.35, y: height * 0.5, q: 1 });
      charges.push({ x: width * 0.65, y: height * 0.5, q: -1 });
    } else if (chargeType === 'same') {
      charges.push({ x: width * 0.35, y: height * 0.5, q: 1 });
      charges.push({ x: width * 0.65, y: height * 0.5, q: 1 });
    } else {
      charges.push({ x: width * 0.5, y: height * 0.5, q: 1 });
    }

    // Draw field lines using particles
    ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
    ctx.lineWidth = 1;

    for (let i = 0; i < 20; i++) {
        charges.forEach(c => {
            if(c.q < 0) return; // Lines start from positive
            for(let a=0; a<Math.PI*2; a+=Math.PI/8) {
                let px = c.x + Math.cos(a) * 10;
                let py = c.y + Math.sin(a) * 10;
                ctx.beginPath();
                ctx.moveTo(px, py);
                
                for(let step=0; step<100; step++) {
                    let fx = 0, fy = 0;
                    charges.forEach(oc => {
                        const dx = px - oc.x;
                        const dy = py - oc.y;
                        const d2 = dx*dx + dy*dy;
                        const f = oc.q / (d2 + 100);
                        fx += (dx / Math.sqrt(d2)) * f;
                        fy += (dy / Math.sqrt(d2)) * f;
                    });
                    
                    const mag = Math.sqrt(fx*fx + fy*fy);
                    px += (fx/mag) * 5;
                    py += (fy/mag) * 5;
                    ctx.lineTo(px, py);
                    
                    if(px < 0 || px > width || py < 0 || py > height) break;
                    // Check if hit a negative charge
                    let hit = false;
                    charges.forEach(oc => {
                        if(oc.q < 0 && Math.sqrt((px-oc.x)**2 + (py-oc.y)**2) < 10) hit = true;
                    });
                    if(hit) break;
                }
                ctx.stroke();
            }
        });
    }

    // Draw charges
    charges.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = c.q > 0 ? '#e74c3c' : '#3498db';
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.q > 0 ? '+' : '-', c.x, c.y);
    });

  }, [chargeType]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div>
      <h3 style={{ fontWeight: 700, marginBottom: 16 }}>⚡ Electric Field Lines</h3>
      <div className="sim-controls">
        <div style={{ display: 'flex', gap: 10 }}>
          <button className={`btn btn-sm ${chargeType === 'dipole' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setChargeType('dipole')}>Dipole (+ & -)</button>
          <button className={`btn btn-sm ${chargeType === 'same' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setChargeType('same')}>Same (+ & +)</button>
          <button className={`btn btn-sm ${chargeType === 'single' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setChargeType('single')}>Single Point (+)</button>
        </div>
      </div>
      <div className="sim-canvas-wrapper" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
        <canvas ref={canvasRef} width={800} height={450} />
      </div>
      <p style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>
        Visualize electric field lines between different configurations of point charges.
      </p>
    </div>
  );
}

// ============================================
// DNA HELIX EXPLORER (NEW)
// ============================================
function DNAExplorer() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const time = Date.now() * 0.002;

    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    const nodes = 20;
    const spacing = height / nodes;
    const amplitude = 80;

    for (let i = 0; i < nodes; i++) {
        const y = i * spacing + spacing/2;
        const angle = i * 0.5 + time;
        
        const x1 = width/2 + Math.sin(angle) * amplitude;
        const x2 = width/2 + Math.sin(angle + Math.PI) * amplitude;
        
        // Connecting ladder
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Helix 1
        ctx.beginPath();
        ctx.arc(x1, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#3498db';
        ctx.fill();
        
        // Helix 2
        ctx.beginPath();
        ctx.arc(x2, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        
        // Base pairs indicator
        ctx.fillStyle = '#fff';
        ctx.font = '8px Arial';
        ctx.fillText(i % 2 === 0 ? 'A-T' : 'G-C', width/2 - 10, y + 3);
    }

    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <div>
      <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🧬 DNA Double Helix Explorer</h3>
      <div className="sim-canvas-wrapper" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
        <canvas ref={canvasRef} width={800} height={600} />
      </div>
      <p style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>
        Visualize the molecular structure of DNA, including the sugar-phosphate backbone and nitrogenous base pairs (Adenine-Thymine, Guanine-Cytosine).
      </p>
    </div>
  );
}

// ============================================
// CIRCUIT LAB / OHM'S LAW (NEW)
// ============================================
function CircuitLab() {
  const canvasRef = useRef(null);
  const [voltage, setVoltage] = useState(9);
  const [resistance, setResistance] = useState(10); // Ohms

  const current = (voltage / resistance).toFixed(2);
  const brightness = Math.min(100, (voltage / resistance) * 50);

  useEffect(() => {
    const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      
      // Box
      ctx.strokeRect(w*0.2, h*0.2, w*0.6, h*0.6);
      
      // Battery
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(w*0.18, h*0.4, 40, 100);
      ctx.strokeRect(w*0.18, h*0.4, 40, 100);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('+', w*0.2, h*0.45);
      ctx.fillText('-', w*0.2, h*0.65);
      ctx.fillText(`${voltage}V`, w*0.12, h*0.52);

      // Bulb
      const bx = w*0.8;
      const by = h*0.5;
      ctx.beginPath();
      ctx.arc(bx, by, 40, 0, Math.PI*2);
      ctx.fillStyle = `rgba(241, 196, 15, ${brightness/100})`;
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.fillText('💡', bx-15, by+10);
      
      // Ammeter
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(w*0.4, h*0.15, 120, 40);
      ctx.strokeRect(w*0.4, h*0.15, 120, 40);
      ctx.fillStyle = '#2ecc71';
      ctx.font = '16px monospace';
      ctx.fillText(`${current} Amps`, w*0.42, h*0.2);

  }, [voltage, resistance, brightness, current]);

  return (
    <div>
      <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🔌 Basic Circuit Lab (Ohm's Law)</h3>
      <div className="sim-controls">
        <div className="sim-slider-group">
          <label>Voltage: {voltage}V</label>
          <input type="range" className="sim-slider" min="1" max="24" value={voltage} onChange={e => setVoltage(+e.target.value)} />
        </div>
        <div className="sim-slider-group">
          <label>Resistance: {resistance} Ω</label>
          <input type="range" className="sim-slider" min="1" max="100" value={resistance} onChange={e => setResistance(+e.target.value)} />
        </div>
      </div>
      <div className="sim-canvas-wrapper" style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
        <canvas ref={canvasRef} width={800} height={400} />
      </div>
      <p style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>
        Experiment with Ohm's Law (V = I × R). Change the voltage and resistance to see how it affects the current and bulb brightness.
      </p>
    </div>
  );
}

// ============================================
// MAIN SIMULATIONS PAGE
// ============================================
export default function SimulationsPage() {
  const [active, setActive] = useState(null);
  const { t } = useLanguage();

  const sims = [
    { id: 'sorting', name: 'Algorithm Visualizer', icon: '📊', description: 'Watch sorting algorithms interact with numbers visually.', subject: 'Computer Science' },
    { id: 'solar', name: 'Solar System Dynamics', icon: '🪐', description: 'Observe planetary orbits and relativistic speeds.', subject: 'Astronomy' },
    { id: 'dna', name: 'DNA Helix Explorer', icon: '🧬', description: 'Explore the 3D structure and base pairs of DNA.', subject: 'Biology' },
    { id: 'projectile', name: 'Projectile Motion', icon: '🏹', description: 'Simulate projectile paths with adjustable velocity & angle.', subject: 'Physics' },
    { id: 'circuit', name: 'Circuit Lab', icon: '🔌', description: 'Build circuits and test Ohm\'s Law in real-time.', subject: 'Physics' },
    { id: 'pendulum', name: 'Pendulum Waves', icon: '🌀', description: 'Explore kinetic chaos with multiple hanging pendulums.', subject: 'Physics' },
    { id: 'optics', name: 'Optics: Prism', icon: '🌈', description: 'See how light refracts and disperses through a prism.', subject: 'Physics' },
    { id: 'waves', name: 'Wave Interference', icon: '🌊', description: 'Observe interference patterns between two point sources.', subject: 'Physics' },
    { id: 'gravity', name: 'Gravity Well', icon: '🕳️', description: 'Visualize how mass warps the fabric of spacetime.', subject: 'Physics' },
    { id: 'electric', name: 'Electric Field', icon: '⚡', description: 'Visualize electric field lines between point charges.', subject: 'Physics' }
  ];

  const renderActiveSim = () => {
    switch (active) {
      case 'sorting': return <div className="simulation-canvas"><SortingVisualizer /></div>;
      case 'solar': return <div className="simulation-canvas"><SolarSystemSimulator /></div>;
      case 'dna': return <div className="simulation-canvas"><DNAExplorer /></div>;
      case 'projectile': return <div className="simulation-canvas"><ProjectileSimulator /></div>;
      case 'circuit': return <div className="simulation-canvas"><CircuitLab /></div>;
      case 'pendulum': return <div className="simulation-canvas"><PendulumSimulator /></div>;
      case 'optics': return <div className="simulation-canvas"><OpticsSimulator /></div>;
      case 'waves': return <div className="simulation-canvas"><WaveInterference /></div>;
      case 'gravity': return <div className="simulation-canvas"><GravityWell /></div>;
      case 'electric': return <div className="simulation-canvas"><ElectricFieldSimulator /></div>;
      default: return null;
    }
  };

  return (
    <div className="animate-fade">
      <AnimatePresence mode="wait">
        {!active ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="page-header">
              <h1>🔬 {t('simulations.title')}</h1>
              <p>{t('simulations.subtitle')}</p>
            </div>
            <div className="grid-3" style={{ gap: '25px', padding: '10px' }}>
              {sims.map((sim, idx) => (
                <motion.div 
                  key={sim.id} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  className="game-card" 
                  onClick={() => setActive(sim.id)}
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ 
                    width: 64, 
                    height: 64, 
                    background: 'rgba(108, 92, 231, 0.15)', 
                    borderRadius: 18, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: 32, 
                    marginBottom: 20 
                  }}>
                    {sim.icon}
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 10 }}>{sim.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5, marginBottom: 20, flexGrow: 1 }}>{sim.description}</p>
                  <span className="badge badge-primary" style={{ alignSelf: 'flex-start', fontSize: 10 }}>{sim.subject}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="active"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            style={{ maxWidth: 850, margin: '0 auto' }}
          >
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => setActive(null)} 
              style={{ marginBottom: 16, fontWeight: 700 }}
            >
              ← BACK TO LABORATORY
            </button>
            <div className="card" style={{ padding: '30px', borderRadius: 24, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(12px)' }}>
              {renderActiveSim()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

