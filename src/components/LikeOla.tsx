'use client';

import { useEffect, useState, useTransition } from 'react';
import { abrirProyecto, darLike, type Interaccion } from '@/app/(site)/proyectos/actions';

// Botón de "me gusta" con forma de ola. También cuenta una vista por sesión.
export const LikeOla = ({ slug }: { slug: string }) => {
  const [state, setState] = useState<Interaccion | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let contarVista = false;
    try {
      const key = `vista:${slug}`;
      contarVista = !window.sessionStorage.getItem(key);
      window.sessionStorage.setItem(key, '1');
    } catch {
      // Sin almacenamiento de sesión no se cuenta la vista.
    }
    abrirProyecto(slug, contarVista).then(setState).catch(() => setState(null));
  }, [slug]);

  const handleClick = () => {
    if (state?.liked) return;
    setState((current) => ({ likes: (current?.likes ?? 0) + 1, liked: true }));
    startTransition(async () => {
      try {
        setState(await darLike(slug));
      } catch {
        setState((current) => current && { likes: Math.max(0, current.likes - 1), liked: false });
      }
    });
  };

  const liked = state?.liked ?? false;
  return (
    <button className="like-ola" type="button" aria-pressed={liked} disabled={pending} onClick={handleClick}>
      <svg viewBox="0 0 28 16" aria-hidden="true">
        <path d="M1 9c2.6-4 5.2-4 7.8 0s5.2 4 7.8 0 5.2-4 7.8 0" />
        <path d="M1 14c2.6-4 5.2-4 7.8 0s5.2 4 7.8 0 5.2-4 7.8 0" />
      </svg>
      <span>{liked ? 'Te gustó' : 'Me gusta'}</span>
      {state && <span className="like-ola-count" aria-label={`${state.likes} me gusta`}>{state.likes}</span>}
    </button>
  );
};
