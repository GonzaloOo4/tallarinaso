// Paisaje ilustrado de Santa Marta, calcado de fotos reales: la línea de cumbres de la
// Sierra Nevada (con nieve y nubes en la base), la bahía y El Morro con su faro.
// Se genera de forma determinista (mismo SVG en servidor y navegador) y los colores
// salen de variables CSS para cada tema. Se ancla abajo a la derecha.

const W = 1920;
const H = 1000;
const HORIZON = 800;

// Generador pseudoaleatorio con semilla: el paisaje es siempre el mismo.
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const lerp = (points: [number, number][], x: number) => {
  if (x <= points[0]![0]) return points[0]![1];
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i]!;
    const [x0, y0] = points[i - 1]!;
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return points.at(-1)![1];
};

const toPath = (y: (x: number) => number, step = 6) => {
  let d = `M0 ${H} L0 ${y(0).toFixed(1)}`;
  for (let x = step; x <= W; x += step) d += ` L${x} ${y(x).toFixed(1)}`;
  return `${d} L${W} ${H} Z`;
};

// --- Sierra Nevada --------------------------------------------------------------
// Línea de cumbres calcada de la foto de referencia (x en px sobre 1400 de ancho,
// y en px desde arriba; la base de nubes está en y = 330).
const SIERRA_REF: [number, number][] = [
  [0, 205], [100, 200], [150, 165], [185, 130], [215, 110], [240, 95], [265, 88], [290, 84], [305, 80],
  [330, 90], [355, 105], [375, 118], [395, 105], [425, 97], [445, 105], [470, 115], [500, 135], [520, 160],
  [545, 172], [575, 175], [610, 170], [640, 180], [680, 192], [720, 185], [760, 180], [790, 178], [820, 176],
  [850, 172], [880, 165], [910, 160], [935, 150], [955, 128], [965, 125], [990, 115], [1020, 112], [1040, 118],
  [1060, 130], [1090, 150], [1120, 160], [1150, 170], [1180, 180], [1220, 195], [1260, 210], [1300, 222],
  [1330, 215], [1360, 205], [1400, 200],
];
const SIERRA_X = 900; // dónde empieza la referencia en la escena
const SIERRA_BASE = 600; // altura de la base de nubes en la escena
const SIERRA_V = 1.5; // exageración vertical: la Sierra se siente cercana
const sierraRand = seeded(11);
const SIERRA_JAG = Array.from({ length: W / 6 + 2 }, () => (sierraRand() - 0.5) * 5);
const sierraY = (x: number) => {
  const sx = x - SIERRA_X;
  // Antes de la referencia, las estribaciones bajan suavemente hacia la izquierda.
  const sy = sx >= 0 ? lerp(SIERRA_REF, sx) : 205 - sx * 0.12 + Math.sin(x * 0.02) * 6;
  return SIERRA_BASE - (330 - sy) * SIERRA_V + (SIERRA_JAG[Math.round(x / 6)] ?? 0);
};
// Cumbres con cara en sombra y el largo de su ladera izquierda. El pico gemelo no lleva:
// su ladera es tan corta que la sombra quedaba como una franja vertical.
const SUMMITS = [
  { x: SIERRA_X + 305, span: 150 },
];

// La luz (sol de día, luna de noche) viene de la derecha: las caras en sombra son
// las laderas izquierdas. Sigue la ladera desde la cumbre y vuelve en diagonal por dentro.
const shadowFacet = (y: (x: number) => number, peak: { x: number; span: number }, drop: number) => {
  const end = peak.x - peak.span;
  let d = `M${peak.x} ${y(peak.x).toFixed(1)}`;
  for (let x = peak.x - 4; x > end; x -= 4) d += ` L${x} ${y(x).toFixed(1)}`;
  return `${d} L${end} ${y(end).toFixed(1)} L${(end + peak.span * 0.12).toFixed(1)} ${(y(end) + drop * 0.9).toFixed(1)} L${(peak.x - peak.span * 0.18).toFixed(1)} ${(y(peak.x) + drop).toFixed(1)} Z`;
};

