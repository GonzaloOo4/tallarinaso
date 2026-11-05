'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { salir } from '@/app/(site)/cuenta/actions';
import { keepFormOnSubmit } from '@/lib/use-keep-form';
import { cargarComentarios, comentar, type ComentarState, type EstadoComentarios } from '@/app/(site)/proyectos/comentarios';

const INITIAL: ComentarState = { status: 'idle' };
const fecha = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

// Se carga en el navegador para que la página del proyecto siga siendo estática;
// la sesión del visitante solo se lee aquí.
export const Comentarios = ({ slug }: { slug: string }) => {
  const [estado, setEstado] = useState<EstadoComentarios | null>(null);
  const [state, action, pending] = useActionState(comentar.bind(null, slug), INITIAL);
  const siguiente = `/proyectos/${slug}#comentarios`;

  useEffect(() => {
    cargarComentarios(slug).then(setEstado).catch(() => setEstado({ comentarios: [], visitante: null }));
  }, [slug]);

  return (
    <section className="scene" id="comentarios" aria-labelledby="comentarios-title">
      <div className="glass-panel section-glass">
        <h2 id="comentarios-title">Comentarios</h2>
        {!estado ? <p className="meta">Cargando…</p> : (
          <>
            {estado.comentarios.length === 0 ? (
              <p className="meta">Todavía no hay comentarios. ¡Sé el primero!</p>
            ) : (
              <ol className="comentarios-lista">
                {estado.comentarios.map((c) => (
                  <li key={c.id} className="comentario">
                    <p className="meta"><strong>{c.autor}</strong> · {fecha.format(new Date(c.fecha))}</p>
                    <p className="comentario-texto">{c.texto}</p>
                  </li>
                ))}
              </ol>
            )}

            {!estado.visitante ? (
              <p className="comentarios-cta">
                Para comentar necesitas una cuenta.{' '}
                <Link className="button-primary" href={`/registro?siguiente=${encodeURIComponent(siguiente)}`}>
                  Crear cuenta <span aria-hidden="true">→</span>
                </Link>{' '}
                <Link className="editorial-link" href={`/entrar?siguiente=${encodeURIComponent(siguiente)}`}>Ya tengo cuenta</Link>
              </p>
            ) : state.status === 'ok' ? (
              <p className="contact-sent" role="status">
                <strong>¡Gracias, {estado.visitante.nombre}!</strong> Tu comentario aparecerá cuando Gonzalo lo apruebe.
              </p>
            ) : (
              <form className="contact-form" action={action} onSubmit={keepFormOnSubmit(action)}>
                <label>
                  <span className="meta">Comentas como {estado.visitante.nombre}</span>
                  <textarea name="texto" rows={4} minLength={2} maxLength={2000} required />
                </label>
                {state.status === 'error' && <p className="contact-error" role="alert">{state.message}</p>}
                <div className="comentarios-acciones">
                  <button className="button-primary" type="submit" disabled={pending}>
                    {pending ? 'Enviando…' : 'Comentar'} <span aria-hidden="true">→</span>
                  </button>
                </div>
              </form>
            )}
            {estado.visitante && (
              <form action={salir} className="comentarios-salir">
                <input type="hidden" name="siguiente" value={siguiente} />
                <button className="editorial-link" type="submit">Cerrar sesión</button>
              </form>
            )}
          </>
        )}
      </div>
    </section>
  );
};
