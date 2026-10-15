const LEAVES = [1, 2, 3, 4, 5, 6, 7, 8];

export const FallingLeaves = () => (
  <div className="falling-leaves" aria-hidden="true">
    {LEAVES.map((leaf) => <span className="falling-leaf" key={leaf} />)}
  </div>
);