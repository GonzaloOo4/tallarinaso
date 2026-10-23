'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const INTERVAL_MS = 2600;
const listFormat = new Intl.ListFormat('es', { type: 'conjunction' });

// Frase del hero. Una parte entre llaves, como "Diseño {mundos|historias} que…",
// rota entre sus opciones; sin llaves, la frase es fija.
export const HeroPhrase = ({ text }: { text: string }) => {
  const match = text.match(/^(.*?)\{([^}]+)\}(.*)$/s);
  const words = match?.[2]?.split('|').map((word) => word.trim()).filter(Boolean) ?? [];
  const [index, setIndex] = useState(0);
  const [widths, setWidths] = useState<number[]>([]);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (words.length < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % words.length), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [words.length]);

  // El hueco toma el ancho de la palabra visible y se anima entre una y otra.
  useLayoutEffect(() => {
    const measure = () => setWidths(wordRefs.current.map((el) => el?.offsetWidth ?? 0));
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [text]);

  if (!match || words.length === 0) return <>{text}</>;
  const [, before, , after] = match;
  const width = widths[index];

  return (
    <>
      <span className="sr-only">{before}{listFormat.format(words)}{after}</span>
      <span aria-hidden="true">
        {before}
        <span className="hero-rotator" style={width ? { width } : undefined}>
          {words.map((word, wordIndex) => (
            <span
              key={word}
              ref={(el) => { wordRefs.current[wordIndex] = el; }}
              className={wordIndex === index ? 'is-active' : undefined}
            >
              {word}
            </span>
          ))}
        </span>
        {after}
      </span>
    </>
  );
};
