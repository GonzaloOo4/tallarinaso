const DEFAULT_ITEMS = ['Diseño', 'Narrativa', 'Sistemas', 'Investigación', 'Interacción'];

export const MarqueeBanner = ({ items = DEFAULT_ITEMS }: { items?: string[] }) => {
  const track = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {track.map((item, index) => (
          <span className="marquee-item" key={`${item}-${index}`}>{item}</span>
        ))}
      </div>
    </div>
  );
};
