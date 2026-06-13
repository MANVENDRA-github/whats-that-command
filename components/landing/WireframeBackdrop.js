'use client';

import { useEffect, useRef } from 'react';

/**
 * Vector-CRT wireframe object — a glowing 3D model drawn on a fixed
 * background canvas, like the vector graphics of old green-phosphor arcade
 * monitors. Hand-rolled projection, no WebGL/Three.js.
 *
 * The model is a hand-built retro CRT monitor; clicking near it morphs it
 * into the next desk object (floppy disk, coffee mug) with an amber flash.
 * Scroll spins it and drifts it upward (parallax); the mouse tilts it.
 * Hidden on mobile; reduced motion gets one static frame.
 */

function model(verts, edges) {
  // uniform scale so the model fits a unit sphere (preserves proportions)
  let max = 0;
  for (const [x, y, z] of verts) max = Math.max(max, Math.hypot(x, y, z));
  return { verts: verts.map((v) => v.map((c) => c / max)), edges };
}

const crtMonitor = model(
  [
    // front of the case
    [-0.7, 0.55, 0.55], [0.7, 0.55, 0.55], [0.7, -0.55, 0.55], [-0.7, -0.55, 0.55],
    // tapered back of the tube
    [-0.45, 0.35, -0.55], [0.45, 0.35, -0.55], [0.45, -0.35, -0.55], [-0.45, -0.35, -0.55],
    // screen inset
    [-0.55, 0.4, 0.6], [0.55, 0.4, 0.6], [0.55, -0.38, 0.6], [-0.55, -0.38, 0.6],
    // stand neck
    [-0.18, -0.55, 0.05], [0.18, -0.55, 0.05], [0.22, -0.82, 0.05], [-0.22, -0.82, 0.05],
    // base
    [-0.5, -0.86, 0.35], [0.5, -0.86, 0.35], [0.5, -0.86, -0.25], [-0.5, -0.86, -0.25]
  ],
  [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
    [8, 9], [9, 10], [10, 11], [11, 8],
    [0, 8], [1, 9], [2, 10], [3, 11],
    [12, 13], [13, 14], [14, 15], [15, 12],
    [16, 17], [17, 18], [18, 19], [19, 16]
  ]
);

const floppyDisk = model(
  [
    // front face, top-right corner clipped like a real 3.5" disk
    [-0.65, 0.65, 0.07], [0.4, 0.65, 0.07], [0.65, 0.4, 0.07], [0.65, -0.65, 0.07], [-0.65, -0.65, 0.07],
    // back face
    [-0.65, 0.65, -0.07], [0.4, 0.65, -0.07], [0.65, 0.4, -0.07], [0.65, -0.65, -0.07], [-0.65, -0.65, -0.07],
    // metal shutter
    [-0.3, 0.63, 0.08], [0.35, 0.63, 0.08], [0.35, 0.25, 0.08], [-0.3, 0.25, 0.08],
    // read window in the shutter
    [0.1, 0.6, 0.085], [0.1, 0.28, 0.085],
    // label
    [-0.45, -0.05, 0.08], [0.45, -0.05, 0.08], [0.45, -0.58, 0.08], [-0.45, -0.58, 0.08]
  ],
  [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 0],
    [5, 6], [6, 7], [7, 8], [8, 9], [9, 5],
    [0, 5], [1, 6], [2, 7], [3, 8], [4, 9],
    [10, 11], [11, 12], [12, 13], [13, 10],
    [14, 15],
    [16, 17], [17, 18], [18, 19], [19, 16]
  ]
);

const coffeeMug = (() => {
  const verts = [];
  const edges = [];
  // octagonal cylinder body
  for (const y of [0.55, -0.55])
    for (let k = 0; k < 8; k += 1) {
      const a = (k / 8) * Math.PI * 2;
      verts.push([Math.cos(a) * 0.55, y, Math.sin(a) * 0.55]);
    }
  for (let k = 0; k < 8; k += 1) {
    edges.push([k, (k + 1) % 8]); // top rim
    edges.push([8 + k, 8 + ((k + 1) % 8)]); // bottom rim
    edges.push([k, 8 + k]); // wall
  }
  // handle
  verts.push([0.55, 0.3, 0], [0.95, 0.22, 0], [0.95, -0.22, 0], [0.55, -0.3, 0]);
  edges.push([16, 17], [17, 18], [18, 19]);
  return model(verts, edges);
})();

const SHAPES = [crtMonitor, floppyDisk, coffeeMug];