// Línea de nieve dentada: la nieve cubre la parte alta del macizo.
const SNOW_CLIP = (() => {
  const rand = seeded(97);
  let d = `M0 0 H${W} V400`;
  for (let x = W; x >= 0; x -= 12) d += ` L${x} ${(410 + Math.sin(x * 0.024) * 22 + (rand() - 0.5) * 34).toFixed(1)}`;
  return `${d} Z`;
})();

// Estribaciones verdes delante de las nubes.
type Ridge = { seed: number; base: number; amp: number; jag: number; depth: number };
const ridgeY = ({ seed, base, amp, jag }: Ridge) => {
  const rand = seeded(seed);
  const waves = [0.0019, 0.0043, 0.0105, 0.024].map((freq, i) => ({ freq, phase: rand() * Math.PI * 2, weight: [1, 0.55, 0.28, 0.12][i]! }));
  return (x: number) => base - amp * waves.reduce((sum, w) => sum + w.weight * Math.sin(x * w.freq + w.phase), 0) * 0.55 + (rand() - 0.5) * jag;
};
const FOOTHILLS: Ridge[] = [
  { seed: 23, base: 660, amp: 60, jag: 4, depth: 0.05 },
  { seed: 37, base: 700, amp: 50, jag: 4, depth: 0.08 },
  { seed: 51, base: 748, amp: 40, jag: 3, depth: 0.11 },
  { seed: 67, base: 795, amp: 22, jag: 2, depth: 0.14 },
];

const CLOUDS = Array.from({ length: 14 }, (_, i) => {
  const rand = seeded(300 + i);
  return { cx: 560 + i * 105 + rand() * 60, cy: SIERRA_BASE + 8 + rand() * 34, rx: 120 + rand() * 90, ry: 26 + rand() * 18 };
});

// --- Sol (tema claro) y luna con estrellas (tema oscuro) ----------------------------
// El sol (día) y la luna (noche) ocupan el mismo lugar del cielo.
const SKY_LIGHT = { x: 1800, y: 270 };
const SUN = { ...SKY_LIGHT, r: 40 };
const MOON = { ...SKY_LIGHT, r: 32 };
// Mares lunares: manchas suaves que hacen reconocible la luna.
const MOON_MARIA = [
  { cx: -9, cy: -8, r: 9 }, { cx: 8, cy: -11, r: 6 }, { cx: 4, cy: 6, r: 8 }, { cx: -12, cy: 10, r: 5 }, { cx: 14, cy: 9, r: 4 },
];
const STARS = (() => {
  const rand = seeded(211);
  return Array.from({ length: 90 }, (_, i) => ({
    x: rand() * W,
    y: rand() ** 1.6 * 470,
    r: 0.5 + rand() * 1.3,
    twinkle: i % 4 === 0,
    delay: rand() * 6,
  }));
})();

const glints = (x: number, className: string) =>
  Array.from({ length: 11 }, (_, i) => {
    const y = HORIZON + 10 + i * 17;
    const half = 74 - i * 4.5 + (i % 2) * 10;
    return <path key={`${className}${y}`} className={className} d={`M${x - half} ${y} h${half * 2}`} style={{ opacity: 0.75 - i * 0.055 }} />;
  });

