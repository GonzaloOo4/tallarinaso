import { requireAdmin } from '@/lib/auth/session';
import { PasswordForm } from './PasswordForm';

export default async function CuentaPage() {
  const { user } = await requireAdmin();
  return (
    <section className="glass-panel admin-card admin-narrow" aria-labelledby="cuenta-title">
      <p className="admin-eyebrow">Mi cuenta</p>
      <h1 id="cuenta-title">Cambiar contraseña</h1>
      <p className="admin-muted">Usuario: {user.usuario}</p>
      <PasswordForm />
    </section>
  );
}