const easeOut = (x) => 1 - (1 - x) ** 3;

export default function WireframeBackdrop({ active = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let last = performance.now();
    let shapeIdx = 0;
    let morph = 1; // 0 → 1 while morphing between shapes
    let fromVerts = SHAPES[0].verts;
    let baseVerts = SHAPES[0].verts; // current (possibly mid-morph) geometry
    let scrollY = window.scrollY;
    let mx = 0;
    let my = 0; // eased mouse, -1..1
    let tmx = 0;
    let tmy = 0;
    const hit = { x: 0, y: 0, r: 0 }; // click target in screen space

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const rotate = ([x, y, z], rx, ry) => {
      const cy = Math.cos(ry);
      const sy = Math.sin(ry);
      const x1 = x * cy + z * sy;
      const z1 = -x * sy + z * cy;
      const cx = Math.cos(rx);
      const sx = Math.sin(rx);
      const y1 = y * cx - z1 * sx;
      const z2 = y * sx + z1 * cx;
      return [x1, y1, z2];
    };

    const draw = (now) => {
      ctx.clearRect(0, 0, w, h);
      if (w < 640) return;

      const s = SHAPES[shapeIdx];
      mx += (tmx - mx) * 0.06;
      my += (tmy - my) * 0.06;

      const m = easeOut(morph);
      // turntable spin + gentle nod — recognizable objects stay upright
      const ry = now * 0.00028 + scrollY * 0.0022 + mx * 0.35;
      const rx = 0.18 + Math.sin(now * 0.00012) * 0.22 + my * 0.3;
      const R = Math.min(w, h) * 0.21;
      const cx = w >= 1280 ? w * 0.78 : w * 0.82;
      const cy = h * 0.4 - scrollY * 0.05;
      hit.x = cx;
      hit.y = cy;
      hit.r = R * 1.5;

      baseVerts = s.verts.map((v, i) => {
        const f = fromVerts[i % fromVerts.length];
        return [
          f[0] + (v[0] - f[0]) * m,
          f[1] + (v[1] - f[1]) * m,
          f[2] + (v[2] - f[2]) * m
        ];
      });

      const proj = baseVerts.map((v) => {
        const [x, y, z] = rotate(v, rx, ry);
        const persp = 3.2 / (3.2 + z);
        // negate y: model space is y-up, canvas space is y-down
        return [cx + x * R * persp, cy - y * R * persp, persp];
      });

      // amber flash while morphing, phosphor green at rest
      const tone = morph < 1 ? '255,176,0' : '61,255,124';
      const alpha = w < 1280 ? 0.22 : 0.34;
      ctx.lineWidth = 1;
      ctx.shadowBlur = 16;
      ctx.shadowColor = `rgba(${tone},0.5)`;
      ctx.strokeStyle = `rgba(${tone},${alpha})`;
      ctx.beginPath();
      for (const [a, b] of s.edges) {
        ctx.moveTo(proj[a][0], proj[a][1]);
        ctx.lineTo(proj[b][0], proj[b][1]);
      }
      ctx.stroke();

      // vertex dots, brighter when nearer
      for (const [x, y, persp] of proj) {
        ctx.fillStyle = `rgba(${tone},${alpha * persp})`;
        ctx.fillRect(x - 1, y - 1, 2.5, 2.5);
      }
    };

    const loop = (now) => {
      const dt = Math.min(48, now - last);
      last = now;
      if (morph < 1) morph = Math.min(1, morph + dt / 520);
      draw(now);
      raf = requestAnimationFrame(loop);
    };

    const onScroll = () => {
      scrollY = window.scrollY;
    };
    const onMove = (e) => {
      tmx = (e.clientX / w) * 2 - 1;
      tmy = (e.clientY / h) * 2 - 1;
    };
    const onClick = (e) => {
      // only clicks on empty background near the object morph it
      if (e.target.closest('a,button,input,textarea,kbd,label,[role="button"]')) return;
      if (Math.hypot(e.clientX - hit.x, e.clientY - hit.y) > hit.r) return;
      fromVerts = baseVerts;
      shapeIdx = (shapeIdx + 1) % SHAPES.length;
      morph = 0;
      if (reduced) {
        morph = 1;
        draw(performance.now());
      }
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('click', onClick);

    if (reduced) {
      draw(0);
      return () => {
        window.removeEventListener('resize', resize);
        document.removeEventListener('click', onClick);
      };
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-10 hidden transition-opacity duration-500 sm:block ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}
