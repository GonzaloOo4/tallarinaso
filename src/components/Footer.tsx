import type { Sitio } from '@data/_schema/sitio.schema';
import { Monogram } from './Monogram';

// Cierre del recorrido en tres columnas: firma (GZ), lugar centrado y volver arriba.
// El correo ya está en Contacto, justo encima.
export const Footer = ({ sitio }: { sitio: Sitio }) => {
  const ciudad = sitio.ubicacion?.split(',')[0]?.trim();
  return (
    <footer className="site-footer">
      <Monogram className="footer-monogram" />
      <p className="footer-made">{ciudad ? `Hecho en ${ciudad}` : [sitio.nombre, sitio.apellido].filter(Boolean).join(' ')}</p>
      <a className="footer-top" href="#" aria-label="Volver arriba" title="Volver arriba"><span aria-hidden="true">↑</span></a>
    </footer>
  );
};