// --- El Morro: silueta calcada de la foto (x de 0 a 1 sobre su ancho, alto relativo al ancho) ---
const MORRO_SHAPE: [number, number][] = [
  [0, 0], [0.015, 0.04], [0.03, 0.05], [0.044, 0.062], [0.059, 0.075], [0.074, 0.082], [0.09, 0.1], [0.105, 0.097],
  [0.12, 0.105], [0.134, 0.112], [0.149, 0.117], [0.164, 0.122], [0.179, 0.124], [0.194, 0.144], [0.208, 0.144],
  [0.224, 0.142], [0.239, 0.139], [0.254, 0.142], [0.269, 0.134], [0.284, 0.134], [0.298, 0.132], [0.313, 0.134],
  [0.328, 0.144], [0.343, 0.154], [0.359, 0.157], [0.374, 0.177], [0.388, 0.182], [0.403, 0.187], [0.418, 0.199],
  [0.433, 0.199], [0.448, 0.207], [0.462, 0.2], [0.477, 0.202], [0.493, 0.194], [0.508, 0.194], [0.523, 0.184],
  [0.538, 0.187], [0.552, 0.179], [0.567, 0.179], [0.582, 0.177], [0.597, 0.174], [0.612, 0.169], [0.628, 0.162],
  [0.642, 0.162], [0.657, 0.162], [0.672, 0.159], [0.687, 0.159], [0.702, 0.152], [0.716, 0.142], [0.731, 0.142],
  [0.746, 0.139], [0.762, 0.137], [0.777, 0.122], [0.792, 0.117], [0.806, 0.112], [0.821, 0.107], [0.836, 0.102],
  [0.851, 0.1], [0.866, 0.1], [0.88, 0.082], [0.897, 0.077], [0.911, 0.077], [0.926, 0.065], [0.941, 0.05],
  [0.956, 0.035], [0.97, 0.03], [0.985, 0.015], [1, 0],
];
const MORRO = { x: 1030, w: 420, base: HORIZON + 4 };
const morroPoints = MORRO_SHAPE.map(([px, h]) => [MORRO.x + px * MORRO.w, MORRO.base - h * MORRO.w] as const);
const morroPath = `M${morroPoints.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')} Z`;
// El faro está al 45 % del ancho; su torre es alta y esbelta, como en la foto.
const LAMP_X = MORRO.x + 0.454 * MORRO.w;
const LAMP_TOP = MORRO.base - lerp(MORRO_SHAPE, 0.454) * MORRO.w;
const TOWER = { h: 0.085 * MORRO.w, w: 0.017 * MORRO.w };
const LAMP = { x: LAMP_X, y: LAMP_TOP - TOWER.h + 3 };
// Lado en sombra: la ladera izquierda (la luz viene de la derecha), desde la cima hasta el mar.
const morroShade = (() => {
  const left = morroPoints.filter(([x]) => x <= LAMP_X);
  return `M${left.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')} L${(LAMP_X - MORRO.w * 0.12).toFixed(1)} ${MORRO.base} Z`;
})();

const WAVES = Array.from({ length: 9 }, (_, i) => ({ y: HORIZON + 22 + i * i * 2.4 + i * 6, length: 130 + i * 24, opacity: 0.12 + i * 0.012 }));

// Buque portuario (portacontenedores) visto de lado, proa a la derecha. Origen: popa en la línea de flotación.
const SHIP_W = 240;
const CONTAINER_COLORS = [1, 2, 3, 1, 3, 2, 1, 2, 3, 2, 1, 3];
const Ship = () => (
  <g className="sierra-ship">
    <path className="ship-hull" d={`M0 0 L4 -14 H${SHIP_W - 22} L${SHIP_W} -20 L${SHIP_W - 14} 0 Z`} />
    <path className="ship-waterline" d={`M2 -3 H${SHIP_W - 12}`} />
    {CONTAINER_COLORS.map((c, i) => (
      <g key={i}>
        <rect className={`ship-box ship-box-${c}`} x={60 + (i % 6) * 26} y={i < 6 ? -24 : -34} width="24" height="10" />
      </g>
    ))}
    <rect className="ship-bridge" x="14" y="-40" width="30" height="26" />
    <rect className="ship-bridge" x="10" y="-44" width="38" height="5" />
    <rect className="ship-funnel" x="22" y="-54" width="8" height="11" />
    <path className="ship-mast" d={`M${SHIP_W - 30} -14 V-40 M${SHIP_W - 36} -34 H${SHIP_W - 24}`} />
    {[18, 26, 34].map((x) => <rect key={x} className="ship-window" x={x} y="-34" width="5" height="3" />)}
    <circle className="ship-light ship-light-mast" cx={SHIP_W - 30} cy="-41" r="1.8" />
    <circle className="ship-light ship-light-bow" cx={SHIP_W - 18} cy="-17" r="1.6" />
    <circle className="ship-light" cx="29" cy="-46" r="1.6" />
  </g>
);

