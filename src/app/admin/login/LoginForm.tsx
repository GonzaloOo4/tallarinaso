'use client';

import { useActionState } from 'react';
import { signIn, type LoginState } from '../actions';

const INITIAL_STATE: LoginState = {};

export const LoginForm = () => {
  const [state, action, pending] = useActionState(signIn, INITIAL_STATE);
  return (
    <form className="admin-form" action={action}>
      <label>
        <span>Usuario</span>
        <input name="usuario" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} required />
      </label>
      <label>
        <span>Contraseña</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.error && <p className="admin-error" role="alert">{state.error}</p>}
      <button className="admin-button" type="submit" disabled={pending}>{pending ? 'Entrando…' : 'Entrar'}</button>
    </form>
  );
};
