import { getCuadrosPublicados } from '@/lib/portfolio';
import { requireAdmin } from '@/lib/auth/session';
import { deleteComment, setCommentStatus } from '../actions';

export const dynamic = 'force-dynamic';

type Stat = { project_slug: string; views: number; likes: number; pending_comments: number; approved_comments: number };
type Comment = { id: number; project_slug: string; author_name: string; body: string; status: string; created_at: string };

const STATUS_LABEL: Record<string, string> = { pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado' };
const dateFormat = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

export default async function AdminDashboard() {
  const { db } = await requireAdmin();
  const [cuadros, statsResult, commentsResult] = await Promise.all([
    getCuadrosPublicados(),
    db.from('project_stats').select('*').returns<Stat[]>(),
    db.from('project_comments').select('id, project_slug, author_name, body, status, created_at')
      .order('created_at', { ascending: false }).limit(50).returns<Comment[]>(),
  ]);

  if (statsResult.error || commentsResult.error) {
    return <p className="admin-error" role="alert">No se pudieron cargar los datos de Supabase.</p>;
  }

  const titles = new Map(cuadros.map((cuadro) => [cuadro.slug, cuadro.titulo]));
  const statsBySlug = new Map(statsResult.data.map((stat) => [stat.project_slug, stat]));
  const slugs = [...new Set([...titles.keys(), ...statsBySlug.keys()])];
  const rows = slugs.map((slug) => ({
    slug,
    title: titles.get(slug) ?? slug,
    views: Number(statsBySlug.get(slug)?.views ?? 0),
    likes: Number(statsBySlug.get(slug)?.likes ?? 0),
    pending: Number(statsBySlug.get(slug)?.pending_comments ?? 0),
    approved: Number(statsBySlug.get(slug)?.approved_comments ?? 0),
  }));
  const totals = rows.reduce((sum, row) => ({
    views: sum.views + row.views, likes: sum.likes + row.likes, pending: sum.pending + row.pending,
  }), { views: 0, likes: 0, pending: 0 });
  const comments = commentsResult.data;

  return (
    <>
      <section className="admin-stats" aria-label="Resumen">
        <div className="glass-panel admin-stat"><span>Vistas</span><strong>{totals.views}</strong></div>
        <div className="glass-panel admin-stat"><span>Likes</span><strong>{totals.likes}</strong></div>
        <div className="glass-panel admin-stat"><span>Comentarios pendientes</span><strong>{totals.pending}</strong></div>
      </section>

      <section className="glass-panel admin-card" aria-labelledby="proyectos-title">
        <h2 id="proyectos-title">Interacción por proyecto</h2>
        {rows.length === 0 ? <p className="admin-muted">Aún no hay proyectos ni interacciones.</p> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th scope="col">Proyecto</th><th scope="col">Vistas</th><th scope="col">Likes</th><th scope="col">Pendientes</th><th scope="col">Aprobados</th></tr></thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.slug}><th scope="row">{row.title}</th><td>{row.views}</td><td>{row.likes}</td><td>{row.pending}</td><td>{row.approved}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="glass-panel admin-card" aria-labelledby="comentarios-title">
        <h2 id="comentarios-title">Comentarios recientes</h2>
        {comments.length === 0 ? <p className="admin-muted">Todavía no hay comentarios.</p> : (
          <ul className="admin-comments">
            {comments.map((comment) => (
              <li key={comment.id} className="admin-comment">
                <div className="admin-comment-meta">
                  <strong>{comment.author_name}</strong>
                  <span>{titles.get(comment.project_slug) ?? comment.project_slug}</span>
                  <span>{dateFormat.format(new Date(comment.created_at))}</span>
                  <span className={`admin-badge admin-badge-${comment.status}`}>{STATUS_LABEL[comment.status] ?? comment.status}</span>
                </div>
                <p>{comment.body}</p>
                <div className="admin-actions">
                  {comment.status !== 'approved' && (
                    <form action={setCommentStatus}><input type="hidden" name="id" value={comment.id} /><input type="hidden" name="status" value="approved" /><button className="admin-button" type="submit">Aprobar</button></form>
                  )}
                  {comment.status !== 'rejected' && (
                    <form action={setCommentStatus}><input type="hidden" name="id" value={comment.id} /><input type="hidden" name="status" value="rejected" /><button className="admin-link-button" type="submit">Rechazar</button></form>
                  )}
                  <form action={deleteComment}><input type="hidden" name="id" value={comment.id} /><button className="admin-link-button admin-danger" type="submit">Eliminar</button></form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
