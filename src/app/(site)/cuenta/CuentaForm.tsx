'use client';

import { useActionState, useEffect, useState } from 'react';
import { keepFormOnSubmit } from '@/lib/use-keep-form';
import { entrar, registrarse, type CuentaState } from './actions';

const INITIAL_STATE: CuentaState = {};

// Formulario de registro o de entrada para visitantes. `siguiente` es la página a la que
// se vuelve después (por ejemplo, el proyecto donde iba a comentar).
export const CuentaForm = ({ modo, siguiente }: { modo: 'registro' | 'entrar'; siguiente: string }) => {
  const [state, action, pending] = useActionState(modo === 'registro' ? registrarse : entrar, INITIAL_STATE);
  // Momento en que se abrió el formulario (filtro anti-bots); se fija en el navegador.
  const [startedAt, setStartedAt] = useState('');
  useEffect(() => setStartedAt(String(Date.now())), []);
  const registro = modo === 'registro';

  return (
    <form className="contact-form cuenta-form" action={action} onSubmit={keepFormOnSubmit(action)}>
      {registro && (
        <label>
          <span className="meta">Nombre (así aparecerá en tus comentarios)</span>
          <input name="nombre" type="text" autoComplete="name" maxLength={60} required />
        </label>
      )}
      <label>
        <span className="meta">Correo</span>
        <input name="correo" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={254} required />
      </label>
      <label>
        <span className="meta">Contraseña{registro && ' (mínimo 8 caracteres)'}</span>
        <input name="password" type="password" autoComplete={registro ? 'new-password' : 'current-password'} minLength={registro ? 8 : undefined} maxLength={200} required />
      </label>
      {registro && (
        <label>
          <span className="meta">Repite la contraseña</span>
          <input name="confirmacion" type="password" autoComplete="new-password" minLength={8} maxLength={200} required />
        </label>
      )}
      {registro && (
        <>
          {/* Trampa para bots: invisible para personas y lectores de pantalla. */}
          <div className="contact-trap" aria-hidden="true">
            <label>No llenar <input name="empresa_web" type="text" tabIndex={-1} autoComplete="off" /></label>
          </div>
          <input type="hidden" name="t" value={startedAt} />
        </>
      )}
      <input type="hidden" name="siguiente" value={siguiente} />
      {state.error && <p className="contact-error" role="alert">{state.error}</p>}
      <button className="button-primary" type="submit" disabled={pending || (registro && !startedAt)}>
        {pending ? (registro ? 'Creando cuenta…' : 'Entrando…') : registro ? 'Crear cuenta' : 'Entrar'} <span aria-hidden="true">→</span>
      </button>
    </form>
  );
};
