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

export const HeroCrystal = () => (
  <div className="crystal-scene" aria-hidden="true">
    <div className="crystal-glow" />
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
