import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { LoginForm } from './LoginForm';

export default async function LoginPage() {
  if (await getSessionUser()) redirect('/admin');

  return (
    <main className="admin-login">
      <section className="glass-panel admin-card" aria-labelledby="login-title">
        <p className="admin-eyebrow">Panel</p>
        <h1 id="login-title">Iniciar sesión</h1>
        <LoginForm />
      </section>
    </main>
  );
}
