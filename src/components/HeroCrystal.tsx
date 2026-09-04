const H = 64;
const SIZE = H * 2;

const VERTICES = [
  [-H, -H, -H], [H, -H, -H], [H, H, -H], [-H, H, -H],
  [-H, -H, H], [H, -H, H], [H, H, H], [-H, H, H],
];

const X_EDGES = [
  [-H, -H], [-H, H], [H, -H], [H, H],
].map(([y, z]) => ({ transform: `translate3d(0px, ${y}px, ${z}px)` }));

const Y_EDGES = [
  [-H, -H], [-H, H], [H, -H], [H, H],
].map(([x, z]) => ({ transform: `translate3d(${x}px, 0px, ${z}px) rotateZ(90deg)` }));

const Z_EDGES = [
  [-H, -H], [-H, H], [H, -H], [H, H],
].map(([x, y]) => ({ transform: `translate3d(${x}px, ${y}px, 0px) rotateY(90deg)` }));

const EDGES = [...X_EDGES, ...Y_EDGES, ...Z_EDGES];

const NODES: [number, number][] = [
  [30, 40], [110, 20], [190, 45], [260, 90], [70, 110],
  [150, 95], [220, 150], [40, 190], [130, 200], [210, 225],
];

const LINKS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 5],
  [3, 6], [4, 5], [5, 6], [4, 7], [5, 8], [6, 9], [7, 8], [8, 9],
];

export const HeroCrystal = () => (
  <div className="crystal-scene" aria-hidden="true">
    <div className="crystal-glow" />
    <svg className="crystal-mesh" viewBox="0 0 280 250" aria-hidden="true">
      {LINKS.map(([a, b], index) => {
        const [x1, y1] = NODES[a];
        const [x2, y2] = NODES[b];
        return (
          <line key={index} className="crystal-mesh-line" x1={x1} y1={y1} x2={x2} y2={y2}>
            <animate attributeName="stroke-dashoffset" from="0" to="-24" dur={`${3 + (index % 4)}s`} begin={`${index * 0.2}s`} repeatCount="indefinite" />
          </line>
        );
      })}
      {NODES.map(([x, y], index) => (
        <circle key={index} className="crystal-mesh-node" cx={x} cy={y} r="3">
          <animate attributeName="r" values="2;4;2" dur="2.6s" begin={`${index * 0.18}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2.6s" begin={`${index * 0.18}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
    <div className="crystal-cube" style={{ width: SIZE, height: SIZE }}>
      {EDGES.map((edge, index) => (
        <span key={index} className="crystal-edge" style={{ width: SIZE, transform: edge.transform }} />
      ))}
      {VERTICES.map(([x, y, z], index) => (
        <span key={index} className="crystal-node" style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }} />
      ))}
    </div>
  </div>
);