// Lancha de pescador (panga): proa levantada a la izquierda, motor fuera de borda atrás.
// Un pescadito: cuerpo y cola.
const fish = (x: number, y: number, flip = false) => {
  const d = flip ? -1 : 1;
  return `M${x} ${y} q${3 * d} -1.8 ${6 * d} 0 q${-3 * d} 1.8 ${-6 * d} 0 Z M${x + 6 * d} ${y} l${2 * d} -1.4 v2.8 Z`;
};
// Pescados dentro de la bolsa de red, en la esquina de la proa.
const CATCH = [fish(10.5, -11.4), fish(20, -12.6, true), fish(11.5, -14.6), fish(19, -16.2, true)];
const NET_FISH = [fish(-2, 1), fish(3, 2.6, true), fish(-1, 4.2), fish(4, 5.5, true)];

// Lancha de pescador (panga), proa a la izquierda. Bucle de un día de pesca: llega por la
// derecha, lanza la atarraya, recoge la red llena y se va por la izquierda con el bote cargado.
// Todas las animaciones comparten la misma duración para ir sincronizadas.
const FishingBoat = ({ x, y }: { x: number; y: number }) => (
  <g className="sierra-fishing">
    <g className="fishing-track">
      <g transform={`translate(${x} ${y}) scale(1.4)`}>
        <path className="fishing-wake" d="M68 -1 h14 M70 1.5 h20 M72 -3 h9" />
        <g className="sierra-fishing-bob">
          <path className="panga-hull" d="M0 -13 C6 -11 14 -9 24 -9 H66 V-1 C50 2 20 2 8 -3 C4 -6 1 -9 0 -13 Z" />
          <g className="fisher-haul">
            {CATCH.map((d) => <path key={d} className="fish" d={d} />)}
            <path className="fisher-haul-bag" d="M8 -9 C7 -14 9 -18.5 15 -18.5 C21 -18.5 23 -14 22 -9 Z" />
            <path className="fisher-haul-knot" d="M14 -18.5 L15 -20.5 L16 -18.5" />
          </g>
          <path className="panga-stripe" d="M0 -13 C6 -11 14 -9 24 -9 H66 V-7 H24 C14 -7 6 -9 1 -11 Z" />
          <path className="panga-motor" d="M64 -16 h6 v6 l-2 1 v9 h-2 v-9 l-2 -1 Z" />
          {/* Pescador con la atarraya */}
          <g className="fisher">
            <path className="fisher-body" d="M34 -9 L35.5 -16 H39.5 L41 -9 Z M35 -16 L35.6 -23 H39.4 L40 -16 Z" />
            <circle className="fisher-body" cx="37.5" cy="-25.6" r="2.4" />
            <path className="fisher-hat" d="M33.6 -27.2 H41.4 M35.4 -27.4 Q37.5 -30.6 39.6 -27.4" />
            <g className="fisher-arm"><path d="M37 -21.5 L30 -26" /></g>
            <g className="fisher-net">
              {[-34, -20, -6, 8, 22].map((angle) => (
                <path key={angle} d="M30 -26 l-1 20" transform={`rotate(${angle} 30 -26)`} />
              ))}
              <path d="M23 -7.5 Q29 -3 36 -7.5" className="fisher-net-rim" />
            </g>
            {/* La red recogida, llena de pescados */}
            <g className="fisher-catch">
              <path className="fisher-catch-bag" d="M-5 -1 Q1 9 8 -1 Z" />
              {NET_FISH.map((d) => <path key={d} className="fish" d={d} />)}
            </g>
          </g>
        </g>
      </g>
    </g>
  </g>
);

// Etiqueta de mapa ilustrado: punto sobre el lugar, línea fina y texto mono pequeño.
// Datos: Pico Cristóbal Colón 5.775 m (Alcaldía de Santa Marta, Procolombia);
// faro actual del Morro de 1998 (dato aportado por Gonzalo).
const SUMMIT_X = SIERRA_X + 305;
const MapLabel = ({ from, to, lines, className }: { from: [number, number]; to: [number, number]; lines: string[]; className?: string }) => (
  <g className={`sierra-label ${className ?? ''}`}>
    <circle cx={from[0]} cy={from[1]} r="2.4" className="sierra-label-dot" />
    <path d={`M${from[0]} ${from[1]} L${to[0]} ${to[1]} h18`} className="sierra-label-line" />
    {lines.map((line, i) => (
      <text key={line} x={to[0] + 24} y={to[1] + 4 + i * 17} className={i === 0 ? 'sierra-label-title' : 'sierra-label-sub'}>
        {line}
      </text>
    ))}
  </g>
);

