import type { Sitio } from '@data/_schema/sitio.schema';

export const Footer = ({ sitio }: { sitio: Sitio }) => <footer className="site-footer">
  <span>{sitio.nombre} · {new Date().getFullYear()}</span>
  <div className="footer-links">{sitio.canales.map((canal) => <a className="editorial-link" href={canal.url} key={canal.url}>{canal.etiqueta}</a>)}</div>
</footer>;