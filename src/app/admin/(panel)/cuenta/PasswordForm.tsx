'use client';

import { useActionState } from 'react';
import { changePassword, type PasswordState } from '../../actions';

const INITIAL_STATE: PasswordState = {};

export const PasswordForm = () => {
  const [state, action, pending] = useActionState(changePassword, INITIAL_STATE);
  return (
    <form className="admin-form" action={action}>
      <label>
        <span>Contraseña actual</span>
        <input name="actual" type="password" autoComplete="current-password" required />
      </label>
      <label>
        <span>Nueva contraseña (mínimo 12 caracteres)</span>
        <input name="nueva" type="password" autoComplete="new-password" minLength={12} required />
      </label>
      <label>
        <span>Repite la nueva contraseña</span>
        <input name="confirmacion" type="password" autoComplete="new-password" minLength={12} required />
      </label>
      {state.error && <p className="admin-error" role="alert">{state.error}</p>}
      {state.ok && <p className="admin-success" role="status">Contraseña actualizada. Se cerraron tus otras sesiones.</p>}
      <button className="admin-button" type="submit" disabled={pending}>{pending ? 'Guardando…' : 'Guardar contraseña'}</button>
    </form>
  );
};
