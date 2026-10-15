import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/session';
import { signOut } from '../actions';

export default async function PanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user } = await requireAdmin();
  return (
    <>
      <header className="glass-panel admin-header">
        <Link className="admin-brand" href="/admin">Panel</Link>
        <div className="admin-session">
          <span>{user.nombre ?? user.usuario}</span>
          <Link href="/admin/cuenta">Cambiar contraseña</Link>
          <Link href="/">Ver sitio</Link>
          <form action={signOut}><button className="admin-link-button" type="submit">Cerrar sesión</button></form>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </>
  );
}
