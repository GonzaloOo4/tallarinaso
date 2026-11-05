'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { keepFormOnSubmit } from '@/lib/use-keep-form';
import { sendContact, type ContactState } from './actions';

const INITIAL_STATE: ContactState = { status: 'idle' };

export const ContactForm = () => {
  const [state, action, pending] = useActionState(sendContact, INITIAL_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  // Momento en que se abrió el formulario (filtro anti-bots); se fija en el navegador.
  const [startedAt, setStartedAt] = useState('');
  useEffect(() => setStartedAt(String(Date.now())), []);
  useEffect(() => {
    if (state.status === 'ok') formRef.current?.reset();
  }, [state]);

  if (state.status === 'ok') {
    return (
      <p className="contact-sent" role="status">
        <strong>¡Mensaje enviado!</strong> Te respondo pronto a tu correo.
      </p>
    );
  }

  return (
    <form ref={formRef} className="contact-form" action={action} onSubmit={keepFormOnSubmit(action)}>
      <div className="contact-form-row">
        <label>
          <span className="meta">Nombre</span>
          <input name="nombre" type="text" autoComplete="name" maxLength={80} required />
        </label>
        <label>
          <span className="meta">Correo</span>
          <input name="correo" type="email" autoComplete="email" maxLength={254} required />
        </label>
      </div>
      <label>
        <span className="meta">Mensaje</span>
        <textarea name="mensaje" rows={5} minLength={10} maxLength={4000} required />
      </label>
      {/* Trampa para bots: invisible para personas y lectores de pantalla. */}
      <div className="contact-trap" aria-hidden="true">
        <label>No llenar <input name="empresa_web" type="text" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <input type="hidden" name="t" value={startedAt} />
      {state.status === 'error' && <p className="contact-error" role="alert">{state.message}</p>}
      <button className="button-primary" type="submit" disabled={pending || !startedAt}>
        {pending ? 'Enviando…' : 'Enviar mensaje'} <span aria-hidden="true">→</span>
      </button>
    </form>
  );
};