export const SierraLandscape = () => (
  <div className="sierra" aria-hidden="true">
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMaxYMax slice">
      <defs>
        <linearGradient id="sierra-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--sierra-sky-1)" />
          <stop offset="0.5" stopColor="var(--sierra-sky-2)" />
          <stop offset="0.78" stopColor="var(--sierra-sky-3)" />
        </linearGradient>
        <radialGradient id="sierra-glow" cx={SUN.x / W} cy={SUN.y / H} r="0.5">
          <stop offset="0" stopColor="var(--sierra-sun)" stopOpacity="0.6" />
          <stop offset="1" stopColor="var(--sierra-sun)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sierra-moonglow" cx={MOON.x / W} cy={MOON.y / H} r="0.35">
          <stop offset="0" stopColor="var(--sierra-moonlight)" stopOpacity="0.32" />
          <stop offset="1" stopColor="var(--sierra-moonlight)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sierra-moon-halo">
          <stop offset="0.45" stopColor="var(--sierra-moonlight)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--sierra-moonlight)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sierra-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--sierra-sea-1)" />
          <stop offset="1" stopColor="var(--sierra-sea-2)" />
        </linearGradient>
        <linearGradient id="sierra-beam-r" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--sierra-beacon)" stopOpacity="0.32" />
          <stop offset="1" stopColor="var(--sierra-beacon)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sierra-facet-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--sierra-facet)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--sierra-facet)" stopOpacity="0" />
        </linearGradient>
        <clipPath id="sierra-snow-line"><path d={SNOW_CLIP} /></clipPath>
        <filter id="sierra-cloud-blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="10" /></filter>
      </defs>

      <rect width={W} height={H} fill="url(#sierra-sky)" />
      <g className="sierra-day">
        <rect width={W} height={H} fill="url(#sierra-glow)" />
        <circle className="sierra-sun" cx={SUN.x} cy={SUN.y} r={SUN.r} />
      </g>
      <g className="sierra-night">
        <rect width={W} height={H} fill="url(#sierra-moonglow)" />
        <g className="sierra-stars">
          {STARS.map((star) => (
            <circle key={`${star.x}-${star.y}`} cx={star.x} cy={star.y} r={star.r} className={star.twinkle ? 'is-twinkling' : undefined} style={star.twinkle ? { animationDelay: `-${star.delay}s` } : undefined} />
          ))}
        </g>
        <circle cx={MOON.x} cy={MOON.y} r={MOON.r * 2.6} fill="url(#sierra-moon-halo)" />
        <circle className="sierra-moon" cx={MOON.x} cy={MOON.y} r={MOON.r} />
        {MOON_MARIA.map((mare) => <circle key={`${mare.cx}${mare.cy}`} className="sierra-moon-mare" cx={MOON.x + mare.cx} cy={MOON.y + mare.cy} r={mare.r} />)}
      </g>

      {/* Sierra Nevada */}
      <g className="sierra-layer" style={{ '--depth': 0.02 } as React.CSSProperties}>
        <path d={toPath(sierraY)} className="sierra-ridge sierra-ridge-1" />
        {SUMMITS.map((peak) => <path key={peak.x} d={shadowFacet(sierraY, peak, 150)} className="sierra-facet" />)}
        <path d={toPath(sierraY)} className="sierra-snow" clipPath="url(#sierra-snow-line)" />
        {SUMMITS.map((peak) => <path key={`s${peak.x}`} d={shadowFacet(sierraY, peak, 150)} className="sierra-snow-shade" clipPath="url(#sierra-snow-line)" />)}
      </g>

      {/* Nubes abrazando la base de la Sierra */}
      <g className="sierra-layer sierra-clouds" style={{ '--depth': 0.035 } as React.CSSProperties} filter="url(#sierra-cloud-blur)">
        {CLOUDS.map((cloud) => <ellipse key={cloud.cx} {...cloud} />)}
      </g>

      {FOOTHILLS.map((ridge, index) => (
        <g key={ridge.seed} className="sierra-layer" style={{ '--depth': ridge.depth } as React.CSSProperties}>
          <path d={toPath(ridgeY(ridge), 8)} className={`sierra-ridge sierra-ridge-${index + 2}`} />
        </g>
      ))}

      <g className="sierra-layer" style={{ '--depth': 0.16 } as React.CSSProperties}>
        <rect y={HORIZON} width={W} height={H - HORIZON} fill="url(#sierra-sea)" />
        <g className="sierra-day">{glints(SUN.x, 'sierra-glint')}</g>
        <g className="sierra-night">{glints(MOON.x, 'sierra-glint sierra-glint-moon')}</g>
        {WAVES.map((wave) => (
          <g key={wave.y} className="sierra-wave" style={{ opacity: wave.opacity }}>
            <path d={`M${MORRO.x - 160 - wave.length / 2} ${wave.y} h${wave.length}`} />
            <path d={`M${420 + (wave.y % 7) * 40} ${wave.y + 4} h${wave.length * 0.6}`} />
          </g>
        ))}

        {/* Buque portuario cruzando la bahía, más lejos que el Morro: su línea de flotación queda
            por encima de la base del peñón, así que pasa por detrás de forma creíble. */}
        <g transform={`translate(0 ${MORRO.base - 3}) scale(0.5)`}>
          <g className="sierra-ship-track"><Ship /></g>
        </g>

        {/* El Morro, su reflejo y el faro */}
        <path className="sierra-morro-reflection" d={morroPath} transform={`translate(0 ${2 * MORRO.base}) scale(1 -1)`} />
        <path className="sierra-morro" d={morroPath} />
        <path className="sierra-morro-shade" d={morroShade} />
        <path
          className="sierra-lighthouse"
          d={`M${LAMP_X - TOWER.w / 2} ${LAMP_TOP + 2} L${LAMP_X - TOWER.w / 3} ${LAMP_TOP - TOWER.h + 8} H${LAMP_X + TOWER.w / 3} L${LAMP_X + TOWER.w / 2} ${LAMP_TOP + 2} Z M${LAMP_X - TOWER.w / 2.4} ${LAMP_TOP - TOWER.h + 8} h${TOWER.w / 1.2} v-7 h-${TOWER.w / 1.2} Z M${LAMP_X - TOWER.w / 3} ${LAMP_TOP - TOWER.h + 1} L${LAMP_X} ${LAMP_TOP - TOWER.h - 4} L${LAMP_X + TOWER.w / 3} ${LAMP_TOP - TOWER.h + 1} Z`}
        />
        <path className="sierra-beam" style={{ transformOrigin: `${LAMP.x}px ${LAMP.y}px` }} d={`M${LAMP.x} ${LAMP.y} L${LAMP.x + 600} ${LAMP.y - 36} L${LAMP.x + 600} ${LAMP.y + 44} Z`} />
        <circle className="sierra-beacon" cx={LAMP.x} cy={LAMP.y} r="3.4" />
        <FishingBoat x={MORRO.x + 520} y={HORIZON + 50} />
        <MapLabel
          className="sierra-label-morro"
          from={[MORRO.x + 0.8 * MORRO.w, MORRO.base - lerp(MORRO_SHAPE, 0.8) * MORRO.w + 4]}
          to={[MORRO.x + MORRO.w + 36, MORRO.base - 58]}
          lines={['El Morro', 'Faro de 1998']}
        />
      </g>

      {/* Etiquetas de mapa sobre la Sierra (en su capa de paralaje); solo en pantallas anchas. */}
      <g className="sierra-layer" style={{ '--depth': 0.02 } as React.CSSProperties}>
        <MapLabel
          // Punto a media ladera y texto bajo la nieve: la cumbre queda pegada al header en pantallas anchas.
          from={[SUMMIT_X + 40, sierraY(SUMMIT_X + 40) + 95]}
          to={[SUMMIT_X + 210, sierraY(SUMMIT_X) + 235]}
          lines={['Sierra Nevada', 'Pico Colón · 5.775 m']}
        />
      </g>
    </svg>
  </div>
);
